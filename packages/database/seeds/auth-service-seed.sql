-- Auth Service Seed Data
-- This file contains sample data for testing the authentication service

-- Insert sample security events for testing
INSERT INTO "SecurityEvent" ("id", "userId", "type", "description", "severity", "metadata", "ipAddress", "userAgent", "createdAt", "resolved") VALUES
  ('security_event_1', NULL, 'LOGIN_FAILURE', 'Failed login attempt from suspicious IP', 'MEDIUM', '{"attempts": 3, "reason": "invalid_password"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', CURRENT_TIMESTAMP, false),
  ('security_event_2', NULL, 'SUSPICIOUS_LOGIN', 'Login from new location detected', 'HIGH', '{"location": "Unknown", "new_device": true}', '10.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)', CURRENT_TIMESTAMP, false);

-- Insert sample rate limit records for testing
INSERT INTO "RateLimit" ("id", "key", "type", "count", "expiresAt", "createdAt", "updatedAt") VALUES
  ('rate_limit_1', '192.168.1.100', 'login', 3, CURRENT_TIMESTAMP + INTERVAL '15 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rate_limit_2', '10.0.0.1', 'register', 1, CURRENT_TIMESTAMP + INTERVAL '1 hour', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample password reset tokens for testing (expired)
INSERT INTO "PasswordReset" ("id", "email", "token", "expiresAt", "createdAt", "ipAddress") VALUES
  ('password_reset_1', 'test@example.com', 'expired_token_123', CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '2 hours', '192.168.1.100'),
  ('password_reset_2', 'user@example.com', 'valid_token_456', CURRENT_TIMESTAMP + INTERVAL '1 hour', CURRENT_TIMESTAMP, '10.0.0.1');

-- Note: Actual user-specific data will be created during registration/login flows
-- This seed data is primarily for testing system functionality