# AI Code Generation

Unlock the full potential of AI-assisted development with Zoptal's advanced code generation capabilities. This comprehensive guide covers everything from basic prompts to advanced techniques.

## 🤖 Understanding Zoptal's AI

Zoptal integrates multiple AI models to provide the best code generation experience:

- **GPT-4** - General-purpose code generation and problem-solving
- **Claude** - Advanced reasoning and code analysis
- **Codex** - Specialized for code completion and generation
- **Custom Models** - Fine-tuned for specific frameworks and patterns

### AI Capabilities
- **✍️ Code Generation** - Write functions, components, and entire modules
- **🔍 Code Analysis** - Review, optimize, and explain existing code
- **🐛 Debugging** - Find and fix bugs with explanations
- **📚 Documentation** - Generate comments and documentation
- **🔄 Refactoring** - Improve code structure and performance
- **🧪 Testing** - Create unit tests and test cases

## 💬 Basic Code Generation

### Simple Function Generation

**Prompt**:
```
Create a function that calculates the factorial of a number
```

**Generated Code**:
```javascript
/**
 * Calculates the factorial of a given number
 * @param {number} n - The number to calculate factorial for
 * @returns {number} The factorial of n
 */
function factorial(n) {
  // Handle edge cases
  if (n < 0) {
    throw new Error('Factorial is not defined for negative numbers');
  }
  if (n === 0 || n === 1) {
    return 1;
  }
  
  // Calculate factorial recursively
  return n * factorial(n - 1);
}

// Example usage:
console.log(factorial(5)); // Output: 120
```

### React Component Generation

**Prompt**:
```
Create a React component for a user profile card with name, email, avatar, and a follow button
```

**Generated Code**:
```jsx
import React, { useState } from 'react';
import './UserProfileCard.css';

const UserProfileCard = ({ 
  user = {}, 
  onFollow = () => {}, 
  isFollowing = false 
}) => {
  const [following, setFollowing] = useState(isFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollowClick = async () => {
    setLoading(true);
    try {
      await onFollow(user.id, !following);
      setFollowing(!following);
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-profile-card">
      <div className="profile-header">
        <img 
          src={user.avatar || '/default-avatar.png'} 
          alt={`${user.name}'s avatar`}
          className="profile-avatar"
        />
        <div className="profile-info">
          <h3 className="profile-name">{user.name || 'Unknown User'}</h3>
          <p className="profile-email">{user.email}</p>
        </div>
      </div>
      
      <button 
        className={`follow-button ${following ? 'following' : ''}`}
        onClick={handleFollowClick}
        disabled={loading}
      >
        {loading ? 'Loading...' : following ? 'Following' : 'Follow'}
      </button>
    </div>
  );
};

export default UserProfileCard;
```

## 🎯 Advanced Prompting Techniques

### 1. Context-Aware Generation

**Good Prompt Structure**:
```
Context: I'm building a [type of application]
Framework: [React/Vue/Angular/etc.]
Requirements: [specific requirements]
Constraints: [any limitations]

Task: [what you want generated]
```

**Example**:
```
Context: I'm building a task management application
Framework: React with TypeScript
Requirements: 
- Drag and drop functionality
- Real-time updates
- Keyboard shortcuts
- Accessibility support
Constraints: Must work on mobile devices

Task: Create a TaskBoard component with columns for "Todo", "In Progress", and "Done"
```

### 2. Iterative Refinement

Start with a basic request, then refine:

**Initial Prompt**:
```
Create a login form
```

**Refinement Prompts**:
```
Add form validation with error messages
Add loading state while submitting
Add "Remember me" checkbox
Add password visibility toggle
Make it responsive for mobile
Add accessibility attributes
```

### 3. Code Style Specification

**Prompt with Style Guidelines**:
```
Create a user authentication service using:
- Functional programming style
- TypeScript with strict types
- Error handling with Result pattern
- JSDoc comments
- No external dependencies beyond fetch
```

## 🛠️ Specialized AI Features

### Code Analysis and Review

**Feature**: Select code and ask for analysis

**Example Code**:
```javascript
function processData(data) {
  var result = [];
  for (var i = 0; i < data.length; i++) {
    if (data[i].active) {
      result.push(data[i].name.toUpperCase());
    }
  }
  return result;
}
```

**AI Analysis**:
```
🔍 Code Review Results:

