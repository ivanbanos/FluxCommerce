using MediatR;

namespace FluxCommerce.Api.Application.Queries
{
    public class GetOrderByIdQuery : IRequest<FluxCommerce.Api.Models.Order?>
    {
        public string Id { get; set; } = null!;
    }
}
