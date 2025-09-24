using MediatR;

namespace FluxCommerce.Api.Application.Commands
{
    public class SetupMerchantStoreCommand : IRequest<string?>
    {
        public string MerchantId { get; set; } = null!;
        public string StoreName { get; set; } = null!;
    }
}
