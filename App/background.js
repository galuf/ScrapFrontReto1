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
    await chrome.storage.sync.set({ id: tab.id });
    await chrome.tabs.update(tab.id, { url: action });
    console.log("entre a update url");
  } else {
    await isOver();
  }

  return true;
});

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  let { id } = await chrome.storage.sync.get("id");
  console.log("id", id);
  console.log(tabId == id);
  console.log(`espero OnUpdate ${tabId} -> ${id}`);

  if (tabId == id) {
    if (changeInfo.status == "complete") {
      await scrapingProfile();
      await chrome.storage.sync.set({ id: null });
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
