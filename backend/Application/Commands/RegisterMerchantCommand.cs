using MediatR;
using System.ComponentModel.DataAnnotations;

namespace FluxCommerce.Api.Application.Commands
{
    public class RegisterMerchantCommand : IRequest<RegisterMerchantResult>
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
    // Phone removed: now handled by Store
    }

    public class RegisterMerchantResult
    {
        public bool Success { get; set; }
        public string? Error { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
    }
}
