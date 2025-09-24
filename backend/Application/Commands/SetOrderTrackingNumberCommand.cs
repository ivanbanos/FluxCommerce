using MediatR;

namespace FluxCommerce.Api.Application.Commands
{
    public class SetOrderTrackingNumberCommand : IRequest<bool>
    {
        public string OrderId { get; set; } = null!;
        public string TrackingNumber { get; set; } = null!;
    }
}
