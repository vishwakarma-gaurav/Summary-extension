chrome.storage.local.get("gemini_api_key", (result) => {
  if (!result.gemini_api_key) {
    window.location.href = "settings.html";
    return;
  }

  document.getElementById("app").style.display = "block";

  document.getElementById("askBtn").addEventListener("click", async () => {
    const question = document.getElementById("question").value.trim();
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, { action: "getPageContent" }, async (response) => {
      const context = response.content || "";
      const prompt = `I'm giving you a webpage's content below. Now do the following task for me using only this given content:\n\n${context} Do this for me: "${question}" `;
      const answer = await askGemini(result.gemini_api_key, prompt);
      document.getElementById("answer").textContent = answer;
    });
  });
});

async function askGemini(apiKey, prompt) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    console.log("Gemini response:", data);

    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No answer found.";
  } catch (e) {
    console.error(e);
    return "Failed to connect to Gemini API.";
  }
}
