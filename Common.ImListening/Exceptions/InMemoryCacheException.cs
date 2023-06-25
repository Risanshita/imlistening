using System.Runtime.Serialization;

namespace Common.ImListening.Exceptions
{
    [Serializable]
    public class InMemoryCacheException : Exception
    {
        private InMemoryCacheException(SerializationInfo info, StreamingContext context)
       : base(info, context)
        {
        }

        public override void GetObjectData(SerializationInfo info, StreamingContext context)
        {
            base.GetObjectData(info, context);
        }

        public InMemoryCacheException(string? message) : base(message)
        {
        }

        public InMemoryCacheException(string? message, Exception? innerException) : base(message, innerException)
        {
        }

    }
}
