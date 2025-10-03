using MediatR;
using FluxCommerce.Models;
using MongoDB.Driver;
using System.Threading;
using System.Threading.Tasks;
using FluxCommerce.Application.Commands;
using FluxCommerce.Api.Data;

namespace FluxCommerce.Application.Handlers
{
    public class AddAddressCommandHandler : IRequestHandler<AddAddressCommand, bool>
    {
        private readonly MongoDbContext _db;
        public AddAddressCommandHandler(MongoDbContext db)
        {
            _db = db;
        }

        public async Task<bool> Handle(AddAddressCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Dto;
            var update = Builders<Customer>.Update.AddToSet(c => c.Addresses, dto.Address);
            var result = await _db.Customers.UpdateOneAsync(c => c.Email == dto.Email, update);
            return result.ModifiedCount > 0;
        }
    }
}
