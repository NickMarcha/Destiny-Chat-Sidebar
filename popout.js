const toggle = document.getElementById("toggleStyle");

// Load saved state
browser.storage.local.get("styleEnabled").then((data) => {
  toggle.checked = !!data.styleEnabled;
});

toggle.addEventListener("change", async () => {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  const enabled = toggle.checked;

  await browser.storage.local.set({ styleEnabled: enabled });

  if (tab && tab.url.includes("destiny.gg")) {
    if (enabled) {
      await browser.tabs.insertCSS(tab.id, { file: "dgg-sidebar-styles.css" });
    } else {
      await browser.tabs.removeCSS(tab.id, { file: "dgg-sidebar-styles.css" });
    }
  }
});
