using FluxCommerce.Api.Application.Queries;
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

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(string id)
        {
            var order = await _mediator.Send(new GetOrderByIdQuery { Id = id });
            if (order == null) return NotFound();
            return Ok(order);
        }

        [HttpPost("{id}/ship")]
        public async Task<IActionResult> SetOrderShipped(string id)
        {
            var ok = await _mediator.Send(new SetOrderShippedCommand { OrderId = id });
            if (!ok) return NotFound();
            return Ok();
        }
        
        [HttpPost("{id}/receive")]
        public async Task<IActionResult> SetOrderReceived(string id)
        {
            var ok = await _mediator.Send(new SetOrderReceivedCommand { OrderId = id });
            if (!ok) return NotFound();
            return Ok();
        }
        [HttpPost("{id}/tracking")]
        public async Task<IActionResult> SetOrderTrackingNumber(string id, [FromBody] SetOrderTrackingNumberDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.TrackingNumber))
                return BadRequest();
            var ok = await _mediator.Send(new SetOrderTrackingNumberCommand { OrderId = id, TrackingNumber = dto.TrackingNumber });
            if (!ok) return NotFound();
            return Ok();
        }

        [HttpGet("buyer/{email}")]
        public async Task<IActionResult> GetOrdersByBuyer(string email)
        {
            var orders = await _mediator.Send(new GetOrdersByBuyerEmailQuery { Email = email });
            return Ok(orders);
        }
    }

    public class SetOrderTrackingNumberDto
    {
        public string TrackingNumber { get; set; } = null!;
    }
}
