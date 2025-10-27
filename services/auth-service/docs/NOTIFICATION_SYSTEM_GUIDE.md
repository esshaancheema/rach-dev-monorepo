# Enhanced Notification System Guide

## Overview

The enhanced notification system provides comprehensive notification management with advanced features including templates, user preferences, delivery tracking, rate limiting, and multi-channel support.

## Features

### ✅ Multi-Channel Support
- **Email**: Rich HTML emails with templates
- **SMS**: Text message notifications via Twilio
- **Push**: Browser and mobile push notifications (planned)
- **In-App**: Real-time in-application notifications (planned)

### ✅ User Preference Management
- Granular control over notification types
- Channel-specific preferences
- Frequency settings (instant, daily, weekly, never)
- Easy unsubscribe options

### ✅ Advanced Delivery Features
- Circuit breaker integration for reliability
- Rate limiting per user/type/channel
- Time window restrictions (quiet hours)
- Automatic retry with exponential backoff
- Bulk sending with batching

### ✅ Template System
- Pre-built notification templates
- Custom template support
- Variable substitution
- Multi-language support (planned)

### ✅ Analytics & Tracking
- Delivery statistics
- Success/failure rates
- Performance metrics
- User engagement tracking

## API Endpoints

### Get Notification Preferences

```http
GET /api/notifications/preferences
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": {
      "email": {
        "marketing": false,
        "updates": true,
        "security": true,
        "newsletter": false,
        "productAnnouncements": true,
        "tipsAndTricks": false
      },
      "sms": {
        "marketing": false,
        "security": true,
        "reminders": false,
        "twoFactor": true
      },
      "push": {
        "enabled": false,
        "desktop": false,
        "mobile": false,
        "sound": true,
        "vibration": true
      },
      "frequency": {
        "instant": ["security", "critical"],
        "daily": ["updates"],
        "weekly": ["newsletter"],
        "never": ["marketing"]
      }
    }
  }
}
```

### Update Notification Preferences

```http
PUT /api/notifications/preferences
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "notifications": {
    "email": {
      "marketing": true,
      "newsletter": true
    },
    "sms": {
      "marketing": false
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification preferences updated successfully",
  "data": {
    "notifications": {
      // Updated preferences
    }
  }
}
```

### Send Test Notification

```http
POST /api/notifications/test
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "type": "email",
  "template": "welcome",
  "customMessage": {
    "subject": "Test Notification",
    "content": "This is a test message to verify your notification settings."
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test notification sent successfully",
  "data": {
    "notificationId": "notif_1704901800_abc123",
    "status": "sent",
    "channels": {
      "email": {
        "sent": true,
        "messageId": "msg_xyz789"
      }
    }
  }
}
```

### Get Notification Statistics

```http
GET /api/notifications/stats?startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "sent": 145,
    "failed": 3,
    "pending": 2,
    "deliveryRate": 96.7,
    "averageDeliveryTime": 2.5,
    "byChannel": {
      "email": { "sent": 120, "failed": 2 },
      "sms": { "sent": 25, "failed": 1 },
      "push": { "sent": 0, "failed": 0 },
      "in_app": { "sent": 0, "failed": 0 }
    },
    "byType": {
      "welcome": { "sent": 10, "failed": 0 },
      "email_verification": { "sent": 30, "failed": 1 },
      "security_alert": { "sent": 25, "failed": 0 },
      "login_alert": { "sent": 80, "failed": 2 }
    }
  }
}
```

### Get Notification History

