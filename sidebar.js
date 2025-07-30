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
        openLink.style.cssText =
          "display:flex;align-items:center;justify-content:center;position:absolute;bottom:0;left:50%;transform:translateX(-50%);z-index:10;text-decoration:none;";
        openLink.onclick = () =>
          browser.tabs.create({ url: "https://www.destiny.gg/bigscreen" });
        document
          .getElementById("dgg-tabs-menu")
          .parentNode.appendChild(openLink);
      }
      openLink.style.display = "block";
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

    document.getElementById("dgg-tabs-list").innerHTML =
      `<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;">
      <span style="color:#aaa; font-size:12px; text-align:left;">jump to</span>
      <button id="dgg-close-all" style="background:rgb(124,1,1);color:#fff;border-radius:10px;border:none;font-size:12px;padding:2px 8px;cursor:pointer;">Close All</button>
   </div>` +
      tabs
        .map(
          (tab) => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;">
        <span data-tabid="${
          tab.id
        }" class="dgg-jump" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;color:#4af;text-decoration:underline;">${getTabLabel(
            tab
          )}</span>
        <button data-tabid="${tab.id}" class="dgg-close">✕</button>
      </div>
    `
        )
        .join("");
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
