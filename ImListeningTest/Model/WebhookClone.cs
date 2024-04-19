namespace ImListeningTest.Model
{
    internal class WebhookClone
    {
        public string Id { get; set; }
        public DateTime? ExpireOnUtc { get; set; }
        public int Timeout { get; set; }
        public int StatusCode { get; set; }
        public string? ContentType { get; set; }
        public string? Response { get; set; }
        public string? ForwardTo { get; set; }
        public bool IsLoadTesting { get; set; }
        public string? UserId { get; set; }
    }
}
