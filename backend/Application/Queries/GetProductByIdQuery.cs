using MediatR;

using FluxCommerce.Api.Models;
namespace FluxCommerce.Api.Application.Queries
{
    public class GetProductByIdQuery : IRequest<ProductByIdDto?>
    {
        public string Id { get; set; }
        public GetProductByIdQuery(string id)
        {
            Id = id;
        }
    }
}
