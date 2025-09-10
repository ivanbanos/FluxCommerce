using MediatR;

namespace FluxCommerce.Api.Application.Commands
{
    public class SetOrderPaidCommand : IRequest<bool>
    {
        public string OrderId { get; set; } = string.Empty;
    }
}
