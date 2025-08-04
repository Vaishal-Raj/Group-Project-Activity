namespace PollingAPI.Interfaces
{
    public interface IEmailService
    {
        Task SendMessageToAllUsersAsync(string subject, string message);
    }
}
