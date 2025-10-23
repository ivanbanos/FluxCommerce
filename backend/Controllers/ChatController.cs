using Microsoft.AspNetCore.Mvc;
using MediatR;
using FluxCommerce.Api.Application.Commands;

namespace FluxCommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IMediator _mediator;

    public ChatController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("message")]
    public async Task<IActionResult> SendMessage([FromBody] ChatRequest request)
    {
        try
        {
            var command = new ProcessChatRequestCommand
            {
                Message = request.Message,
                UserId = request.UserId,
                StoreId = request.StoreId
            };

            var response = await _mediator.Send(command);

            return Ok(new { Response = response });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }
}

public record ChatRequest(string Message, string UserId, string StoreId);