using FluxCommerce.Api.Application.Queries;
using FluxCommerce.Api.Data;
using FluxCommerce.Api.Models;
using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace FluxCommerce.Api.Application.Handlers
{
    public class GetAllStoresQueryHandler : IRequestHandler<GetAllStoresQuery, List<Store>>
    {
        private readonly MongoDbService _mongoDbService;
        public GetAllStoresQueryHandler(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        public async Task<List<Store>> Handle(GetAllStoresQuery request, CancellationToken cancellationToken)
        {
            return await _mongoDbService.GetAllStoresAsync();
        }
    }
}
