using System.Runtime.Serialization;

namespace Common.ImListening.Exceptions
{
    [Serializable]
    public class RedisException : Exception
    {
        private RedisException(SerializationInfo info, StreamingContext context)
       : base(info, context)
        {
        }

        public override void GetObjectData(SerializationInfo info, StreamingContext context)
        {
            base.GetObjectData(info, context);
        }

        public RedisException(string? message) : base(message)
        {
        }

        public RedisException(string? message, Exception? innerException) : base(message, innerException)
        {
        }

    }
}
