import type { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

interface ClientRecord {
  timestamps: number[];
}

/**
 * In-memory sliding-window rate limiter.
 * Mitigates brute-force attacks and endpoint denial-of-service without external caching infrastructure.
 */
export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, maxRequests, message = 'Too many requests, please try again later.' } = options;
  const clients = new Map<string, ClientRecord>();

  // Periodically clean up stale client entries every 5 minutes to avoid memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of clients.entries()) {
      record.timestamps = record.timestamps.filter(t => now - t < windowMs);
      if (record.timestamps.length === 0) {
        clients.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  // Unref interval so it does not keep Node test runners alive
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    // Determine client identifier
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    let record = clients.get(clientIp);
    if (!record) {
      record = { timestamps: [] };
      clients.set(clientIp, record);
    }

    // Filter out timestamps outside the sliding window
    record.timestamps = record.timestamps.filter(t => now - t < windowMs);

    // Standard rate limit headers
    const remaining = Math.max(0, maxRequests - record.timestamps.length - 1);
    const resetTime = Math.ceil((windowMs - (now - (record.timestamps[0] || now))) / 1000);

    res.setHeader('RateLimit-Limit', maxRequests);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', resetTime > 0 ? resetTime : Math.ceil(windowMs / 1000));

    if (record.timestamps.length >= maxRequests) {
      res.setHeader('Retry-After', resetTime > 0 ? resetTime : 1);
      res.status(429).json({
        success: false,
        error: message,
        retryAfterSeconds: resetTime > 0 ? resetTime : 1,
      });
      return;
    }

    record.timestamps.push(now);
    next();
  };
}

// Preset rate limiters
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 120,    // 120 requests/min
  message: 'General API rate limit exceeded. Please wait a moment before sending more requests.',
});

export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,     // 30 AI requests/min
  message: 'AI assistant rate limit reached. Please wait before generating more AI analyses.',
});

export const bookingRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 40,     // 40 booking submissions/min
  message: 'Booking request rate limit reached. Please wait before submitting another request.',
});
