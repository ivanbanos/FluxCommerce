using FluxCommerce.Api.Application.Commands;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;

namespace FluxCommerce.Api.Application.Handlers
{
    public class LoginAdminCommandHandler : IRequestHandler<LoginAdminCommand, LoginAdminResult>
    {
        private readonly IConfiguration _config;
        public LoginAdminCommandHandler(IConfiguration config)
        {
            _config = config;
        }

        public Task<LoginAdminResult> Handle(LoginAdminCommand request, CancellationToken cancellationToken)
        {
            // Admin hardcodeado por simplicidad. En producción usar DB.
            var adminEmail = _config["Admin:Email"] ?? "admin@flux.com";
            var adminPass = _config["Admin:Password"] ?? "admin123";
            var adminName = _config["Admin:Name"] ?? "SuperAdmin";

            if (request.Email != adminEmail || request.Password != adminPass)
            {
                return Task.FromResult(new LoginAdminResult { Success = false, Error = "Credenciales inválidas" });
            }

            var jwtKey = _config["Jwt:Key"] ?? "clave_super_secreta";
            var jwtIssuer = _config["Jwt:Issuer"] ?? "fluxcommerce";
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(jwtKey);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, "admin"),
                    new Claim(ClaimTypes.Name, adminName),
                    new Claim(ClaimTypes.Email, adminEmail),
                    new Claim(ClaimTypes.Role, "SuperAdmin")
                }),
                Expires = DateTime.UtcNow.AddHours(8),
                Issuer = jwtIssuer,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Task.FromResult(new LoginAdminResult
            {
                Success = true,
                Token = tokenString,
                Name = adminName,
                Email = adminEmail
            });
        }
    }
}
