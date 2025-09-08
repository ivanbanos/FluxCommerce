using FluxCommerce.Api.Data;
using Microsoft.AspNetCore.Mvc;

namespace FluxCommerce.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;
        public ProductController(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        // Endpoint público para listar productos de una tienda
        [HttpGet("list/{merchantId}")]
        public async Task<IActionResult> ListProductsByMerchant(string merchantId)
        {
            var products = await _mongoDbService.GetProductsByMerchantAsync(merchantId);
            var result = products.Select(p => new {
                id = p.Id,
                name = p.Name,
                price = p.Price,
                cover = (p.Images != null && p.Images.Count > 0 && p.CoverIndex < p.Images.Count) ? p.Images[p.CoverIndex] : null
            });
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById(string id)
        {
            var product = await _mongoDbService.GetProductByIdAsync(id);
            if (product == null)
                return NotFound();
            return Ok(product);
        }
    }
}
