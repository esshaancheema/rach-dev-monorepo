# Common Issues & Solutions

This guide covers the most frequently encountered issues and their solutions. Before contacting support, please check if your issue is listed here.

## 🔐 Authentication Issues

### Cannot Log In / "Invalid Credentials" Error

**Symptoms:**
- Login form shows "Invalid credentials" 
- Password reset doesn't work
- Account appears locked

**Solutions:**
1. **Check password carefully** - Ensure caps lock is off
2. **Try password reset**:
   - Click "Forgot Password" on login page
   - Check spam/junk folder for reset email
   - Use the reset link within 15 minutes
3. **Clear browser cache and cookies**:
   ```
   Chrome: Ctrl+Shift+Delete → Clear browsing data
   Firefox: Ctrl+Shift+Delete → Clear recent history
   Safari: Cmd+Opt+E → Empty caches
   ```
4. **Check account status**:
   - Account might be temporarily locked (wait 30 minutes)
   - Email verification might be pending
5. **Try incognito/private mode** to rule out browser issues

### JWT Token Expired / Unauthorized Access

**Symptoms:**
- "Token expired" error messages
- Automatically logged out
- API calls returning 401 errors

**Solutions:**
1. **Refresh the page** - Auto-refresh should work
2. **Log out and log back in** - Generates new tokens
3. **Check system clock** - Ensure your device time is correct
4. **Clear local storage**:
   ```javascript
   // Open browser console (F12) and run:
   localStorage.clear();
   sessionStorage.clear();
   ```
5. **For developers**: Check token expiration handling in your code

## 🤖 AI Assistant Issues

### AI Not Responding / Slow Responses

**Symptoms:**
- AI chat shows "thinking" for too long
- No response after sending prompt
- Error messages in AI chat

**Solutions:**
1. **Check internet connection** - AI requires stable connection
2. **Try simpler prompts** - Break complex requests into smaller parts
3. **Clear chat history**:
   - Click "Clear Chat" button
   - Start fresh conversation
