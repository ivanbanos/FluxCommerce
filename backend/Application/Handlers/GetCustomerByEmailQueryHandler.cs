using MediatR;
using FluxCommerce.Application.Queries;
using FluxCommerce.Models;// Replace with the correct namespace where MongoDbContext is defined
using MongoDB.Driver;
using FluxCommerce.Api.Data;

namespace FluxCommerce.Application.Handlers
{
    public class GetCustomerByEmailQueryHandler : IRequestHandler<GetCustomerByEmailQuery, GetCustomerByEmailResult>
    {
        private readonly MongoDbContext _db;
        public GetCustomerByEmailQueryHandler(MongoDbContext db)
        {
            _db = db;
        }

        public async Task<GetCustomerByEmailResult> Handle(GetCustomerByEmailQuery request, CancellationToken cancellationToken)
        {
            var customer = await _db.Customers.Find(c => c.Email == request.Email).FirstOrDefaultAsync();
            if (customer == null) return null;
            return new GetCustomerByEmailResult
            {
                Name = customer.Name,
                Email = customer.Email,
                Addresses = customer.Addresses ?? new List<string>()
            };
        }
    }
}
