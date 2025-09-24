using FluxCommerce.Api.Data;
using MediatR;
using FluxCommerce.Api.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace FluxCommerce.Api.Application.Queries
{
    public class GetProductsByMerchantQueryHandler : IRequestHandler<GetProductsByMerchantQuery, IEnumerable<ProductDto>>
    {
        private readonly MongoDbService _mongoDbService;
        public GetProductsByMerchantQueryHandler(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        public async Task<IEnumerable<ProductDto>> Handle(GetProductsByMerchantQuery request, CancellationToken cancellationToken)
        {
            var products = await _mongoDbService.GetProductsByMerchantAsync(request.MerchantId);
            return products.Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                Stock = p.Stock,
                Images = p.Images,
                CoverIndex = p.CoverIndex,
                MerchantId = p.MerchantId,
                IsDeleted = p.IsDeleted,
                Cover = (p.Images != null && p.Images.Count > 0 && p.CoverIndex < p.Images.Count) ? p.Images[p.CoverIndex] : null
            });
        }
    }
}
