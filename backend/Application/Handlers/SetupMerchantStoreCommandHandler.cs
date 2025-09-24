using FluxCommerce.Api.Application.Commands;
using FluxCommerce.Api.Data;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace FluxCommerce.Api.Application.Handlers
{
    public class SetupMerchantStoreCommandHandler : IRequestHandler<SetupMerchantStoreCommand, string?>
    {
        private readonly MongoDbService _mongoDbService;
        public SetupMerchantStoreCommandHandler(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        public async Task<string?> Handle(SetupMerchantStoreCommand request, CancellationToken cancellationToken)
        {
            return await _mongoDbService.SetupMerchantStoreAsync(request.MerchantId, request.StoreName);
        }
    }
}
