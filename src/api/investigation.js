
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function runInvestigation(query, topK = 3) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/investigation/run`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        top_k: topK,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Investigation failed (${response.status}): ${errorText}`
    );
  }

  return response.json();
}
