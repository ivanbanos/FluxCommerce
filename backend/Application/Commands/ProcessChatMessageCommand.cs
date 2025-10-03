using MediatR;

namespace FluxCommerce.Api.Application.Commands.Chat;

public record ProcessChatMessageCommand(
    string Message,
    string UserId,
    string StoreId
) : IRequest<string>;