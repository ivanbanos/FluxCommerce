using Microsoft.AspNetCore.SignalR;
using FluxCommerce.Api.Services;

namespace FluxCommerce.Api.Hubs;

public class ChatHub : Hub
{
    private readonly IChatService _chatService;

    public ChatHub(IChatService chatService)
    {
        _chatService = chatService;
    }

    public override async Task OnConnectedAsync()
    {
        Console.WriteLine($"[ChatHub] Connection established: {Context.ConnectionId}");
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        Console.WriteLine($"[ChatHub] Connection disconnected: {Context.ConnectionId}");
        await base.OnDisconnectedAsync(exception);
    }

    // Client calls this to join a group for the given userId
    public async Task JoinGroup(string userId)
    {
        if (string.IsNullOrEmpty(userId)) return;
        await Groups.AddToGroupAsync(Context.ConnectionId, userId);
        Console.WriteLine($"[ChatHub] Connection {Context.ConnectionId} joined group {userId}");
    }

    // Client can invoke this to send a message; the ChatService will process and use hub context to push updates
    public async Task SendMessage(string userId, string message, string storeId)
    {
        // Delegate processing to ChatService which will push updates to the group
        await _chatService.ProcessChatMessageAsync(message, userId, storeId);
    }
}
