using FluxCommerce.Api.Application.Commands;
using FluxCommerce.Api.Data;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace FluxCommerce.Api.Application.Handlers
{
    public class SetMerchantActiveCommandHandler : IRequestHandler<SetMerchantActiveCommand, bool>
    {
        private readonly MongoDbService _mongoDbService;
        public SetMerchantActiveCommandHandler(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        public async Task<bool> Handle(SetMerchantActiveCommand request, CancellationToken cancellationToken)
        {
            return await _mongoDbService.SetMerchantActiveAsync(request.MerchantId, request.IsActive);
        }
    }
}
