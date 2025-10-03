using Microsoft.AspNetCore.Mvc;
using FluxCommerce.Api.Services;

namespace FluxCommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly ChatService _chatService;

    public ChatController(ChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpPost("message")]
    public async Task<IActionResult> SendMessage([FromBody] ChatRequest request)
    {
        try
        {
            var response = await _chatService.ProcessUserMessageAsync(
                request.Message,
                request.UserId,
                request.StoreId
            );

            return Ok(new { Response = response });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }
}

public record ChatRequest(string Message, string UserId, string StoreId);