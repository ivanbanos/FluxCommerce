using FluxCommerce.Api.Application.Commands;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FluxCommerce.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MerchantController : ControllerBase
    {
        private readonly IMediator _mediator;
        public MerchantController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterMerchantCommand command)
        {
            return Ok(await _mediator.Send(command));
        }
    }
}
