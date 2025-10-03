using MediatR;

namespace FluxCommerce.Application.Queries
{
    public class GetCustomerByEmailQuery : IRequest<GetCustomerByEmailResult>
    {
        public string Email { get; set; }
        public GetCustomerByEmailQuery(string email)
        {
            Email = email;
        }
    }

    public class GetCustomerByEmailResult
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public List<string> Addresses { get; set; }
    }
}
