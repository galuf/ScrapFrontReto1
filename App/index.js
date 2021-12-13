const btn = document.getElementById("scrapear");
const textorespuesta = document.getElementById("textoRespuesta");

btn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const port = chrome.tabs.connect(tab.id);
  port.postMessage({ action: "inicia" });
});
