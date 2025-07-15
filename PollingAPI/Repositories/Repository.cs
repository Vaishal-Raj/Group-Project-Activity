using System;
using PollingAPI.Contexts;
using PollingAPI.Exceptions;
using PollingAPI.Interfaces;

namespace PollingAPI.Repositories;

public abstract class Repository<K,T> : IRepository<K, T> where T:class
{
    private readonly PollContext _pollContext;

    public Repository(PollContext context)
    {
        _pollContext = context;
    }
    public async Task<T> AddAsync(T item)
    {
        _pollContext.Add(item);
        await _pollContext.SaveChangesAsync();
        return item;
    }

    public async Task<T> DeleteAsync(K key)
    {
        var item = await GetAsync(key);
        if (item == null)
        {
            throw new ItemNotFoundException("Item not found");
        }
        _pollContext.Remove(item);
        await _pollContext.SaveChangesAsync();
        return item;
    }

    public abstract Task<ICollection<T>> GetAllAsync();


    public abstract Task<T?> GetAsync(K id);


    public async Task<T> UpdateAsync(K key, T item)
    {
        var existing = await GetAsync(key);
        if (existing == null)
            throw new ItemNotFoundException("Item not found");
        _pollContext.Entry(item).CurrentValues.SetValues(item);
        await _pollContext.SaveChangesAsync();
        return item;
    }
}
