using MediatR;
using FluxCommerce.Api.Application.Commands;
using FluxCommerce.Api.Services;

namespace FluxCommerce.Api.Application.Handlers;

public class ProcessChatRequestCommandHandler : IRequestHandler<ProcessChatRequestCommand, string>
{
    private readonly IChatService _chatService;

    public ProcessChatRequestCommandHandler(IChatService chatService)
    {
        _chatService = chatService;
    }

    public async Task<string> Handle(ProcessChatRequestCommand request, CancellationToken cancellationToken)
    {
        return await _chatService.ProcessChatMessageAsync(
            request.Message,
            request.UserId,
            request.StoreId,
            cancellationToken
        );
    }
}