Issues Found:
1. Using 'var' instead of 'const/let' (ES6 best practice)
2. Imperative style - could be more functional
3. No null/undefined checks
4. No type safety

Suggestions:
1. Use modern JavaScript features
2. Add input validation
3. Use functional programming approach
4. Add TypeScript types

Refactored Version:
```

```typescript
/**
 * Processes active user data and returns uppercase names
 * @param data - Array of user objects
 * @returns Array of uppercase names for active users
 */
function processData(data: { active: boolean; name: string }[]): string[] {
  if (!Array.isArray(data)) {
    throw new Error('Input must be an array');
  }
  
  return data
    .filter(item => item?.active)
    .map(item => item.name?.toUpperCase() || '')
    .filter(name => name.length > 0);
}
```

### Test Generation

**Original Function**:
```javascript
function calculateDiscount(price, discountPercent, userType) {
  if (userType === 'premium') {
    discountPercent += 5;
  }
  return price * (1 - discountPercent / 100);
}
```

**Prompt**:
```
Generate comprehensive unit tests for this function
```

**Generated Tests**:
```javascript
import { calculateDiscount } from './discount.js';

describe('calculateDiscount', () => {
  describe('Basic discount calculation', () => {
    test('should calculate 10% discount correctly', () => {
      expect(calculateDiscount(100, 10, 'regular')).toBe(90);
    });

    test('should handle zero discount', () => {
      expect(calculateDiscount(100, 0, 'regular')).toBe(100);
    });

    test('should handle 100% discount', () => {
      expect(calculateDiscount(100, 100, 'regular')).toBe(0);
    });
  });

  describe('Premium user bonuses', () => {
    test('should add 5% bonus for premium users', () => {
      expect(calculateDiscount(100, 10, 'premium')).toBe(85); // 15% total
    });

    test('should handle premium user with zero base discount', () => {
      expect(calculateDiscount(100, 0, 'premium')).toBe(95); // 5% bonus only
    });
  });

  describe('Edge cases', () => {
    test('should handle decimal prices', () => {
      expect(calculateDiscount(99.99, 10, 'regular')).toBeCloseTo(89.99);
    });

    test('should handle decimal discount percentages', () => {
      expect(calculateDiscount(100, 12.5, 'regular')).toBe(87.5);
    });
  });

  describe('Error handling', () => {
    test('should handle negative prices', () => {
      expect(calculateDiscount(-100, 10, 'regular')).toBe(-90);
    });

    test('should handle invalid user types', () => {
      expect(calculateDiscount(100, 10, 'invalid')).toBe(90);
    });
  });
});
```

## 🏗️ Framework-Specific Generation

### React Components

**Prompt**:
```
Create a React hook for managing form state with validation
```

**Generated Hook**:
```jsx
import { useState, useCallback } from 'react';

const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name, value) => {
    const rule = validationRules[name];
    if (!rule) return null;

    if (rule.required && (!value || value.toString().trim() === '')) {
      return rule.requiredMessage || `${name} is required`;
    }

    if (rule.minLength && value.length < rule.minLength) {
      return rule.minLengthMessage || `${name} must be at least ${rule.minLength} characters`;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.patternMessage || `${name} format is invalid`;
    }

    if (rule.custom && typeof rule.custom === 'function') {
      return rule.custom(value);
    }

    return null;
  }, [validationRules]);

  const validateAll = useCallback(() => {
    const newErrors = {};
    let hasErrors = false;

    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  }, [values, validationRules, validateField]);

  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [values, validateField]);

  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    
    if (!validateAll()) {
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateAll]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    isValid: Object.keys(errors).length === 0
  };
};

export default useFormValidation;
```

### Node.js/Express APIs

**Prompt**:
```
Create an Express.js route handler for user authentication with JWT tokens and rate limiting
```

**Generated Code**:
```javascript
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

