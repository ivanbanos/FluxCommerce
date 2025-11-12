using FluxCommerce.Api.Services;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using FluxCommerce.Api.Application.Queries;
using MediatR;
using System.Text.Json;
using System.IO;
using FluxCommerce.Api.Models;

namespace FluxCommerce.Api.Services;

public class ChatService : IChatService
{
    private readonly Kernel _kernel;
    private readonly IChatCompletionService _chatCompletionService;
    private readonly IMediator _mediator;
    private readonly IVectorSearchService _vectorSearchService;
    private readonly string _systemPrompt;
    private readonly Microsoft.AspNetCore.SignalR.IHubContext<FluxCommerce.Api.Hubs.ChatHub> _hubContext;

    public ChatService(
        Kernel kernel, 
        IMediator mediator, 
        IVectorSearchService vectorSearchService,
        Microsoft.AspNetCore.SignalR.IHubContext<FluxCommerce.Api.Hubs.ChatHub> hubContext)
    {
        _kernel = kernel;
        _chatCompletionService = kernel.GetRequiredService<IChatCompletionService>();
        _mediator = mediator;
        _vectorSearchService = vectorSearchService;
        _hubContext = hubContext;

        // Load system prompt from external file if available, otherwise use a built-in fallback
        try
        {
            var promptPath = Path.Combine(Directory.GetCurrentDirectory(), "Services", "Prompts", "chat_prompt.txt");
            if (File.Exists(promptPath))
            {
                _systemPrompt = File.ReadAllText(promptPath);
            }
            else
            {
                _systemPrompt = null!; // will be replaced by fallback in ProcessChatMessageAsync
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️ Warning: Unable to read chat prompt file: {ex.Message}");
            _systemPrompt = null!;
        }
    }

    public async Task<string> ProcessChatMessageAsync(string message, string userId, string storeId, CancellationToken cancellationToken = default)
    {
        Console.WriteLine($"💬 DEBUG: Processing chat message from user {userId}: '{message}'");

        // Use external prompt if available, otherwise fallback
        var systemPrompt = !string.IsNullOrEmpty(_systemPrompt) ? _systemPrompt : GetFallbackSystemPrompt();

        try
        {
            var chatHistory = new Microsoft.SemanticKernel.ChatCompletion.ChatHistory();
            chatHistory.AddSystemMessage(systemPrompt);
            chatHistory.AddUserMessage(message);

            Console.WriteLine($"🤖 DEBUG: Sending request to AI model...");
            var response = await _chatCompletionService.GetChatMessageContentAsync(chatHistory, cancellationToken: cancellationToken);
            
            var aiResponse = response.Content ?? "No pude generar una respuesta. ¿Podrías reformular tu mensaje?";
            Console.WriteLine($"🤖 DEBUG: AI Response received: '{aiResponse}'");

            // Try to parse as JSON for quick notifications
            try
            {
                var quickJson = JsonSerializer.Deserialize<AIResponse>(aiResponse);
                if (!string.IsNullOrEmpty(quickJson?.Message))
                {
                    await _hubContext.Clients.Group(userId).SendCoreAsync("ReceiveMessage", new object[] 
                    { 
                        new { text = quickJson.Message, timestamp = DateTime.UtcNow } 
                    }, cancellationToken);
                }
            }
            catch { /* ignore parsing errors for quick notify */ }

            // Process the AI response and execute actions (this will also send final structured messages via hub)
            var processedResponse = await ProcessAIResponse(aiResponse, userId, storeId, cancellationToken);

            Console.WriteLine($"💬 DEBUG: Final response to user: '{processedResponse}'");
            return processedResponse;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"💥 DEBUG: Error in ProcessChatMessageAsync: {ex.Message}");
            Console.WriteLine($"💥 DEBUG: Stack trace: {ex.StackTrace}");
            return JsonSerializer.Serialize(new { Error = "Hubo un problema procesando tu mensaje. ¿Podrías intentar de nuevo?" });
        }
    }

