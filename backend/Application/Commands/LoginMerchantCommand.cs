using MediatR;

namespace FluxCommerce.Api.Application.Commands
{
    public class LoginMerchantCommand : IRequest<LoginMerchantResult>
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
    }

    public class LoginMerchantResult
    {
        public bool Success { get; set; }
        public string? Error { get; set; }
        public string? Token { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
    }
}
