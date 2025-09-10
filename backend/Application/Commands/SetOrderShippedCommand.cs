using MediatR;

namespace FluxCommerce.Api.Application.Commands
{
    public class SetOrderShippedCommand : IRequest<bool>
    {
        public string OrderId { get; set; } = null!;
    }
}
