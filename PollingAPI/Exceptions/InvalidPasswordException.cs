using System;

namespace PollingAPI.Exceptions;

public class InvalidPasswordException : Exception
{
    public InvalidPasswordException()
    {

    }
    
    public InvalidPasswordException(string message):base(message)
    {
        
    }
}
