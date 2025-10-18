using MediatR;

namespace FluxCommerce.Api.Application.Commands;

public class ProcessChatRequestCommand : IRequest<string>
{
    public string Message { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string StoreId { get; set; } = string.Empty;
}