```http
GET /api/notifications/history?page=1&limit=20&type=security_alert
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_1704901800_abc123",
        "type": "security_alert",
        "channels": {
          "email": { "sent": true, "messageId": "msg_xyz789" },
          "sms": { "sent": true, "messageId": "sms_abc456" }
        },
        "status": "sent",
        "createdAt": "2024-01-10T15:30:00Z",
        "deliveredAt": "2024-01-10T15:30:02Z",
        "failureReason": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### Unsubscribe from Notification Type

```http
POST /api/notifications/unsubscribe/marketing
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully unsubscribed from marketing notifications"
}
```

### Get Available Templates

```http
GET /api/notifications/templates
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "welcome",
        "name": "Welcome Email",
        "type": "welcome",
        "channels": ["email"],
        "description": "Welcome message for new users"
      },
      {
        "id": "security_alert",
        "name": "Security Alert",
        "type": "security_alert",
        "channels": ["email", "sms"],
        "description": "Security-related alerts and warnings"
      }
    ]
  }
}
```

## Programmatic Usage

### Send Notification (Server-Side)

```typescript
import { enhancedNotificationService } from '../services/enhanced-notification.service';

// Send a welcome email
const result = await enhancedNotificationService.sendNotification({
  userId: 'user_123',
  templateId: 'welcome',
  type: 'welcome',
  channels: ['email'],
  data: {
    firstName: 'John',
    lastName: 'Doe',
    verificationUrl: 'https://app.zoptal.com/verify/token123'
  },
  priority: 'normal',
  trackingId: 'welcome_2024_001'
});

console.log('Notification result:', result);
```

### Send Security Alert

```typescript
// Send critical security alert (bypasses user preferences)
const securityAlert = await enhancedNotificationService.sendNotification({
  userId: 'user_123',
  templateId: 'security_alert',
  type: 'security_alert',
  channels: ['email', 'sms'],
  data: {
    alertType: 'Suspicious Login',
    alertDescription: 'Login from new device detected',
    timestamp: new Date().toISOString(),
    ipAddress: '192.168.1.100',
    location: 'New York, NY'
  },
  priority: 'critical',
  skipPreferenceCheck: true,
  metadata: {
    securityLevel: 'high',
    requiresAction: true
  }
});
```

### Bulk Notifications

```typescript
// Send bulk notifications with batching
const notifications = users.map(user => ({
  userId: user.id,
  templateId: 'newsletter',
  type: 'newsletter',
  channels: ['email'],
  data: {
    firstName: user.firstName,
    unsubscribeUrl: `https://app.zoptal.com/unsubscribe/${user.id}`
  },
  priority: 'low'
}));

const results = await enhancedNotificationService.sendBulkNotifications(
  notifications,
  50 // batch size
);

