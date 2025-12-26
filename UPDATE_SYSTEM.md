# PWA Update System

## How It Works

RustLens now has an automatic update detection system that solves the caching problem!

### The Problem
- PWAs use service workers to cache all files for offline use
- When you deploy new code, users continue to see the old cached version
- The app doesn't automatically update without manual intervention

### The Solution

We've implemented a comprehensive update system with:

1. **Automatic Update Detection**
   - Service worker checks for updates every 60 seconds
   - Detects when new code is deployed to the server
   - No manual intervention needed by you (the developer)

2. **User Notification**
   - When a new version is detected, users see a prominent update prompt at the bottom
   - Shows: "🚀 New version available!"
   - Explains what will happen when they update
   - Two options:
     - "Reload & Update" - Immediately gets the new version
     - "Later" - Dismisses (but will show again on next page load)

3. **Cache Invalidation**
   - `cleanupOutdatedCaches: true` - Automatically removes old cached files
   - `registerType: 'prompt'` - Waits for user confirmation before updating
   - Service worker properly manages cache lifecycle

4. **Refresh Questions Button**
   - The existing 🔄 button in the header reloads question data
   - Works independently of app updates
   - Useful for forcing a data refresh

## How Updates Work Now

### When You Deploy:

1. **Push to GitHub** → Changes automatically deploy via GitHub Actions
2. **Service Worker Detects** → Within 60 seconds, users' apps check for updates
3. **User Notified** → Update prompt appears at bottom of screen
4. **User Updates** → Click "Reload & Update" to get new version instantly

### What Users See:

```
┌─────────────────────────────────────────┐
│ 🚀 New version available!                │
│                                           │
│ Click reload to update to the latest     │
│ version with new questions and features. │
│                                           │
│ [Reload & Update]  [Later]               │
└─────────────────────────────────────────┘
```

## Key Configuration

### vite.config.ts
```typescript
VitePWA({
  registerType: 'prompt',           // Shows update prompt to user
  injectRegister: 'auto',           // Automatically register SW
  workbox: {
    cleanupOutdatedCaches: true,    // Remove old caches
    skipWaiting: false,             // Wait for user confirmation
    clientsClaim: true,             // Take control of clients
  }
})
```

### UpdatePrompt.tsx
```typescript
// Checks for updates every 60 seconds
setInterval(() => {
  registration.update();
}, 60000);
```

## Benefits

1. **Server-Side Control** ✅
   - You don't need to manually invalidate caches
   - Just deploy - the system handles everything

2. **User Experience** ✅
   - Users get notified of updates
   - They choose when to update
   - No unexpected refreshes

3. **Reliable Updates** ✅
   - 60-second check interval ensures quick detection
   - Proper cache cleanup prevents stale data
   - Works on all platforms (iOS, Android, Desktop)

## Testing Updates

To test the update system:

1. Make a small change to the app (e.g., change text)
2. Build and deploy: `npm run build && git add . && git commit -m "test" && git push`
3. Wait 1-2 minutes for GitHub Actions to deploy
4. On your phone: Wait up to 60 seconds, or close/reopen the app
5. You should see the update prompt appear
6. Click "Reload & Update" to get the new version

## Cache Strategy

- **App Shell** (HTML, CSS, JS): Cached with versioning, updates on new deployment
- **Questions Data** (JSON): Cached but refreshed via update mechanism
- **Images/Icons**: Cached permanently
- **Fonts**: Cached for 1 year

## Troubleshooting

If updates aren't appearing:

1. **Check GitHub Actions** - Ensure deployment succeeded
2. **Wait 60 seconds** - Auto-check runs every minute
3. **Hard Refresh** - In browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
4. **Clear App Data** - On phone: Remove app, reinstall from browser
5. **Check Console** - Look for "Checking for updates..." messages
