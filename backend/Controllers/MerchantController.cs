

using FluxCommerce.Api.Application.Commands;
using FluxCommerce.Api.Data;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FluxCommerce.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MerchantController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly MongoDbService _mongoDbService;

        public MerchantController(IMediator mediator, MongoDbService mongoDbService)
        {
            _mediator = mediator;
            _mongoDbService = mongoDbService;
        }


        [HttpPut("product/{id}")]
        [RequestSizeLimit(10_000_000)]
        public async Task<IActionResult> UpdateProduct(string id, [FromForm] FluxCommerce.Api.Application.Commands.UpdateProductCommand command)
        {
            command.Id = id;
            var ok = await _mediator.Send(command);
            if (!ok) return NotFound();
            return Ok();
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllMerchants()
        {
            // En producción, validar rol superadmin por JWT
            var result = await _mediator.Send(new FluxCommerce.Api.Application.Queries.GetMerchantsQuery());
            return Ok(result);
        }

        [HttpPost("validate")]
        public async Task<IActionResult> ValidateMerchant([FromBody] FluxCommerce.Api.Application.Commands.ValidateMerchantCommand command)
        {
            // En producción, validar rol superadmin por JWT
            var result = await _mediator.Send(command);
            if (!result) return NotFound();
            return Ok();
        }

        [HttpPost("admin-login")]
        public async Task<IActionResult> AdminLogin([FromBody] LoginAdminCommand command)
        {
            var result = await _mediator.Send(command);
            if (!result.Success)
                return Unauthorized(new { error = result.Error });
            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginMerchantCommand command)
        {
            var result = await _mediator.Send(command);
            if (!result.Success)
                return Unauthorized(new { error = result.Error });
            return Ok(result);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterMerchantCommand command)
        {
            return Ok(await _mediator.Send(command));
        }

        [HttpGet("activate")]
        public async Task<IActionResult> Activate([FromQuery] string token)
        {
            var result = await _mediator.Send(new ActivateMerchantCommand(token));
            return Ok(result);
        }


        [HttpDelete("product/{id}")]
        public async Task<IActionResult> DeleteProduct(string id)
        {
            var ok = await _mediator.Send(new FluxCommerce.Api.Application.Commands.DeleteProductCommand { Id = id });
            if (!ok) return NotFound();
            return Ok();
        }
    }
}
