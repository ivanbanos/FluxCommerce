using MediatR;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;

namespace FluxCommerce.Api.Application.Commands
{
    public class CreateProductCommand : IRequest<string>
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public List<IFormFile>? Images { get; set; }
        public int CoverIndex { get; set; }
        public string? MerchantId { get; set; }
    }
}
