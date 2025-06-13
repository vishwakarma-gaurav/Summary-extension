chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPageContent") {
    const content = document.body.innerText || "";
    sendResponse({ content: content.slice(0, 12000) }); // limit to avoid token overflow
  }
});
