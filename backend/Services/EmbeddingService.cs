using System.Text;
using System.Text.Json;

namespace FluxCommerce.Api.Services;

public class EmbeddingService : IEmbeddingService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<EmbeddingService> _logger;
    private readonly string _embeddingServiceUrl;

    public EmbeddingService(HttpClient httpClient, ILogger<EmbeddingService> logger, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _logger = logger;
        _embeddingServiceUrl = configuration["EmbeddingService:Url"] ?? "http://localhost:8000";
        
        // Set timeout for embedding requests
        _httpClient.Timeout = TimeSpan.FromSeconds(30);
    }

    public async Task<float[]> GenerateEmbeddingAsync(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            // Return zero vector for empty text
            return new float[384];
        }

        try
        {
            var request = new
            {
                text = text.Trim()
            };

            var json = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{_embeddingServiceUrl}/embed", content);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Embedding service returned error: {StatusCode}", response.StatusCode);
                return new float[384]; // Return zero vector on error
            }

            var responseJson = await response.Content.ReadAsStringAsync();
            var embeddingResponse = JsonSerializer.Deserialize<EmbeddingResponse>(responseJson);

            return embeddingResponse?.Embedding ?? new float[384];
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating embedding for text: {Text}", text);
            return new float[384]; // Return zero vector on error
        }
    }

    public async Task<List<float[]>> GenerateEmbeddingsAsync(List<string> texts)
    {
        if (texts == null || !texts.Any())
        {
            return new List<float[]>();
        }

        try
        {
            var request = new
            {
                texts = texts.Where(t => !string.IsNullOrWhiteSpace(t)).Select(t => t.Trim()).ToList()
            };

            var json = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{_embeddingServiceUrl}/embed_batch", content);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Embedding service returned error for batch: {StatusCode}", response.StatusCode);
                return texts.Select(_ => new float[384]).ToList();
            }

            var responseJson = await response.Content.ReadAsStringAsync();
            var embeddingResponse = JsonSerializer.Deserialize<BatchEmbeddingResponse>(responseJson);

            return embeddingResponse?.Embeddings ?? texts.Select(_ => new float[384]).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating embeddings for batch of {Count} texts", texts.Count);
            return texts.Select(_ => new float[384]).ToList();
        }
    }

    public float CalculateCosineSimilarity(float[] embedding1, float[] embedding2)
    {
        if (embedding1 == null || embedding2 == null || embedding1.Length != embedding2.Length)
        {
            return 0f;
        }

        var dotProduct = 0f;
        var magnitude1 = 0f;
        var magnitude2 = 0f;

        for (int i = 0; i < embedding1.Length; i++)
        {
            dotProduct += embedding1[i] * embedding2[i];
            magnitude1 += embedding1[i] * embedding1[i];
            magnitude2 += embedding2[i] * embedding2[i];
        }

        magnitude1 = (float)Math.Sqrt(magnitude1);
        magnitude2 = (float)Math.Sqrt(magnitude2);

        if (magnitude1 == 0f || magnitude2 == 0f)
        {
            return 0f;
        }

        return dotProduct / (magnitude1 * magnitude2);
    }

    private class EmbeddingResponse
    {
        public float[] Embedding { get; set; } = new float[384];
    }

    private class BatchEmbeddingResponse
    {
        public List<float[]> Embeddings { get; set; } = new();
    }
}