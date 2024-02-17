
namespace Core.ImListening.DbModels
{
    public class RequestInfo
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Key { get; set; }
        public string Value { get; set; }
        public string Type { get; set; }
        public string Resource { get; set; }
        public string HistoryId { get; set; }
        public RequestInfo() { }
        public RequestInfo(string historyId,
                           string key,
                           string value,
                           string resource = "Primary",
                           string type = "String")
        {
            Key = key;
            Value = value;
            Type = type;
            Resource = resource;
            HistoryId = historyId;
        }
    }
}
