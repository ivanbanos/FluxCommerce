using MediatR;
using FluxCommerce.Models;

namespace FluxCommerce.Application.Commands
{
    public class LoginCustomerCommand : IRequest<string>
    {
        public LoginCustomerDto Dto { get; set; }
        public LoginCustomerCommand(LoginCustomerDto dto)
        {
            Dto = dto;
        }
    }
}