console.log(`Sent ${results.filter(r => r.status === 'sent').length} notifications`);
```

### Custom Template Registration

```typescript
// Register a custom notification template
enhancedNotificationService.registerTemplate({
  id: 'custom_promotion',
  name: 'Custom Promotion',
  type: 'marketing',
  channels: ['email', 'sms'],
  subject: 'Special Offer - {{offerTitle}}',
  content: {
    text: 'Hi {{firstName}}, check out our special offer: {{offerDescription}}',
    html: '<h1>Hi {{firstName}}</h1><p>{{offerDescription}}</p><a href="{{offerUrl}}">Learn More</a>',
    sms: 'Hi {{firstName}}! {{offerDescription}} - {{offerUrl}}'
  },
  variables: ['firstName', 'offerTitle', 'offerDescription', 'offerUrl'],
  priority: 'low',
  deliveryOptions: {
    retry: true,
    retryLimit: 3,
    retryDelay: 300000,
    batching: true,
    batchSize: 100,
    batchDelay: 60000
  },
  conditions: {
    rateLimit: {
      maxPerDay: 1,
      maxPerWeek: 3
    },
    timeWindows: [{
      start: '09:00',
      end: '18:00',
      timezone: 'America/New_York',
      days: [1, 2, 3, 4, 5] // Monday to Friday
    }]
  }
});
```

## User Preference Categories

### Email Preferences
- **marketing**: Promotional emails and offers
- **updates**: Product updates and announcements
- **security**: Security alerts and login notifications
- **newsletter**: Regular newsletter content
- **productAnnouncements**: New feature announcements
- **tipsAndTricks**: Educational content and tips

### SMS Preferences
- **marketing**: Promotional SMS messages
- **security**: Critical security alerts
- **reminders**: Appointment and deadline reminders
- **twoFactor**: Two-factor authentication codes

### Push Preferences
- **enabled**: Enable/disable all push notifications
- **desktop**: Browser push notifications
- **mobile**: Mobile app push notifications
- **sound**: Play sound with notifications
- **vibration**: Vibrate device for notifications

### Frequency Settings
- **instant**: Immediate delivery for critical notifications
- **daily**: Daily digest for non-urgent updates
- **weekly**: Weekly summary for low-priority content
- **never**: Never send these types of notifications

## Advanced Features

### Rate Limiting
Prevent notification spam with configurable rate limits:

```typescript
// Template with rate limiting
const template = {
  conditions: {
    rateLimit: {
      maxPerHour: 5,    // Max 5 notifications per hour
      maxPerDay: 20,    // Max 20 notifications per day
      maxPerWeek: 50    // Max 50 notifications per week
    }
  }
};
```

### Time Windows (Quiet Hours)
Respect user sleep schedules and time zones:

```typescript
// Only send during business hours
const template = {
  conditions: {
    timeWindows: [{
      start: '09:00',
      end: '17:00',
      timezone: 'America/New_York',
      days: [1, 2, 3, 4, 5] // Monday to Friday
    }]
  }
};
```

### Circuit Breaker Integration
Automatic fallback when external services fail:

- Queues notifications when SendGrid/Twilio are down
- Automatic retry when services recover
- No message loss during outages

### Performance Monitoring
Track notification system performance:

```typescript
// Get system-wide statistics
const stats = await enhancedNotificationService.getNotificationStats();

