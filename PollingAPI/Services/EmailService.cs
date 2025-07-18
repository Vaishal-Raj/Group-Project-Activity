using Microsoft.EntityFrameworkCore;
using PollingAPI.Contexts;
using PollingAPI.Interfaces;
using System.Net;
using System.Net.Mail;
using System.Text.RegularExpressions;

namespace PollingAPI.Services
{
    public class EmailService : IEmailService
    {
        private readonly PollContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(PollContext context, IConfiguration configuration, ILogger<EmailService> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        private bool IsValidEmail(string email)
        {
            return !string.IsNullOrWhiteSpace(email) &&
                   Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$");
        }

        public async Task SendMessageToAllUsersAsync(string subject, string message)
        {
            var usernames = await _context.Users.Select(u => u.Username).ToListAsync();

            foreach (var email in usernames)
            {
                if (!IsValidEmail(email))
                {
                    _logger.LogWarning("Skipping invalid email: {Email}", email);
                    continue;
                }

                try
                {
                    await SendEmailAsync(email, subject, message);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send email to {Email}", email);
                }
            }
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            try
            {
                var smtpSettings = _configuration.GetSection("Email:Smtp");

                using var message = new MailMessage
                {
                    From = new MailAddress(smtpSettings["From"]),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = false
                };

                message.To.Add(new MailAddress(to));

                using var smtp = new SmtpClient
                {
                    Host = smtpSettings["Host"],
                    Port = int.Parse(smtpSettings["Port"]),
                    EnableSsl = true,
                    Credentials = new NetworkCredential(
                        smtpSettings["Username"],
                        smtpSettings["Password"])
                };

                await smtp.SendMailAsync(message);
                _logger.LogInformation("Email sent to {To}", to);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email to {To}", to);
                throw;
            }
        }
    }
}