    private async Task<string> ProcessAIResponse(string aiResponse, string userId, string storeId, CancellationToken cancellationToken)
    {
        try
        {
            Console.WriteLine($"🔄 DEBUG: Processing AI Response: '{aiResponse}'");

            // Configure JsonSerializer options for case-insensitive matching
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            AIResponse? jsonResponse = null;

            try
            {
                var firstTryResponse = JsonSerializer.Deserialize<AIResponse>(aiResponse, jsonOptions);
                Console.WriteLine($"🔍 DEBUG: First parse attempt: Action='{firstTryResponse?.Action}', Message='{firstTryResponse?.Message}', Query='{firstTryResponse?.Query}'");

                if (firstTryResponse?.Action != null)
                {
                    jsonResponse = firstTryResponse;
                }
            }
            catch (JsonException ex)
            {
                Console.WriteLine($"⚠️ DEBUG: Initial JSON parsing failed: {ex.Message}");
            }

            // If parsing fails, try to extract from potential markdown code block
            if (jsonResponse?.Action == null && aiResponse.Contains("```"))
            {
                Console.WriteLine($"🔧 DEBUG: Attempting to extract JSON from markdown code block...");
                var startIndex = aiResponse.IndexOf("```json");
                if (startIndex == -1) startIndex = aiResponse.IndexOf("```");
                
                if (startIndex != -1)
                {
                    startIndex = aiResponse.IndexOf("{", startIndex);
                    var endIndex = aiResponse.LastIndexOf("}");
                    
                    if (startIndex != -1 && endIndex != -1 && endIndex > startIndex)
                    {
                        var jsonContent = aiResponse.Substring(startIndex, endIndex - startIndex + 1);
                        Console.WriteLine($"🔧 DEBUG: Extracted JSON: '{jsonContent}'");
                        
                        try
                        {
                            jsonResponse = JsonSerializer.Deserialize<AIResponse>(jsonContent, jsonOptions);
                            Console.WriteLine($"🔍 DEBUG: Extracted parse: Action='{jsonResponse?.Action}', Message='{jsonResponse?.Message}', Query='{jsonResponse?.Query}'");
                        }
                        catch (JsonException ex)
                        {
                            Console.WriteLine($"⚠️ DEBUG: Extracted JSON parsing also failed: {ex.Message}");
                        }
                    }
                }
            }

            // If we still don't have a valid action, return a generic response
            if (string.IsNullOrEmpty(jsonResponse?.Action))
            {
                Console.WriteLine($"⚠️ DEBUG: No valid action found, returning generic response");
                return JsonSerializer.Serialize(new { Action = "generic_response", Message = aiResponse });
            }

            var action = jsonResponse.Action?.ToLower();
            Console.WriteLine($"🎯 DEBUG: Processing action: '{action}' with query: '{jsonResponse.Query}'");

            switch (action)
            {
                case "search":
                case "search_products":
                    Console.WriteLine($"🔍 DEBUG: Executing VECTOR search for query: '{jsonResponse.Query}', storeId: '{storeId}'");
                    var vectorResults = await _vectorSearchService.SearchProductsAsync(jsonResponse.Query ?? "", storeId, 10);
                    Console.WriteLine($"📊 DEBUG: Vector search completed, found {vectorResults.Count} products");

                    // Send intermediate message first
                    if (!string.IsNullOrEmpty(jsonResponse.Message))
                    {
                        await _hubContext.Clients.Group(userId).SendCoreAsync("ReceiveMessage", new object[] 
                        { 
                            new { text = jsonResponse.Message, timestamp = DateTime.UtcNow } 
                        }, cancellationToken);
                    }

                    // Process and send results based on quantity and relevance
                    await ProcessVectorSearchResults(vectorResults, jsonResponse.Query ?? "", userId, cancellationToken);

                    return JsonSerializer.Serialize(new { Action = "search_completed", ProductCount = vectorResults.Count });

                case "add_to_cart":
                    Console.WriteLine($"🛒 DEBUG: Processing add to cart: ProductId='{jsonResponse.ProductId}', Quantity={jsonResponse.Quantity}");
                    var addPayload = new AIResponse
                    {
                        Action = "add_to_cart",
                        ProductId = jsonResponse.ProductId,
                        Quantity = jsonResponse.Quantity ?? 1,
                        Message = jsonResponse.Message ?? "Perfecto, voy a agregar ese producto a tu carrito."
                    };

                    await _hubContext.Clients.Group(userId).SendCoreAsync("ReceiveAction", new object[] { addPayload }, cancellationToken);

                    return JsonSerializer.Serialize(addPayload);

                case "view_cart":
                    Console.WriteLine($"👁️ DEBUG: Processing view cart request");
                    var viewCartPayload = new AIResponse
                    {
                        Action = "view_cart",
                        Message = jsonResponse.Message ?? "Te muestro tu carrito de compras."
                    };

                    await _hubContext.Clients.Group(userId).SendCoreAsync("ReceiveAction", new object[] { viewCartPayload }, cancellationToken);

                    return JsonSerializer.Serialize(viewCartPayload);

                default:
                    Console.WriteLine($"❓ DEBUG: Unknown action '{action}', returning generic message");
                    var genericPayload = new AIResponse
                    {
                        Action = "generic_response",
                        Message = jsonResponse.Message ?? aiResponse
                    };

                    await _hubContext.Clients.Group(userId).SendCoreAsync("ReceiveMessage", new object[] 
                    { 
                        new { text = genericPayload.Message, timestamp = DateTime.UtcNow } 
                    }, cancellationToken);

                    return JsonSerializer.Serialize(genericPayload);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"💥 DEBUG: Error in ProcessAIResponse: {ex.Message}");
            Console.WriteLine($"💥 DEBUG: Stack trace: {ex.StackTrace}");
            return JsonSerializer.Serialize(new { Action = "error", Message = "Hubo un problema procesando tu solicitud. ¿Podrías intentar de nuevo?" });
        }
    }

