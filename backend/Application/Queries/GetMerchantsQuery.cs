using FluxCommerce.Api.Models;
using MediatR;
using System.Collections.Generic;

namespace FluxCommerce.Api.Application.Queries
{
    public class GetMerchantsQuery : IRequest<List<Merchant>>
    {
    }
}
