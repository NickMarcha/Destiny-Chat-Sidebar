browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url?.includes("destiny.gg")) {
    try {
      const data = await browser.storage.local.get("styleEnabled");
      if (data.styleEnabled) {
        await browser.tabs.insertCSS(tabId, { file: "dgg-sidebar-styles.css" });
      }
    } catch (err) {
      console.error("Failed to insert CSS:", err);
    }
  }
});
