using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace FluxCommerce.Api.Services
{
    public class EmailService
    {
        private readonly string? _smtpHost;
        private readonly int _smtpPort;
        private readonly string? _smtpUser;
        private readonly string? _smtpPass;
        private readonly string? _from;

        public IConfiguration Configuration { get; }

        public EmailService(IConfiguration config)
        {
            Configuration = config;
            _smtpHost = config["Smtp:Host"];
            _smtpPort = int.Parse(config["Smtp:Port"] ?? "587");
            _smtpUser = config["Smtp:User"];
            _smtpPass = config["Smtp:Pass"];
            _from = config["Smtp:From"];
        }

        public async Task SendAsync(string to, string subject, string body)
        {
            using var client = new SmtpClient(_smtpHost, _smtpPort)
            {
                Credentials = new NetworkCredential(_smtpUser, _smtpPass),
                EnableSsl = true
            };
            var mail = new MailMessage(_from ?? string.Empty, to, subject, body) { IsBodyHtml = true };
            await client.SendMailAsync(mail);
        }

        public string? GetConfig(string key) => Configuration[key];
    }
}
