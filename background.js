browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url.includes("destiny.gg")) {
    browser.storage.local.get("styleEnabled", (data) => {
      if (data.styleEnabled) {
        browser.tabs.insertCSS(tabId, { file: "dgg-sidebar-styles.css" });
      }
    });
  }
});

browser.runtime.onInstalled.addListener(() => {
  browser.storage.local.set({ styleEnabled: true });
});

browser.runtime.onMessage.addListener((msg, sender) => {
  if (typeof msg.dggLiveStatus === "boolean") {
    const isLive = msg.dggLiveStatus;

    //const badgeText = isLive ? "LIVE" : "";
    //const badgeColor = isLive ? "#FF0000" : "#808080";

    const iconPath = isLive
      ? {
          48: "icons/icon-48-live.png",
          128: "icons/icon-128-live.png",
        }
      : {
          48: "icons/icon-48.png",
          128: "icons/icon-128.png",
        };

    browser.sidebarAction
      .setIcon({ path: iconPath })
      .then(() => {
        console.log("Sidebar Icon set successfully");
      })
      .catch((err) => {
        console.error("Error setting icon:", err);
      });

    browser.browserAction
      .setIcon({ path: iconPath })
      .then(() => {
        console.log("Icon set successfully");
      })
      .catch((err) => {
        console.error("Error setting icon:", err);
      });

    /*
    browser.browserAction
      .setBadgeText({
        text: badgeText,
      })
      .then(() => {
        console.log("Badge text set to:", badgeText);
      })
      .catch((error) => {
        console.error("Error setting badge text:", error);
      });

    browser.browserAction
      .setBadgeBackgroundColor({
        color: badgeColor,
      })
      .then(() => {
        console.log("Badge background color set to:", badgeColor);
      })
      .catch((error) => {
        console.error("Error setting badge background color:", error);
      });

      */
  }
});

// --- Destiny.gg WebSocket connection in background.js ---
let ws;
function connectDggWebSocket() {
  if (ws && ws.readyState === WebSocket.OPEN) return;

  ws = new WebSocket("wss://live.destiny.gg/socket");

  ws.onopen = () => {
    console.log("Connected to Destiny.gg WebSocket");
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (
        data.type === "dggApi:streamInfo" &&
        data.data &&
        data.data.streams &&
        data.data.streams.youtube
      ) {
        const isLive = !!data.data.streams.youtube.live;
        // Broadcast to all extension parts (sidebar, popup, etc.)
        browser.runtime.sendMessage({ dggLiveStatus: isLive });
      }
    } catch (e) {}
  };

  ws.onclose = (event) => {
    console.log("WebSocket closed, reconnecting in 5s...");
    console.log(
      "Close event code:",
      event.code,
      "reason:",
      event.reason,
      "wasClean:",
      event.wasClean
    );
    setTimeout(connectDggWebSocket, 5000);
  };

  ws.onerror = (err) => {
    console.error("WebSocket error event:", err);
    if (ws) {
      console.error("WebSocket readyState:", ws.readyState); // 0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED
      console.error("WebSocket URL:", ws.url);
    }
    ws.close();
  };
}

// Start the connection when the extension loads
connectDggWebSocket();
