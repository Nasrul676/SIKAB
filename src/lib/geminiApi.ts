export const callGeminiAPI = async (prompt: string) => {
  let chatHistory = [];
  chatHistory.push({ role: "user", parts: [{ text: prompt }] });
  const payload = { contents: chatHistory };
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY; // Canvas will automatically provide the API key
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
      return result.candidates[0].content.parts[0].text;
    } else {
      console.error("Gemini API response structure unexpected:", result);
      return "Gagal mendapatkan saran dari AI.";
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Terjadi kesalahan saat menghubungi AI.";
  }
};