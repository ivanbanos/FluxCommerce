namespace FluxCommerce.Api.Models
{
    public class ProductDto
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public List<string>? Images { get; set; }
        public int CoverIndex { get; set; }
        public string? MerchantId { get; set; }
        public bool IsDeleted { get; set; }
        public string? Cover { get; set; }
    }

    public class ProductByIdDto
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public List<string>? Images { get; set; }
        public int CoverIndex { get; set; }
        public string? MerchantId { get; set; }
    }
}
