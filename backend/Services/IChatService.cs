using FluxCommerce.Api.Models;

namespace FluxCommerce.Api.Services;

public interface IChatService
{
    /// <summary>
    /// Procesa un mensaje de chat del usuario y retorna una respuesta estructurada
    /// </summary>
    /// <param name="message">Mensaje del usuario</param>
    /// <param name="userId">ID del usuario</param>
    /// <param name="storeId">ID de la tienda</param>
    /// <param name="cancellationToken">Token de cancelación</param>
    /// <returns>Respuesta JSON estructurada del asistente de IA</returns>
    Task<string> ProcessChatMessageAsync(string message, string userId, string storeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Busca productos en la base de datos basado en una consulta
    /// </summary>
    /// <param name="query">Término de búsqueda</param>
    /// <param name="storeId">ID de la tienda</param>
    /// <param name="cancellationToken">Token de cancelación</param>
    /// <returns>Lista de productos que coinciden con la búsqueda</returns>
    Task<List<ProductSearchResult>> SearchProductsAsync(string query, string storeId, CancellationToken cancellationToken = default);
}

/// <summary>
/// Clase para representar los resultados de búsqueda de productos
/// </summary>
public class ProductSearchResult
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Category { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
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