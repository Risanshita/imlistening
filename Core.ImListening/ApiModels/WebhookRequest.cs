using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace Core.ImListening.ApiModels
{
    public class WebhookRequest
    {
        [StringLength(50, MinimumLength = 5 , ErrorMessage = "Path length should be b/w 5 to 50 character.")]
        [DisallowNull]
        public string Path { get; set; } = Guid.NewGuid().ToString();
        [Range(1, 525600)]
        public int ExpireAfterMin { get; set; } = 525600; // 365 days
        [Range(0, 600000, ErrorMessage = "Response timeout should be b/w 0 to 600,000.")]
        public int Timeout { get; set; } = 0;
        [Range(100, 599)]
        public int StatusCode { get; set; } = 200;
        public string? ForwardTo { get; set; }
        public string? ContentType { get; set; } = "text/plain";
        public string? Response { get; set; }
    }
}
