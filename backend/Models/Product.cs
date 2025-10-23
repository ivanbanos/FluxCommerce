using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace FluxCommerce.Api.Models
{
    public class Product
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        [Required]
        public string? Name { get; set; }
        public string? Description { get; set; }
        [Required]
        public decimal Price { get; set; }
        [Required]
        public int Stock { get; set; }
        public List<string> Images { get; set; } = new(); // URLs o nombres de archivo
        public int CoverIndex { get; set; } = 0;
    public string? StoreId { get; set; }
    public string? MerchantId { get; set; }
    public bool IsDeleted { get; set; } = false;
    /// <summary>
    /// Palabras clave para mejorar la predicción y el SEO
    /// </summary>
    public List<string> Keywords { get; set; } = new();
    }
}