    private async Task ProcessVectorSearchResults(List<ProductSearchResult> vectorResults, string query, string userId, CancellationToken cancellationToken)
    {
        try
        {
            if (vectorResults.Count == 0)
            {
                // No results - suggest alternatives
                var noResultsMessage = GenerateNoResultsSuggestion(query);
                await _hubContext.Clients.Group(userId).SendCoreAsync("ReceiveMessage", new object[] 
                { 
                    new { text = noResultsMessage, timestamp = DateTime.UtcNow } 
                }, cancellationToken);
            }
            else if (vectorResults.Count == 1)
            {
                // Single result - direct recommendation
                var result = vectorResults[0];
                var product = result.Product;
                var singleProductMessage = $"Perfecto! Encontré exactamente lo que necesitas:\n\n" +
                    $"🛍️ **{product.Name}**\n" +
                    $"💰 Precio: ${product.Price:F2}\n" +
                    $"🎯 Relevancia: {result.SimilarityScore:F1}%\n" +
                    $"📝 {product.Description}\n\n" +
                    $"¿Te gustaría agregarlo al carrito? Solo dime 'agregar al carrito' y yo me encargo.";

                await _hubContext.Clients.Group(userId).SendCoreAsync("ReceiveMessage", new object[] 
                { 
                    new { text = singleProductMessage, timestamp = DateTime.UtcNow } 
                }, cancellationToken);

                // Also send the structured action for the frontend to handle
                var singleProductPayload = new
                {
                    action = "single_recommendation",
                    product = new
                    {
                        id = product.Id,
                        name = product.Name,
                        description = product.Description,
                        price = product.Price,
                        imageUrl = product.Images?.FirstOrDefault(),
                        similarityScore = result.SimilarityScore
                    },
                    query = query,
                    message = "Producto recomendado encontrado"
                };

                await _hubContext.Clients.Group(userId).SendCoreAsync("ReceiveAction", new object[] { singleProductPayload }, cancellationToken);
            }
            else if (vectorResults.Count <= 5)
            {
                // Multiple good options - show comparative list
                var multipleMessage = $"Encontré {vectorResults.Count} excelentes opciones para '{query}':\n\n";
                
                for (int i = 0; i < vectorResults.Count; i++)
                {
                    var result = vectorResults[i];
                    var product = result.Product;
                    multipleMessage += $"{i + 1}. **{product.Name}** - ${product.Price:F2} (Relevancia: {result.SimilarityScore:F0}%)\n";
                    if (!string.IsNullOrEmpty(product.Description) && product.Description.Length > 0)
                    {
                        var shortDesc = product.Description.Length > 60 
                            ? product.Description.Substring(0, 60) + "..." 
                            : product.Description;
                        multipleMessage += $"   {shortDesc}\n";
                    }
                    multipleMessage += $"   ID: {product.Id}\n\n";
                }

                multipleMessage += "¿Cuál te interesa más? Puedes decirme el nombre del producto o su número para agregarlo al carrito.";

                await _hubContext.Clients.Group(userId).SendCoreAsync("ReceiveMessage", new object[] 
                { 
                    new { text = multipleMessage, timestamp = DateTime.UtcNow } 
                }, cancellationToken);

                // Send structured data for frontend processing
                var multipleProductsPayload = new
                {
                    action = "multiple_options",
                    products = vectorResults.Select(r => new
                    {
                        id = r.Product.Id,
                        name = r.Product.Name,
                        description = r.Product.Description,
                        price = r.Product.Price,
                        imageUrl = r.Product.Images?.FirstOrDefault(),
                        similarityScore = r.SimilarityScore,
                        matchingTerms = r.MatchingTerms
                    }).ToList(),
                    query = query,
                    message = $"Múltiples opciones encontradas para {query}"
                };

                await _hubContext.Clients.Group(userId).SendCoreAsync("ReceiveAction", new object[] { multipleProductsPayload }, cancellationToken);
            }
            else
            {
                // Too many results - show top 5 and suggest refinement
                var topResults = vectorResults.Take(5).ToList();
                var tooManyMessage = $"¡Wow! Encontré {vectorResults.Count} productos relacionados con '{query}'. " +
                    $"Te muestro los 5 más relevantes:\n\n";

                for (int i = 0; i < topResults.Count; i++)
                {
                    var result = topResults[i];
                    var product = result.Product;
                    tooManyMessage += $"{i + 1}. **{product.Name}** - ${product.Price:F2} ({result.SimilarityScore:F0}%)\n";
                }

                tooManyMessage += $"\n¿Podrías ser más específico sobre qué tipo de {query} buscas? " +
                    "Así podré mostrarte opciones más precisas.";

                await _hubContext.Clients.Group(userId).SendCoreAsync("ReceiveMessage", new object[] 
                { 
                    new { text = tooManyMessage, timestamp = DateTime.UtcNow } 
                }, cancellationToken);

                // Send structured data for frontend 
                var tooManyProductsPayload = new
                {
                    action = "too_many_results",
                    products = topResults.Select(r => new
                    {
                        id = r.Product.Id,
                        name = r.Product.Name,
                        description = r.Product.Description,
                        price = r.Product.Price,
                        imageUrl = r.Product.Images?.FirstOrDefault(),
                        similarityScore = r.SimilarityScore
                    }).ToList(),
                    totalCount = vectorResults.Count,
                    query = query,
                    message = $"Demasiados resultados para {query}, mostrando los más relevantes"
                };

                await _hubContext.Clients.Group(userId).SendCoreAsync("ReceiveAction", new object[] { tooManyProductsPayload }, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"💥 DEBUG: Error in ProcessVectorSearchResults: {ex.Message}");
            
            var errorMessage = "Lo siento, hubo un problema al procesar los resultados de búsqueda. ¿Podrías intentar con otros términos?";
            await _hubContext.Clients.Group(userId).SendCoreAsync("ReceiveMessage", new object[] 
            { 
                new { text = errorMessage, timestamp = DateTime.UtcNow } 
            }, cancellationToken);
        }
    }

    private string GenerateNoResultsSuggestion(string query)
    {
        // Simple implementation - you can enhance this with AI-powered suggestions
        return $"No encontré productos para '{query}'. ¿Podrías intentar con términos más específicos o preguntarme por una categoría diferente? " +
               "Por ejemplo: 'comida', 'medicina', 'tecnología', o 'juguetes'.";
    }

    private string GetFallbackSystemPrompt()
    {
        return @"
Eres un asistente de compras inteligente para FluxCommerce. Tu objetivo es ayudar a los usuarios a encontrar productos, agregar artículos al carrito, y responder preguntas sobre la tienda.

IMPORTANTE: Responde SIEMPRE en formato JSON válido con esta estructura:
{
  ""Action"": ""action_type"",
  ""Message"": ""mensaje_para_usuario"",
  ""Query"": ""terminos_de_busqueda"",
  ""ProductId"": ""id_si_aplica"",
  ""Quantity"": numero_si_aplica
}

ACCIONES DISPONIBLES:
- ""search_products"": Para buscar productos. Incluye Query con términos relevantes
- ""add_to_cart"": Para agregar productos. Incluye ProductId y Quantity
- ""view_cart"": Para mostrar el carrito
- ""generic_response"": Para respuestas generales

EJEMPLOS:

Usuario: ""busco algo para cocinar pasta""
Respuesta: {""Action"": ""search_products"", ""Message"": ""Te ayudo a buscar ingredientes para pasta"", ""Query"": ""pasta ingredientes salsa tomate""}

Usuario: ""necesito medicina para el dolor""
Respuesta: {""Action"": ""search_products"", ""Message"": ""Busco medicamentos para el dolor"", ""Query"": ""paracetamol medicina dolor analgésico""}

Usuario: ""agregar pizza al carrito""
Respuesta: {""Action"": ""search_products"", ""Message"": ""Busco pizza para ti"", ""Query"": ""pizza""}

Usuario: ""quiero ver mi carrito""
Respuesta: {""Action"": ""view_cart"", ""Message"": ""Te muestro tu carrito actual""}

IMPORTANTE: 
- Utiliza búsqueda semántica: para ""dolor de cabeza"" busca ""paracetamol medicina dolor""
- Para múltiples palabras, incluye sinónimos y términos relacionados
- Siempre mantén un tono amigable y servicial
";
    }
}

/// <summary>
/// Clase para representar las respuestas estructuradas del asistente de IA
/// </summary>
public class AIResponse
{
    public string? Action { get; set; }
    public string? Message { get; set; }
    public string? Query { get; set; }
    public string? ProductId { get; set; }
    public int? Quantity { get; set; }
}