// Login endpoint
router.post('/login', authLimiter, loginValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to too many failed login attempts'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment failed login attempts
      await user.incFailedLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset failed login attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await user.resetFailedLoginAttempts();
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Store refresh token in database
    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date(),
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip
    });

    // Limit number of refresh tokens per user
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    await user.save();

    // Set secure HTTP-only cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          lastLoginAt: new Date()
        },
        tokens: {
          accessToken,
          expiresIn: '15m'
        }
      }
    });

    // Update last login time
    user.lastLoginAt = new Date();
    await user.save();

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Token refresh endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find user and validate refresh token
    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokens.some(rt => rt.token === refreshToken)) {
      return res.status(403).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        expiresIn: '15m'
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (refreshToken) {
      // Remove refresh token from user's stored tokens
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
        await user.save();
      }
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    // Even if there's an error, clear the cookie
    res.clearCookie('refreshToken');
    res.json({
      success: true,
      message: 'Logout successful'
    });
  }
});

module.exports = router;
```

## 🎨 Best Practices for AI Prompts

### ✅ Do's

**Be Specific and Detailed**
```
❌ "Create a form"
✅ "Create a React contact form with name, email, phone, and message fields, including validation, loading states, and error handling"
```

**Provide Context**
```
❌ "Make this function better"
✅ "Optimize this function for performance when handling large datasets (>10,000 items). Current version is too slow."
```

**Specify Requirements**
```
❌ "Add authentication"
✅ "Add JWT-based authentication with login, logout, token refresh, and protected routes. Include error handling and loading states."
```

**Include Examples**
```
❌ "Create a utility function"
✅ "Create a utility function like lodash's debounce that delays function execution. Example usage: debounce(myFunction, 300)"
```

### ❌ Don'ts

**Avoid Vague Requests**
```
❌ "Fix this code"
❌ "Make it look better"
❌ "Add more features"
```

**Don't Skip Error Handling**
```
❌ "Create a login function"
✅ "Create a login function with proper error handling for network errors, invalid credentials, and server errors"
```

**Don't Ignore Accessibility**
```
❌ "Create a modal component"
✅ "Create a modal component with proper ARIA attributes, keyboard navigation, and focus management"
```

## 🧪 Testing AI-Generated Code

Always test and review AI-generated code:

### 1. **Code Review Checklist**
- ✅ Logic correctness
- ✅ Error handling
- ✅ Performance considerations
- ✅ Security implications
- ✅ Accessibility compliance
- ✅ Code style consistency

### 2. **Testing Strategies**
- **Unit Tests** - Test individual functions
- **Integration Tests** - Test component interactions
- **Manual Testing** - User flow verification
- **Performance Testing** - Load and stress testing

### 3. **Security Review**
- Input validation
- Authentication/authorization
- Data sanitization
- SQL injection prevention
- XSS protection

## 📚 Learning from AI

Use AI as a learning tool:

### Ask for Explanations
```
Prompt: "Explain why you chose this approach over alternatives"
Prompt: "What are the trade-offs of this implementation?"
Prompt: "How could this code be improved further?"
```

### Request Learning Resources
```
Prompt: "Recommend resources to learn more about React hooks"
Prompt: "What design patterns are used in this code?"
Prompt: "Explain the performance implications of this approach"
```

## 🚀 Advanced AI Workflows

### 1. **Multi-Step Development**
```
Step 1: "Create a basic user authentication system"
Step 2: "Add password reset functionality to the auth system"
Step 3: "Add two-factor authentication support"
Step 4: "Add social login options (Google, GitHub)"
```

### 2. **Code Evolution**
```
Start: "Create a simple todo list"
Evolve: "Add drag and drop to reorder todos"
Enhance: "Add categories and filtering"
Scale: "Add collaborative editing features"
```

### 3. **Architecture Guidance**
```
Prompt: "Design the architecture for a real-time chat application with 1000+ concurrent users"
Prompt: "Suggest database schema for an e-commerce platform"
Prompt: "Recommend microservices structure for this monolith"
```

---

**Next**: [Real-time Collaboration](collaboration.md) - Work with your team

**Practice**: [AI Development Tutorial](../tutorials/ai-development-tutorial.md) - Hands-on AI coding

**Watch**: [AI Features Video](../video-scripts/ai-features-video.md) - Visual guide to AI features

---

*Code smarter, not harder! 🤖🚀*