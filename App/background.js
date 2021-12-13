let tabSelected = null;
let contador = 0;
chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  const { action } = request;

  if (action !== "fin") {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    tabSelected = tab.id;
    await chrome.tabs.update(tab.id, { url: action });
    contador += 1;
    console.log(contador);
    console.log("entre a update url");
  } else {
    await isOver();
  }

  return true;
});

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  console.log(tabId == tabSelected);
  console.log(`espero OnUpdate ${tabId} -> ${tabSelected}`);
  if (tabId == tabSelected) {
    if (changeInfo.status == "complete") {
      await scrapingProfile();
      tabSelected = null;
    }
  }
  return true;
});

async function scrapingProfile() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const port = chrome.tabs.connect(tab.id);
  port.postMessage({ action: "scrapingProfile" });
}

async function isOver() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const port = chrome.tabs.connect(tab.id);
  port.postMessage({ action: "fin" });
}
