using MediatR;

namespace FluxCommerce.Api.Application.Commands
{
    public class SetMerchantActiveCommand : IRequest<bool>
    {
        public string MerchantId { get; set; } = null!;
        public bool IsActive { get; set; }
    }
}
