import type { Request, Response, NextFunction } from 'express';

/**
 * Enterprise-grade security headers middleware.
 * Implements OWASP recommendations without requiring external dependencies.
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking / frame embedding
  res.setHeader('X-Frame-Options', 'DENY');

  // Strict Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Modern Content-Security-Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' http://localhost:* https://generativelanguage.googleapis.com; frame-ancestors 'none';"
  );

  // Disable browser feature permissions not required by LabLink
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // Remove Express fingerprint
  res.removeHeader('X-Powered-By');

  next();
}
