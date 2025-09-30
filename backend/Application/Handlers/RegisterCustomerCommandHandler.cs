using MediatR;
using FluxCommerce.Models;
using FluxCommerce.Data;
using MongoDB.Driver;
using System.Threading;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.Text;

namespace FluxCommerce.Application.Handlers
{
    public class RegisterCustomerCommandHandler : IRequestHandler<RegisterCustomerCommand, string>
    {
        private readonly MongoDbContext _db;
        public RegisterCustomerCommandHandler(MongoDbContext db)
        {
            _db = db;
        }

        public async Task<string> Handle(RegisterCustomerCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Dto;
            // Check if email already exists
            var exists = await _db.Customers.Find(x => x.Email == dto.Email).AnyAsync();
            if (exists)
                throw new Exception("El email ya está registrado");

            var customer = new Customer
            {
                Name = dto.Name,
                Email = dto.Email,
                PasswordHash = HashPassword(dto.Password)
            };
            await _db.Customers.InsertOneAsync(customer);
            return customer.Id;
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return BitConverter.ToString(bytes).Replace("-", "").ToLower();
            }
        }
    }
}
