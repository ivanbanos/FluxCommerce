using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using MediatR;
using FluxCommerce.Api.Application.Commands.Chat;

namespace FluxCommerce.Api.Services;

public class ChatService
{
    private readonly Kernel _kernel;
    private readonly IChatCompletionService _chatService;
    private readonly IMediator _mediator;

    public ChatService(Kernel kernel, IMediator mediator)
    {
        _kernel = kernel;
        _chatService = kernel.GetRequiredService<IChatCompletionService>();
        _mediator = mediator;
    }

    public async Task<string> ProcessUserMessageAsync(string message, string userId, string storeId)
    {
        return await _mediator.Send(new ProcessChatMessageCommand(message, userId, storeId));
    }
}