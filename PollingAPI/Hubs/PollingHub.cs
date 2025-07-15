using System;
using Microsoft.AspNetCore.SignalR;

namespace PollingAPI.Hubs;

public class PollingHub : Hub
{
    public async Task JoinPollGroup(string pollId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, pollId);
        Console.WriteLine($"Client joined group {pollId}");
    }

    public async Task LeavePollGroup(string pollId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, pollId);
        Console.WriteLine($"Client left group {pollId}");
    }

}