// Monitor delivery rates
console.log(`Delivery rate: ${stats.deliveryRate}%`);
console.log(`Average delivery time: ${stats.averageDeliveryTime}s`);
```

## Error Handling

### Common Error Codes

- `GET_PREFERENCES_FAILED`: Failed to retrieve user preferences
- `UPDATE_PREFERENCES_FAILED`: Failed to update preferences
- `TEST_NOTIFICATION_FAILED`: Test notification sending failed
- `GET_STATS_FAILED`: Failed to retrieve statistics
- `GET_HISTORY_FAILED`: Failed to retrieve notification history
- `UNSUBSCRIBE_FAILED`: Failed to unsubscribe from notifications
- `GET_TEMPLATES_FAILED`: Failed to retrieve templates

### Error Response Format

```json
{
  "success": false,
  "error": "UPDATE_PREFERENCES_FAILED",
  "message": "Failed to update notification preferences",
  "details": {
    "field": "notifications.email.marketing",
    "reason": "Invalid boolean value"
  }
}
```

## Client Integration Examples

### React Hook for Notification Preferences

```typescript
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications/preferences');
      setPreferences(response.data.notifications);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates) => {
    try {
      const response = await api.put('/notifications/preferences', {
        notifications: updates
      });
      setPreferences(response.data.notifications);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const sendTestNotification = async (type, template) => {
    try {
      const response = await api.post('/notifications/test', {
        type,
        template
      });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Test failed');
    }
  };

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    sendTestNotification,
    refetch: fetchPreferences
  };
}
```

### Vue.js Notification Preferences Component

```vue
<template>
  <div class="notification-preferences">
    <h2>Notification Preferences</h2>
    
    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <form v-else @submit.prevent="savePreferences">
      <div class="preference-group">
        <h3>Email Notifications</h3>
        <label v-for="(value, key) in preferences.email" :key="key">
          <input 
            type="checkbox" 
            v-model="preferences.email[key]"
            @change="markDirty"
          />
          {{ formatLabel(key) }}
        </label>
      </div>

      <div class="preference-group">
        <h3>SMS Notifications</h3>
        <label v-for="(value, key) in preferences.sms" :key="key">
          <input 
            type="checkbox" 
            v-model="preferences.sms[key]"
            @change="markDirty"
          />
          {{ formatLabel(key) }}
        </label>
      </div>

      <button type="submit" :disabled="!isDirty || saving">
        {{ saving ? 'Saving...' : 'Save Preferences' }}
      </button>
    </form>

    <div class="test-section">
      <h3>Test Notifications</h3>
      <button @click="sendTest('email')">Test Email</button>
      <button @click="sendTest('sms')">Test SMS</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      preferences: null,
      loading: true,
      error: null,
      saving: false,
      isDirty: false
    };
  },
  
  async mounted() {
    await this.loadPreferences();
  },
  
  methods: {
    async loadPreferences() {
      try {
        this.loading = true;
        const response = await this.$api.get('/notifications/preferences');
        this.preferences = response.data.notifications;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    
    async savePreferences() {
      try {
        this.saving = true;
        await this.$api.put('/notifications/preferences', {
          notifications: this.preferences
        });
        this.isDirty = false;
        this.$toast.success('Preferences saved successfully');
      } catch (error) {
        this.$toast.error('Failed to save preferences');
      } finally {
        this.saving = false;
      }
    },
    
    async sendTest(type) {
      try {
        await this.$api.post('/notifications/test', { type });
        this.$toast.success(`Test ${type} sent successfully`);
      } catch (error) {
        this.$toast.error(`Failed to send test ${type}`);
      }
    },
    
    markDirty() {
      this.isDirty = true;
    },
    
    formatLabel(key) {
      return key.replace(/([A-Z])/g, ' $1').toLowerCase()
        .replace(/^./, str => str.toUpperCase());
    }
  }
};
</script>
```

## Best Practices

### For Developers

1. **Always Check User Preferences**: Respect user choices unless it's critical
2. **Use Appropriate Priority Levels**: Reserve 'critical' for actual emergencies
3. **Implement Rate Limiting**: Prevent notification spam
4. **Provide Unsubscribe Options**: Include in all marketing communications
5. **Track Performance**: Monitor delivery rates and user engagement
6. **Test Thoroughly**: Use test endpoints during development

### For Users

1. **Customize Your Preferences**: Set up notifications that work for you
2. **Use Test Features**: Verify your settings work as expected
3. **Review Regularly**: Update preferences as your needs change
4. **Check Spam Folders**: Ensure notifications aren't filtered
5. **Keep Contact Info Updated**: Verify email and phone number

### Security Considerations

1. **Critical Notifications**: Security alerts bypass user preferences
2. **Authentication Required**: All preference changes require login
3. **Audit Logging**: All changes are logged for security
4. **Rate Limiting**: Prevents abuse of notification system
5. **Data Privacy**: Notification content is not stored long-term

## Troubleshooting

### Common Issues

1. **Not Receiving Notifications**
   - Check user preferences settings
   - Verify email/phone number is verified
   - Check spam/junk folders
   - Review notification history for failures

2. **Test Notifications Failing**
   - Verify account has verified contact methods
   - Check external service status (SendGrid/Twilio)
   - Review circuit breaker status

3. **Preferences Not Saving**
   - Check authentication token is valid
   - Verify request format matches API schema
   - Review server logs for validation errors

4. **Missing Notification Types**
   - Verify templates are registered
   - Check user has permissions for notification type
   - Review application logs for errors

### Debug Information

Enable debug logging to troubleshoot issues:

```typescript
// Check notification service status
const stats = await enhancedNotificationService.getNotificationStats();
console.log('Service stats:', stats);

// Check circuit breaker status
const circuitStatus = enhancedNotificationService.getCircuitBreakerStatus();
console.log('Circuit breaker status:', circuitStatus);

// Review user preferences
const prefs = await userPreferencesService.getUserPreferences(userId);
console.log('User preferences:', prefs);
```