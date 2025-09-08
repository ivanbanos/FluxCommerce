using FluxCommerce.Api.Application.Commands;
using FluxCommerce.Api.Data;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace FluxCommerce.Api.Application.Handlers
{
    public class ValidateMerchantCommandHandler : IRequestHandler<ValidateMerchantCommand, bool>
    {
        private readonly MongoDbService _mongoService;
        public ValidateMerchantCommandHandler(MongoDbService mongoService)
        {
            _mongoService = mongoService;
        }
        public async Task<bool> Handle(ValidateMerchantCommand request, CancellationToken cancellationToken)
        {
            var merchant = await _mongoService.GetMerchantByIdAsync(request.MerchantId);
            if (merchant == null) return false;
            merchant.State = "active";
            await _mongoService.UpdateMerchantAsync(merchant);
            return true;
        }
    }
}
