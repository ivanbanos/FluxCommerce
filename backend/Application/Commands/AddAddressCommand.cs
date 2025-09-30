using MediatR;
using FluxCommerce.Models;

namespace FluxCommerce.Application.Commands
{
    public class AddAddressCommand : IRequest<bool>
    {
        public AddAddressDto Dto { get; set; }
        public AddAddressCommand(AddAddressDto dto)
        {
            Dto = dto;
        }
    }
}
