using Newtonsoft.Json;

namespace Core.ImListening.DbModels
{
    public class RequestInfo
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Key { get; set; }
        public string Value { get; set; }
        public string Type { get; set; }
        public string Resource { get; set; }
        [JsonIgnore]
        public History History { get; set; }
        public string HistoryId { get; set; }
        public RequestInfo() { }
        public RequestInfo(string historyId,
                           History history,
                           string key,
                           string value,
                           string resource = "Primary",
                           string type = "String")
        {
            History = history;
            Key = key;
            Value = value;
            Type = type;
            Resource = resource;
            HistoryId = historyId;
        }
    }
}
