using MediatR;

namespace FluxCommerce.Api.Application.Commands
{
    public class SetOrderReceivedCommand : IRequest<bool>
    {
        public string OrderId { get; set; } = null!;
    }
}
