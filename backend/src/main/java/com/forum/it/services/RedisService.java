package com.forum.it.services;

import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.cache.annotation.*;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RedisService {

    final StringRedisTemplate redisTemplate;

    /**
     * Save a value to Redis with default expiration (infinite)
     * 
     * @param key   Redis key
     * @param value Value to store
     */
    public void setValue(String key, String value) {
        redisTemplate.opsForValue().set(key, value);
    }

    /**
     * Save a value to Redis with a specific expiration time
     * 
     * @param key     Redis key
     * @param value   Value to store
     * @param timeout Time duration
     * @param unit    Time unit
     */
    public void setValueWithTTL(String key, String value, long timeout, TimeUnit unit) {
        redisTemplate.opsForValue().set(key, value, timeout, unit);
    }

    /**
     * Retrieve a value from Redis by key
     * 
     * @param key Redis key
     * @return The value or null if not found
     */
    public String getValue(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    /**
     * Delete a value from Redis by key
     * 
     * @param key Redis key
     */
    public void deleteValue(String key) {
        redisTemplate.delete(key);
    }

    /**
     * Check if a key exists in Redis
     * 
     * @param key Redis key
     * @return true if exists, false otherwise
     */
    public boolean hasKey(String key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    @CachePut(value = "otps", key = "#email")
    public String saveOtp(String email, String otpValue) {
        return otpValue;
    }

    @Cacheable(value = "otps", key = "#email")
    public String getOtp(String email) {
        return null;
    }

    @CacheEvict(value = "otps", key = "#email")
    public void deleteOtp(String email) {

    }
}
