using MediatR;

namespace FluxCommerce.Api.Application.Commands
{
    public class ValidateMerchantCommand : IRequest<bool>
    {
        public string MerchantId { get; set; }
        public ValidateMerchantCommand(string merchantId)
        {
            MerchantId = merchantId;
        }
    }
}
