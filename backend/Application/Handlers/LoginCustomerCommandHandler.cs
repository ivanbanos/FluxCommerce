using MediatR;
using FluxCommerce.Models;
using MongoDB.Driver;
using System.Threading;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using System;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using FluxCommerce.Api.Data;
using FluxCommerce.Application.Commands;

namespace FluxCommerce.Application.Handlers
{
    public class LoginCustomerCommandHandler : IRequestHandler<LoginCustomerCommand, string>
    {
        private readonly MongoDbContext _db;
        private readonly IConfiguration _config;
        public LoginCustomerCommandHandler(MongoDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        public async Task<string> Handle(LoginCustomerCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Dto;
            var customer = await _db.Customers.Find(x => x.Email == dto.Email).FirstOrDefaultAsync();
            if (customer == null || customer.PasswordHash != HashPassword(dto.Password))
                throw new Exception("Email o contraseña incorrectos");

            // Generar JWT
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_config["Jwt:Key"] ?? "clave_super_secreta");
            var claims = new[]
            {
                new Claim("id", customer.Id),
                new Claim("email", customer.Email)
            };
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = _config["Jwt:Issuer"] ?? "fluxcommerce"
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
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
