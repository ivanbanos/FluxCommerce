using MediatR;
using FluxCommerce.Api.Models;
using System.Collections.Generic;

namespace FluxCommerce.Api.Application.Queries
{
    public class GetStoresByMerchantQuery : IRequest<List<Store>>
    {
        public string MerchantId { get; set; }
        public GetStoresByMerchantQuery(string merchantId)
        {
            MerchantId = merchantId;
        }
    }
}
