using System;
using System.Reflection.Metadata;
using PollingAPI.Models;
using PollingAPI.Repositories;

namespace PollingAPI.Interfaces;

public interface IUserRepository : IRepository<string,User>
{

}
