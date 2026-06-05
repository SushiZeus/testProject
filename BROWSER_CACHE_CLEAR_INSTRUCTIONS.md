# Browser Cache Clear Instructions

## Issue: Tiles Not Responding After Update

The tiles have been fixed in the code, but your browser may be caching the old version. Here's how to force a refresh:

## Quick Fix: Hard Refresh

### Windows/Linux:
- **Chrome/Edge/Firefox**: Press `Ctrl + Shift + R` or `Ctrl + F5`
- **Alternative**: Press `Shift` and click the refresh button

### Mac:
- **Chrome/Safari**: Press `Cmd + Shift + R`
- **Firefox**: Press `Cmd + Shift + R` or `Cmd + F5`

## Complete Cache Clear (If Hard Refresh Doesn't Work)

### Chrome/Edge:
1. Press `F12` to open Developer Tools
2. Right-click the refresh button (while DevTools is open)
3. Select "Empty Cache and Hard Reload"

OR

1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh the page

### Firefox:
1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select "Cache"
3. Click "Clear Now"
4. Refresh the page

### Safari:
1. Press `Cmd + Option + E` to empty caches
2. Refresh the page

## Verify the Fix is Loaded

After clearing cache, open the browser console (F12) and check:
- There should be NO red errors
- The tiles should be clickable (for Documentation Officer role)
- Console should be clean

## Current Server Status

The server is running with the latest code:
- **Local**: http://localhost:4173/
- **Network**: http://192.168.0.114:4173/

## What Was Fixed

The issue was that non-clickable tiles were trying to call an undefined `onClick` function. The fix adds a proper check:

```typescript
const handleClick = () => {
  if (clickable && onClick) {
    onClick();
  }
};
```

This ensures:
- Only clickable tiles respond to clicks
- No errors for non-clickable tiles
- Proper functionality for all user roles

## Test After Cache Clear

1. **Login as Documentation Officer**
   - Email: documentation_officer@company.com
   - Password: documentation_officer123

2. **Check Dashboard**
   - You should see 5 tiles (SEA, AIR, ROAD, RAIL, Files Without Documents)
   - Hover over tiles - should see "Click to view files" hint
   - Click any tile - should open dialog with filtered files
   - No console errors

3. **Login as Other Role** (e.g., Operations Manager)
   - Should see different tiles (Total Files, Waiting, In Progress, Completed)
   - Tiles should NOT be clickable
   - No console errors

## Still Having Issues?

If you still see errors after clearing cache:

1. **Close all browser tabs** for the application
2. **Close the browser completely**
3. **Reopen browser** and navigate to http://localhost:4173/
4. **Login again**

## Alternative: Use Incognito/Private Mode

Open the application in an incognito/private window:
- **Chrome/Edge**: `Ctrl + Shift + N`
- **Firefox**: `Ctrl + Shift + P`
- **Safari**: `Cmd + Shift + N`

This ensures no cached files are used.

## For Network Users

If other users on the network are experiencing issues:
1. Ask them to do a hard refresh: `Ctrl + Shift + R`
2. Or clear their browser cache
3. The server is serving the latest version

## Verification

The latest build includes:
- File: `index-heLarfn7.js` (JavaScript)
- File: `index-BKEX0_zu.css` (Styles)

If you see different file names in the browser's Network tab (F12 > Network), you're loading an old cached version.
