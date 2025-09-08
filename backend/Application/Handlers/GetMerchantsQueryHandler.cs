using FluxCommerce.Api.Application.Queries;
using FluxCommerce.Api.Data;
using FluxCommerce.Api.Models;
using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace FluxCommerce.Api.Application.Handlers
{
    public class GetMerchantsQueryHandler : IRequestHandler<GetMerchantsQuery, List<Merchant>>
    {
        private readonly MongoDbService _mongoService;
        public GetMerchantsQueryHandler(MongoDbService mongoService)
        {
            _mongoService = mongoService;
        }
        public async Task<List<Merchant>> Handle(GetMerchantsQuery request, CancellationToken cancellationToken)
        {
            return await _mongoService.GetAllMerchantsAsync();
        }
    }
}
