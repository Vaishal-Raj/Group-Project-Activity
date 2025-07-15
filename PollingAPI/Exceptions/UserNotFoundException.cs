using System;

namespace PollingAPI.Exceptions;

public class UserNotFoundException : Exception
{
    public UserNotFoundException()
    {

    }
    
    public UserNotFoundException(PathString message) : base(message)
    {
        
    }
}
