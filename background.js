browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url.includes("destiny.gg")) {
    browser.storage.local.get("styleEnabled", (data) => {
      if (data.styleEnabled) {
        browser.tabs.insertCSS(tabId, { file: "dgg-sidebar-styles.css" });
      }
    });
  }
});
