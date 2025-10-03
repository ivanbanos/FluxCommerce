using MediatR;
using FluxCommerce.Models;

namespace FluxCommerce.Application.Commands
{
    public class RegisterCustomerCommand : IRequest<string>
    {
        public RegisterCustomerDto Dto { get; set; }
        public RegisterCustomerCommand(RegisterCustomerDto dto)
        {
            Dto = dto;
        }
    }
}
