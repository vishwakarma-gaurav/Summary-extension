chrome.storage.local.get("gemini_api_key", (result) => {
  if (!result.gemini_api_key) {
    window.location.href = "settings.html";
    return;
  }

  document.getElementById("app").style.display = "block";

  document.getElementById("askBtn").addEventListener("click", async () => {
    const question = document.getElementById("question").value.trim();
    const format = document.getElementById("formatSelect").value;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, { action: "getPageContent" }, async (response) => {
      const context = response.content || "";
      const prompt = `Using the following webpage content, respond to the question in ${format} format only.\n\nContent:\n${context}\n\nQuestion: ${question}`;
      
      const rawAnswer = await askGemini(result.gemini_api_key, prompt);
      const formattedAnswer = formatAnswer(rawAnswer, format);

      const answerContainer = document.getElementById("answer");
      answerContainer.innerHTML = formattedAnswer;

      const copyBtn = document.getElementById("copyBtn");
      copyBtn.style.display = "block";
      copyBtn.onclick = () => copyToClipboard(answerContainer.innerText);
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
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No answer found.";
  } catch (e) {
    console.error(e);
    return "Failed to connect to Gemini API.";
  }
}

function formatAnswer(answer, format) {
  if (format === "paragraph") {
    return `<p>${answer}</p>`;
  } else if (format === "list") {
    const lines = answer.split('\n').filter(line => line.trim());
    const items = lines.map(line => `<li>${line.replace(/^[-*•]\s*/, '')}</li>`).join('');
    return `<ul>${items}</ul>`;
  } else if (format === "table") {
    const rows = answer.split('\n').filter(line => line.includes('|'));
    const tableRows = rows.map(row => {
      const cells = row.split('|').map(cell => `<td>${cell.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    return `<table border="1" style="border-collapse: collapse;">${tableRows}</table>`;
  } else {
    return answer;
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert("Copied to clipboard!");
  }).catch((err) => {
    console.error("Failed to copy:", err);
  });
}
