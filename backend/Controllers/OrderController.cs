        // ...existing code...
using FluxCommerce.Api.Application.Queries;
        // ...existing code...
using FluxCommerce.Api.Application.Commands;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;
using MediatR;

namespace FluxCommerce.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly IMediator _mediator;
        public OrderController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderCommand command)
        {
            var orderId = await _mediator.Send(command);
            return Ok(new { id = orderId });
        }

        [HttpPost("{id}/pay")]
        public async Task<IActionResult> SetOrderPaid(string id)
        {
            var ok = await _mediator.Send(new SetOrderPaidCommand { OrderId = id });
            if (!ok) return NotFound();
            return Ok();
        }
        [HttpGet("merchant/{merchantId}")]
        public async Task<IActionResult> GetOrdersByMerchant(string merchantId)
        {
            var orders = await _mediator.Send(new GetOrdersByMerchantQuery { MerchantId = merchantId });
            return Ok(orders);
        }
        [HttpPost("{id}/ship")]
        public async Task<IActionResult> SetOrderShipped(string id)
        {
            var ok = await _mediator.Send(new SetOrderShippedCommand { OrderId = id });
            if (!ok) return NotFound();
            return Ok();
        }
    }
}
