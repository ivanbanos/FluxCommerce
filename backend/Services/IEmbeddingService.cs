using System.Threading.Tasks;

namespace FluxCommerce.Api.Services;

public interface IEmbeddingService
{
    /// <summary>
    /// Generate embeddings for a single text input
    /// </summary>
    /// <param name="text">Text to generate embeddings for</param>
    /// <returns>Array of float values representing the embedding vector</returns>
    Task<float[]> GenerateEmbeddingAsync(string text);

    /// <summary>
    /// Generate embeddings for multiple text inputs
    /// </summary>
    /// <param name="texts">List of texts to generate embeddings for</param>
    /// <returns>List of embedding vectors</returns>
    Task<List<float[]>> GenerateEmbeddingsAsync(List<string> texts);

    /// <summary>
    /// Calculate cosine similarity between two embedding vectors
    /// </summary>
    /// <param name="embedding1">First embedding vector</param>
    /// <param name="embedding2">Second embedding vector</param>
    /// <returns>Cosine similarity score between 0 and 1</returns>
    float CalculateCosineSimilarity(float[] embedding1, float[] embedding2);
}