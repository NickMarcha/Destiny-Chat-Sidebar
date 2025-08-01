// Inject this script into the page context
const script = document.createElement("script");
script.textContent = `
  (function () {
    const NativeWebSocket = window.WebSocket;
    window.WebSocket = function (url, protocols) {
      const ws = protocols ? new NativeWebSocket(url, protocols) : new NativeWebSocket(url);
      if (url && url.includes("wss://live.destiny.gg/")) {
        ws.addEventListener("message", (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "dggApi:streamInfo" && data.data && data.data.streams && data.data.streams.youtube) {
              const isLive = !!data.data.streams.youtube.live;
              window.postMessage({ dggLiveStatus: isLive }, "*");
            }
          } catch (e) {}
        });
      }
      return ws;
    };
    window.WebSocket.prototype = NativeWebSocket.prototype;
    window.WebSocket.OPEN = NativeWebSocket.OPEN;
    window.WebSocket.CLOSED = NativeWebSocket.CLOSED;
    window.WebSocket.CLOSING = NativeWebSocket.CLOSING;
    window.WebSocket.CONNECTING = NativeWebSocket.CONNECTING;
  })();
`;
document.documentElement.appendChild(script);

// Listen for messages from the page context and relay to background
window.addEventListener("message", (event) => {
  if (
    event.source === window &&
    event.data &&
    typeof event.data.dggLiveStatus === "boolean"
  ) {
    browser.runtime.sendMessage({ dggLiveStatus: event.data.dggLiveStatus });
  }
});
