using FluxCommerce.Api.Services;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using FluxCommerce.Api.Application.Queries;
using MediatR;
using System.Text.Json;
using System.IO;

namespace FluxCommerce.Api.Services;

public class ChatService : IChatService
{
    private readonly Kernel _kernel;
    private readonly IChatCompletionService _chatCompletionService;
    private readonly IMediator _mediator;
    private readonly string _systemPrompt;
    private readonly Microsoft.AspNetCore.SignalR.IHubContext<FluxCommerce.Api.Hubs.ChatHub> _hubContext;

    public ChatService(Kernel kernel, IMediator mediator, Microsoft.AspNetCore.SignalR.IHubContext<FluxCommerce.Api.Hubs.ChatHub> hubContext)
    {
        _kernel = kernel;
        _chatCompletionService = kernel.GetRequiredService<IChatCompletionService>();
        _mediator = mediator;
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
        var chatHistory = new ChatHistory();
        // Prefer external prompt file but fallback to the embedded default
        if (!string.IsNullOrEmpty(_systemPrompt))
        {
            chatHistory.AddSystemMessage(_systemPrompt);
        }
        else
        {
            chatHistory.AddSystemMessage(@"
            Eres un asistente de compras útil para FluxCommerce, una tienda de comercio electrónico.
            
            REGLAS CRÍTICAS - NUNCA ROMPAS ESTAS REGLAS:
            1. NUNCA inventes productos que no existen
            2. NUNCA muestres productos sin buscarlos primero en la base de datos
            3. SOLO usa las acciones definidas: search, add_to_cart, view_cart, message
            4. SIEMPRE busca en la base de datos antes de mostrar productos
            
            INSTRUCCIONES:
            - SIEMPRE responde ÚNICAMENTE con JSON válido
            - NO agregues texto fuera del JSON
            - NO inventes datos de productos
            
            ACCIONES PERMITIDAS (SOLO ESTAS):
            
            Para buscar productos (OBLIGATORIO antes de mostrar cualquier producto):
            {""action"": ""search"", ""query"": ""término_de_búsqueda"", ""message"": ""Voy a buscar esos productos para ti""}
            
            Para agregar al carrito:
            {""action"": ""add_to_cart"", ""product_id"": ""ID_REAL_del_producto"", ""quantity"": 1, ""message"": ""Agregando producto al carrito""}
            
            Para ver carrito:
            {""action"": ""view_cart"", ""message"": ""Mostrando tu carrito""}
            
            Para respuesta normal:
            {""action"": ""message"", ""message"": ""Tu_respuesta""}
            
            EJEMPLOS CORRECTOS:
            Usuario: 'Muéstrame cubos rubik'
            Respuesta: {""action"": ""search"", ""query"": ""cubo rubik"", ""message"": ""Voy a buscar cubos rubik disponibles para ti""}
            
            Usuario: 'Qué productos tienes de juegos'
            Respuesta: {""action"": ""search"", ""query"": ""juegos"", ""message"": ""Te voy a mostrar los juegos disponibles""}
            
            NUNCA HAGAS ESTO (EJEMPLO INCORRECTO):
            {""action"": ""view_products"", ""products"": [...]}  ← ESTO ESTÁ PROHIBIDO
            
            RECUERDA: Siempre busca primero, nunca inventes productos.
        ");
        }

        chatHistory.AddUserMessage(message);

        var result = await _chatCompletionService.GetChatMessageContentAsync(chatHistory, cancellationToken: cancellationToken);
        var aiResponse = result.Content ?? "{\"action\": \"message\", \"message\": \"Lo siento, no pude procesar tu solicitud.\"}";

        // Optionally send a typing/partial message to the client if the AI produced an interim message
        try
        {
            // Try to parse the aiResponse quickly to extract a short message to show
            var quickJson = System.Text.Json.JsonSerializer.Deserialize<AIResponse>(aiResponse, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (quickJson != null && !string.IsNullOrEmpty(quickJson.Message))
            {
                // Send intermediate message to the user's group
                await _hubContext.Clients.Group(userId).SendCoreAsync("ReceiveMessage", new object[] { new { sender = "assistant", text = quickJson.Message, timestamp = DateTime.UtcNow } }, cancellationToken);
            }
        }
        catch { /* ignore parsing errors for quick notify */ }

        // Process the AI response and execute actions (this will also send final structured messages via hub)
        var processedResponse = await ProcessAIResponse(aiResponse, userId, storeId, cancellationToken);

        Console.WriteLine($"💬 DEBUG: Final response to user: '{processedResponse}'");
        return processedResponse;
    }

    public async Task<List<ProductSearchResult>> SearchProductsAsync(string query, string storeId, CancellationToken cancellationToken = default)
    {
        try
        {
            Console.WriteLine($"🔎 DEBUG: Starting product search with query: '{query}', storeId: '{storeId}'");

            var searchQuery = new SearchProductsQuery
            {
                SearchTerm = query,
                StoreId = storeId
            };

            Console.WriteLine($"📨 DEBUG: Sending MediatR query: SearchTerm='{searchQuery.SearchTerm}', StoreId='{searchQuery.StoreId}'");
            var products = await _mediator.Send(searchQuery, cancellationToken);
            Console.WriteLine($"📦 DEBUG: Received {products.Count} products from handler");

            // Convert to structured results
            var searchResults = products.Take(10).Select(p => new ProductSearchResult
            {
                Id = p.Id ?? "",
                Name = p.Name ?? "",
                Description = p.Description ?? "",
                Price = p.Price,
            }).ToList();

            Console.WriteLine($"📝 DEBUG: Converted to {searchResults.Count} search results");
            return searchResults;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"💥 DEBUG: Error in SearchProductsAsync: {ex.Message}");
            Console.WriteLine($"💥 DEBUG: Stack trace: {ex.StackTrace}");
            return new List<ProductSearchResult>();
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

                if (firstTryResponse?.Action == "message" && !string.IsNullOrEmpty(firstTryResponse.Message))
                {
                    Console.WriteLine($"🔍 DEBUG: Detected nested JSON, attempting to parse Message field...");

                    // Try to parse the Message field as JSON
                    try
                    {
                        jsonResponse = JsonSerializer.Deserialize<AIResponse>(firstTryResponse.Message, jsonOptions);
                        Console.WriteLine($"✅ DEBUG: Successfully parsed nested JSON: Action='{jsonResponse?.Action}', Query='{jsonResponse?.Query}'");
                    }
                    catch (JsonException)
                    {
                        jsonResponse = firstTryResponse;
                    }
                }
                else
                {
                    jsonResponse = firstTryResponse;
                    Console.WriteLine($"✅ DEBUG: Using direct parse result: Action='{jsonResponse?.Action}', Query='{jsonResponse?.Query}'");
                }
            }
            catch (JsonException ex)
            {
                Console.WriteLine($"❌ DEBUG: Failed to parse AI response as JSON: {ex.Message}");

                if (aiResponse.Contains("\"action\""))
                {
                    Console.WriteLine($"🔍 DEBUG: Attempting regex extraction...");
                    try
                    {
                        var startIndex = aiResponse.IndexOf("{");
                        if (startIndex >= 0)
                        {
                            var endIndex = aiResponse.LastIndexOf("}");
                            if (endIndex > startIndex)
                            {
                                var extractedJson = aiResponse.Substring(startIndex, endIndex - startIndex + 1);
                                Console.WriteLine($"🔍 DEBUG: Extracted JSON: '{extractedJson}'");
                                jsonResponse = JsonSerializer.Deserialize<AIResponse>(extractedJson, jsonOptions);
                                Console.WriteLine($"✅ DEBUG: Successfully parsed extracted JSON: Action='{jsonResponse?.Action}'");
                            }
                        }
                    }
                    catch (Exception extractEx)
                    {
                        Console.WriteLine($"❌ DEBUG: Failed to extract JSON: {extractEx.Message}");
                    }
                }
            }

            if (jsonResponse == null)
            {
                Console.WriteLine($"⚠️ DEBUG: All parsing attempts failed, treating as regular message");
                return JsonSerializer.Serialize(new AIResponse
                {
                    Action = "message",
                    Message = aiResponse
                });
            }

            Console.WriteLine($"🎯 DEBUG: Processing action: '{jsonResponse.Action}' with query: '{jsonResponse.Query}'");

            switch (jsonResponse.Action?.ToLower())
            {
                case "search":
                    Console.WriteLine($"🔍 DEBUG: Executing search for query: '{jsonResponse.Query}', storeId: '{storeId}'");
                    var products = await SearchProductsAsync(jsonResponse.Query ?? "", storeId, cancellationToken);
                    Console.WriteLine($"📊 DEBUG: Search completed, found {products.Count} products");

                    var searchPayload = new
                    {
                        Action = "search_results",
                        Query = jsonResponse.Query,
                        Products = products,
                        Message = $"Encontré {products.Count} productos relacionados con '{jsonResponse.Query}'"
                    };

                    // Send structured result to client via SignalR
                    await _hubContext.Clients.Group(userId).SendCoreAsync("ReceiveAction", new object[] { searchPayload }, cancellationToken);

                    return JsonSerializer.Serialize(searchPayload);

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
                    var viewPayload = new AIResponse
                    {
                        Action = "view_cart",
                        Message = jsonResponse.Message ?? "Aquí tienes tu carrito:"
                    };
                    await _hubContext.Clients.Group(userId).SendCoreAsync("ReceiveAction", new object[] { viewPayload }, cancellationToken);
                    return JsonSerializer.Serialize(viewPayload);

                default:
                    Console.WriteLine($"⚠️ DEBUG: Unknown/invalid action received: '{jsonResponse.Action}'");
                    var fallback = new AIResponse
                    {
                        Action = "message",
                        Message = "Lo siento, hubo un error procesando tu solicitud. ¿Podrías reformular tu pregunta?"
                    };
                    await _hubContext.Clients.Group(userId).SendCoreAsync("ReceiveAction", new object[] { fallback }, cancellationToken);
                    return JsonSerializer.Serialize(fallback);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"💥 DEBUG: Error processing AI response: {ex.Message}");
            Console.WriteLine($"💥 DEBUG: Stack trace: {ex.StackTrace}");
            return JsonSerializer.Serialize(new AIResponse
            {
                Action = "message",
                Message = "Lo siento, ocurrió un error al procesar tu solicitud."
            });
        }
    }
}