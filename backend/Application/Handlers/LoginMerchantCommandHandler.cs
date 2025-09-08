using FluxCommerce.Api.Application.Commands;
using FluxCommerce.Api.Data;
using FluxCommerce.Api.Models;
using FluxCommerce.Api.Common;
using MediatR;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;

namespace FluxCommerce.Api.Application.Handlers
{
    public class LoginMerchantCommandHandler : IRequestHandler<LoginMerchantCommand, LoginMerchantResult>
    {
        private readonly MongoDbService _mongoService;
        private readonly IConfiguration _config;
        public LoginMerchantCommandHandler(MongoDbService mongoService, IConfiguration config)
        {
            _mongoService = mongoService;
            _config = config;
        }

        public async Task<LoginMerchantResult> Handle(LoginMerchantCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return new LoginMerchantResult { Success = false, Error = "Email y contraseña requeridos" };

            var merchant = await _mongoService.GetMerchantByEmailAsync(request.Email);
            if (merchant == null)
                return new LoginMerchantResult { Success = false, Error = "Credenciales inválidas" };

            if (merchant.State != "active")
                return new LoginMerchantResult { Success = false, Error = "La cuenta no está activa" };

            if (!BCrypt.Net.BCrypt.Verify(request.Password, merchant.PasswordHash))
                return new LoginMerchantResult { Success = false, Error = "Credenciales inválidas" };

            // JWT
            var jwtKey = _config["Jwt:Key"] ?? "clave_super_secreta";
            var jwtIssuer = _config["Jwt:Issuer"] ?? "fluxcommerce";
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(jwtKey);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, merchant.Id ?? ""),
                    new Claim(ClaimTypes.Name, merchant.Name ?? ""),
                    new Claim(ClaimTypes.Email, merchant.Email ?? "")
                }),
                Expires = DateTime.UtcNow.AddHours(8),
                Issuer = jwtIssuer,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return new LoginMerchantResult
            {
                Success = true,
                Token = tokenString,
                Name = merchant.Name,
                Email = merchant.Email
            };
        }
    }
}
