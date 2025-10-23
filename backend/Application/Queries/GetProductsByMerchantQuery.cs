using MediatR;
using System.Collections.Generic;

using FluxCommerce.Api.Models;
namespace FluxCommerce.Api.Application.Queries
{
    public class GetProductsByMerchantQuery : IRequest<IEnumerable<ProductDto>>
    {
        public string StoreId { get; set; }
        public GetProductsByMerchantQuery(string storeId)
        {
            StoreId = storeId;
        }
    }
}
