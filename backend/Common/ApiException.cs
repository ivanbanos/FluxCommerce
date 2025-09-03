using System;
using System.Net;

namespace FluxCommerce.Api.Common
{
    public class ApiException : Exception
    {
        public int HttpCode { get; }
        public ApiException(string message, int httpCode = 500) : base(message)
        {
            HttpCode = httpCode;
        }
        public ApiException(string message, HttpStatusCode httpCode) : base(message)
        {
            HttpCode = (int)httpCode;
        }
    }
}
