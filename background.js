let scrollIntervals = {};
let currentSpeed = 5;

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    injectContentScript(tabId);
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
    if (tabs[0]) {
      const tabId = tabs[0].id;

      if (request.action === "startScrolling") {
        currentSpeed = request.speed;
        await injectContentScript(tabId);
        startScrolling(tabId);
      } else if (request.action === "stopScrolling") {
        stopScrolling(tabId);
      } else if (request.action === "updateSpeed") {
        currentSpeed = request.speed;
        if (scrollIntervals[tabId]) {
          stopScrolling(tabId);
          startScrolling(tabId);
        }
      }
    }
  });
  return true; // Indicates that the response is sent asynchronously
});

async function injectContentScript(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        if (!window.autoScrollInjected) {
          window.autoScrollInjected = true;
          chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === "scroll") {
              window.scrollBy(0, request.speed);
            }
          });
        }
      }
    });
  } catch (err) {
    console.error("Failed to inject content script:", err);
  }
}

function startScrolling(tabId) {
  stopScrolling(tabId); // Clear any existing interval
  scrollIntervals[tabId] = setInterval(() => {
    chrome.tabs.sendMessage(tabId, {action: "scroll", speed: currentSpeed})
      .catch(err => {
        console.error("Error sending message to content script:", err);
        stopScrolling(tabId);
      });
  }, 50); // Adjust this value to control scroll frequency
}

function stopScrolling(tabId) {
  if (scrollIntervals[tabId]) {
    clearInterval(scrollIntervals[tabId]);
    delete scrollIntervals[tabId];
  }
}

// Clean up intervals when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  stopScrolling(tabId);
});