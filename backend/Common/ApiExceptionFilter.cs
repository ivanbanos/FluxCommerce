using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using FluxCommerce.Api.Common;

namespace FluxCommerce.Api.Common
{
    public class ApiExceptionFilter : IExceptionFilter
    {
        public void OnException(ExceptionContext context)
        {
            if (context.Exception is ApiException apiEx)
            {
                context.Result = new ObjectResult(new { error = apiEx.Message })
                {
                    StatusCode = apiEx.HttpCode
                };
                context.ExceptionHandled = true;
            }
        }
    }
}