4. **Check AI service status** at [status.zoptal.com](https://status.zoptal.com)
5. **Retry with different phrasing** - Sometimes rephrasing helps

### AI Generated Code Has Errors

**Symptoms:**
- Syntax errors in generated code
- Code doesn't work as expected
- Missing imports or dependencies

**Solutions:**
1. **Be more specific in prompts**:
   ```
   ❌ "Create a form"
   ✅ "Create a React login form with email/password validation using TypeScript"
   ```
2. **Provide context**:
   - Mention your framework/language
   - Include existing code snippets
   - Specify requirements clearly
3. **Ask AI to fix issues**:
   ```
   "The code above has a syntax error on line 15, can you fix it?"
   ```
4. **Review and test generated code** before applying
5. **Use incremental generation** - Build features step by step

## 💻 Project & Editor Issues

### Project Won't Load / Stuck Loading

**Symptoms:**
- Project dashboard shows loading spinner
- Files don't appear in file explorer
- "Failed to load project" error

**Solutions:**
1. **Refresh the page** (Ctrl+F5 or Cmd+Shift+R)
2. **Check browser console** for error messages:
   - Press F12 → Console tab
   - Look for red error messages
3. **Try different browser** - Test in Chrome, Firefox, Safari
4. **Disable browser extensions**:
   - Try in incognito/private mode
   - Disable ad blockers temporarily
5. **Clear browser cache** (see steps above)
6. **Check project size** - Large projects may take longer to load

### Files Not Saving / Auto-save Not Working

**Symptoms:**
- Changes not persisting after refresh
- "Failed to save" error messages
- File changes lost

**Solutions:**
1. **Check save status** in bottom status bar:
   - ✅ Saved - All good
   - ⏳ Saving - Wait for completion
   - ❌ Error - Try manual save (Ctrl+S)
2. **Manual save**: Press `Ctrl+S` (or `Cmd+S` on Mac)
3. **Check internet connection** - Auto-save requires connection
4. **Try refreshing** after manual save
5. **Close and reopen file** to verify changes
6. **For large files**: Save more frequently

### Code Editor Issues

**Symptoms:**
- Syntax highlighting not working
- Auto-complete not functioning
- Slow editor performance

**Solutions:**
1. **Check file extension** - Ensure correct (.js, .ts, .jsx, etc.)
2. **Restart language server**:
   - Command palette: Ctrl+Shift+P
   - Type "Restart Language Server"
3. **Clear editor cache**:
   - Settings → Editor → Clear Cache
4. **Reduce file size** if very large (>1MB)
5. **Close unused tabs** to improve performance
6. **Update browser** to latest version

## 🌐 Connection & Performance Issues

### Slow Performance / Page Loading Issues

**Symptoms:**
- Pages load slowly
- Features respond sluggishly
- Timeouts during operations

**Solutions:**
1. **Check internet speed** - Minimum 5 Mbps recommended
2. **Close unnecessary browser tabs** - Frees up memory
3. **Restart browser** - Clears memory leaks
4. **Update browser** to latest version
5. **Disable heavy extensions** - Ad blockers, VPNs may slow things
6. **Try different time** - Peak hours might be slower
7. **Check system resources**:
   - Close other applications using lots of RAM
   - Ensure sufficient disk space (>1GB free)

### "Unable to Connect" / Network Errors

**Symptoms:**
- Connection failed messages
- Features not loading
- Intermittent disconnections

**Solutions:**
1. **Check internet connection** - Try other websites
2. **Disable VPN temporarily** - VPNs can cause issues
3. **Check firewall settings** - Ensure Zoptal isn't blocked
4. **Try different network** - Mobile hotspot, different WiFi
5. **Flush DNS cache**:
   ```bash
   Windows: ipconfig /flushdns
   Mac: sudo dscacheutil -flushcache
   Linux: sudo systemctl restart systemd-resolved
   ```
6. **Check corporate network** - Work networks may block WebSockets

## 👥 Collaboration Issues

### Can't See Team Members' Changes

**Symptoms:**
- Other users' edits not visible
- Conflicts when multiple people edit
- Chat messages not appearing

**Solutions:**
1. **Refresh the page** - Forces sync
2. **Check collaboration status** in header:
   - 🟢 Connected - All good
   - 🟡 Syncing - Wait for completion
   - 🔴 Disconnected - Connection issue
3. **Ensure WebSocket support**:
   - Corporate networks may block WebSockets
   - Try different network/VPN
4. **Check permissions** - Ensure you have edit access
5. **Clear browser cache** and reload

### Invitation Links Not Working

**Symptoms:**
- "Invalid invitation" error
- Link expires too quickly
- Can't join shared project

**Solutions:**
1. **Check link expiration** - Links expire after 7 days
2. **Try copying link again** - Avoid truncated URLs
3. **Check email spam folder** - Invitations might be filtered
4. **Request new invitation** from project owner
5. **Ensure correct email** - Must match invited email address
6. **Try different browser** - Some corporate settings block certain domains

## 📱 Mobile & Browser Issues

### Mobile App Issues

**Symptoms:**
- Features not working on mobile
- Layout problems on small screens
- Touch interactions not responsive

**Solutions:**
1. **Use landscape mode** for better experience
2. **Update mobile browser** to latest version
3. **Clear mobile browser cache**:
   ```
   Chrome Mobile: Menu → History → Clear browsing data
   Safari Mobile: Settings → Safari → Clear History and Website Data
   ```
4. **Try different mobile browser** - Chrome, Firefox, Safari
5. **Ensure stable connection** - WiFi preferred over cellular
6. **Close other mobile apps** to free memory

### Browser Compatibility Issues

**Symptoms:**
- Features not working in specific browser
- Layout broken or distorted
- JavaScript errors in console

**Solutions:**
1. **Use supported browsers**:
   - ✅ Chrome 90+
   - ✅ Firefox 88+
   - ✅ Safari 14+
   - ✅ Edge 90+
2. **Update browser** to latest version
3. **Enable JavaScript** in browser settings
4. **Disable conflicting extensions**:
   - Ad blockers
   - Privacy extensions
   - Script blockers
5. **Reset browser settings** if issues persist

## 🔧 Development & Build Issues

### Build Failures / Deployment Issues

**Symptoms:**
- "Build failed" error messages
- Deployment stuck or failing
- Missing dependencies errors

**Solutions:**
1. **Check build logs** for specific errors:
   - Click on failed build to see details
   - Look for red error messages
2. **Common fixes**:
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   
   # Update dependencies
   npm update
   
   # Fix package vulnerabilities
   npm audit fix
   ```
3. **Check package.json** for:
   - Correct script commands
   - Compatible dependency versions
   - Proper build configuration
4. **Environment variables** - Ensure all required env vars are set
5. **Try different build target** - Different deployment platforms

### Import/Export Errors

**Symptoms:**
- "Module not found" errors
- Import statements failing
- Export/import syntax issues

**Solutions:**
1. **Check file paths** - Ensure correct relative/absolute paths
2. **File extensions** - Include .js, .ts, .jsx extensions if needed
3. **Case sensitivity** - Ensure correct capitalization
4. **Named vs default exports**:
   ```javascript
   // Named export
   export { MyComponent };
   import { MyComponent } from './file';
   
   // Default export  
   export default MyComponent;
   import MyComponent from './file';
   ```
5. **Check if file exists** in correct location
6. **Restart language server** via command palette

## 📊 Data & Storage Issues

### Data Not Persisting / Lost Work

**Symptoms:**
- Work disappears after refresh
- Database connection errors
- "Failed to save" messages

**Solutions:**
1. **Check auto-save status** - Look for save indicators
2. **Manual backup**:
   - Download project files regularly
   - Export to GitHub repository
   - Use "Export Project" feature
3. **Check browser storage**:
   ```javascript
   // Check available storage (in browser console)
   navigator.storage.estimate().then(data => console.log(data));
   ```
4. **Clear storage if full**:
   - Delete old projects
   - Clear browser cache
   - Remove large uploaded files
5. **Contact support** if data is critical

## 🆘 Getting Additional Help

### When to Contact Support

Contact support if:
- Issue persists after trying solutions above
- You're experiencing data loss
- Security concerns
- Billing or account issues
- Bug reports with reproducible steps

### How to Get Better Support

When contacting support, include:
1. **Detailed description** of the issue
2. **Steps to reproduce** the problem
3. **Browser and OS information**
4. **Screenshots or screen recording**
5. **Error messages** (copy exact text)
6. **Project ID** (if project-specific issue)

### Support Channels

- **In-app chat** - Click "?" icon (fastest response)
- **Email**: support@zoptal.com
- **Community Discord** - Get help from other users
- **GitHub Issues** - For bug reports
- **Documentation** - Check this guide first

## 🔍 Diagnostic Tools

### Browser Console
Press `F12` and check:
- **Console tab** - JavaScript errors
- **Network tab** - Failed requests
- **Application tab** - Storage data
- **Performance tab** - Slow operations

### Connection Test
```javascript
// Test WebSocket connection (paste in browser console)
const ws = new WebSocket('wss://api.zoptal.com');
ws.onopen = () => console.log('WebSocket connected');
ws.onerror = (e) => console.log('WebSocket error:', e);
```

### Performance Check
```javascript
// Check memory usage (paste in browser console)
console.log('Memory:', performance.memory);
console.log('Connection:', navigator.connection);
```

---

**Still having issues?** → [Contact Support](support.md)

**Found a bug?** → [Report Bug](https://github.com/zoptal/issues)

**Want to suggest improvements?** → [Feature Requests](https://zoptal.com/feedback)

---

*We're here to help! 🚀*