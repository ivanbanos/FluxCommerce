using FluxCommerce.Api.Models;
using FluxCommerce.Api.Data;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;

namespace FluxCommerce.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StoreController : ControllerBase
    {
        private readonly IMediator _mediator;
        public StoreController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("all")]
        public async Task<ActionResult<List<Store>>> GetAllStores()
        {
            var stores = await _mediator.Send(new FluxCommerce.Api.Application.Queries.GetAllStoresQuery());
            return Ok(stores);
        }

        [HttpGet("my")]
        public async Task<ActionResult<List<Store>>> GetMyStores()
        {
            var merchantId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(merchantId))
                return Unauthorized();
            var stores = await _mediator.Send(new FluxCommerce.Api.Application.Queries.GetStoresByMerchantQuery(merchantId));
            return Ok(stores);
        }
    }
}
