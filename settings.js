document.getElementById("saveBtn").addEventListener("click", () => {
  const key = document.getElementById("apiKeyInput").value.trim();
  if (key) {
    chrome.storage.local.set({ gemini_api_key: key }, () => {
      document.getElementById("status").textContent = "API key saved!";
      setTimeout(() => window.location.href = "popup.html", 1000);
    });
  } else {
    document.getElementById("status").textContent = "Please enter a valid API key.";
  }
});
