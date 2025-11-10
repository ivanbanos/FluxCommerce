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
}