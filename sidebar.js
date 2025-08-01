document.addEventListener("DOMContentLoaded", function () {
  console.log("Sidebar loaded");

  const menu = document.getElementById("dgg-tabs-menu");
  const countSpan = document.getElementById("dgg-tabs-count");
  const countPrefixSpan = document.getElementById("dgg-tabs-count-prefix");
  const listDiv = document.getElementById("dgg-tabs-list");

  async function updateTabsList() {
    const tabs = await browser.tabs.query({ url: "*://*.destiny.gg/*" });

    if (tabs.length === 0) {
      countPrefixSpan.textContent = ""; // Clear prefix text
      // Hide the normal menu and show a single link
      document.getElementById("dgg-tabs-count").style.display = "none";
      document.getElementById("dgg-tabs-list").style.display = "none";
      // Add or show the open link
      let openLink = document.getElementById("dgg-open-bigscreen");
      if (!openLink) {
        openLink = document.createElement("a");
        openLink.id = "dgg-open-bigscreen";
        openLink.textContent = "open bigscreen";
        openLink.className = "dgg-menu-btn";
        openLink.onclick = () =>
          browser.tabs.create({ url: "https://www.destiny.gg/bigscreen" });
        document
          .getElementById("dgg-tabs-menu")
          .parentNode.appendChild(openLink);
      }
      openLink.style.display = "flex";
      return;
    } else {
      countPrefixSpan.textContent = "d.gg tabs ="; // Restore prefix text
      // Restore menu
      document.getElementById("dgg-tabs-count").style.display = "";
      document.getElementById("dgg-tabs-list").style.display = "none";
      let openLink = document.getElementById("dgg-open-bigscreen");
      if (openLink) openLink.style.display = "none";
    }

    // Update count
    document.getElementById("dgg-tabs-count").textContent = tabs.length;

    function getTabLabel(tab) {
      try {
        const url = new URL(tab.url);
        if (url.pathname === "/" || url.pathname === "/index") return "home";
        if (url.pathname === "/bigscreen" && !url.hash) return "bigscreen";
        if (url.pathname === "/bigscreen" && url.hash) return url.hash.slice(1);
        return url.pathname + url.hash;
      } catch {
        return tab.title || tab.url;
      }
    }

    // With this:
    const tabsListDiv = document.getElementById("dgg-tabs-list");
    tabsListDiv.innerHTML = ""; // Clear previous content

    // Header
    const headerDiv = document.createElement("div");
    headerDiv.className = "dgg-tabs-list-header";

    const titleSpan = document.createElement("span");
    titleSpan.className = "dgg-tabs-list-title";
    titleSpan.textContent = "jump to";

    const closeAllBtn = document.createElement("button");
    closeAllBtn.id = "dgg-close-all";
    closeAllBtn.className = "dgg-close-all-btn";
    closeAllBtn.textContent = "Close All";

    headerDiv.appendChild(titleSpan);
    headerDiv.appendChild(closeAllBtn);
    tabsListDiv.appendChild(headerDiv);

    // Tab items
    tabs.forEach((tab) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "dgg-tabs-list-item";

      const jumpSpan = document.createElement("span");
      jumpSpan.dataset.tabid = tab.id;
      jumpSpan.className = "dgg-jump";
      jumpSpan.textContent = getTabLabel(tab);

      const closeBtn = document.createElement("button");
      closeBtn.dataset.tabid = tab.id;
      closeBtn.className = "dgg-close";
      closeBtn.textContent = "✕";

      itemDiv.appendChild(jumpSpan);
      itemDiv.appendChild(closeBtn);
      tabsListDiv.appendChild(itemDiv);
    });
  }
  // Toggle list visibility
  menu.addEventListener("click", function (e) {
    if (e.target === countSpan) return; // allow clicking count
    listDiv.style.display =
      listDiv.style.display === "block" ? "none" : "block";
  });

  // Handle jump/close/close all
  listDiv.addEventListener("click", async function (e) {
    if (e.target.classList.contains("dgg-jump")) {
      const tabId = parseInt(e.target.dataset.tabid, 10);
      await browser.tabs.update(tabId, { active: true });
      await browser.windows.update((await browser.tabs.get(tabId)).windowId, {
        focused: true,
      });
    }
    if (e.target.classList.contains("dgg-close")) {
      const tabId = parseInt(e.target.dataset.tabid, 10);
      await browser.tabs.remove(tabId);
      updateTabsList();
    }
    if (e.target.id === "dgg-close-all") {
      const tabs = await browser.tabs.query({ url: "*://*.destiny.gg/*" });
      await browser.tabs.remove(tabs.map((t) => t.id));
      updateTabsList();
    }
  });

  // Update count when tabs change
  browser.tabs.onCreated.addListener(updateTabsList);
  browser.tabs.onRemoved.addListener(updateTabsList);
  browser.tabs.onUpdated.addListener(updateTabsList);

  updateTabsList();
});
