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
