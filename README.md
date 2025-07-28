# Destiny.gg Chat Sidebar Extension for Firefox

This Firefox extension embeds the Destiny.gg chat in a sidebar panel, similar to how BitWarden and other extensions use the Firefox sidebar.

## Features

- Clean sidebar integration using Firefox's native sidebar API
- Sidebar stays open as you switch tabs, resize the sidebar by dragging its edge
- Cleans up /bigscreen to hide chat and keep embeds menu. (can be disabled through extension menu)

Install from [Firefox Browser Add-Ons](https://addons.mozilla.org/en-US/firefox/addon/destiny-chat-sidebar/).

## Debugging

### Method 1: Load as Temporary Extension (for testing)

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on..."
4. Select the `manifest.json` file from this extension folder
5. The extension will be loaded and you'll see the sidebar icon in your toolbar
