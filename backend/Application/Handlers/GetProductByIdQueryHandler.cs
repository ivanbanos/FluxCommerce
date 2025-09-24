using FluxCommerce.Api.Data;
using MediatR;
using FluxCommerce.Api.Models;
using System.Threading;
using System.Threading.Tasks;

namespace FluxCommerce.Api.Application.Queries
{
    public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, ProductByIdDto?>
    {
        private readonly MongoDbService _mongoDbService;
        public GetProductByIdQueryHandler(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        public async Task<ProductByIdDto?> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
        {
            var product = await _mongoDbService.GetProductByIdAsync(request.Id);
            if (product == null) return null;
            return new ProductByIdDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                Stock = product.Stock,
                Images = product.Images,
                CoverIndex = product.CoverIndex,
                MerchantId = product.MerchantId
            };
        }
    }
}
