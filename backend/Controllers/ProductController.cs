using FluxCommerce.Api.Data;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using FluxCommerce.Api.Application.Commands;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using FluxCommerce.Api.Application.Queries;

namespace FluxCommerce.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;
        private readonly IMediator _mediator;
        public ProductController(MongoDbService mongoDbService, IMediator mediator)
        {
            _mongoDbService = mongoDbService;
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromForm] CreateProductCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProduct([FromForm] UpdateProductCommand command)
        {
            if (string.IsNullOrEmpty(command.Id))
                return BadRequest(new { id = new[] { "The Id field is required." } });
            var result = await _mediator.Send(command);
            if (!result)
                return NotFound();
            return Ok();
        }

        // Endpoint público para listar productos de una tienda
        [HttpGet("list/{storeId}")]
        public async Task<IActionResult> ListProductsByStore(string storeId)
        {
            var result = await _mediator.Send(new FluxCommerce.Api.Application.Queries.GetProductsByMerchantQuery(storeId));
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById(string id)
        {
            var product = await _mediator.Send(new FluxCommerce.Api.Application.Queries.GetProductByIdQuery(id));
            if (product == null)
                return NotFound();
            return Ok(product);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> SoftDeleteProduct(string id)
        {
            var result = await _mongoDbService.SoftDeleteProductAsync(id);
            if (!result)
                return NotFound();
            return Ok();
        }
    }
}
