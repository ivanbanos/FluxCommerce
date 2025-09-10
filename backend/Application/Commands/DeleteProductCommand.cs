using MediatR;

namespace FluxCommerce.Api.Application.Commands
{
    public class DeleteProductCommand : IRequest<bool>
    {
        public string Id { get; set; } = null!;
        public string? MerchantId { get; set; }
    }
}
