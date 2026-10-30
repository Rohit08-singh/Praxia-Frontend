
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function runInvestigation(query, topK = 3) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/investigation/run`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query,
          top_k: topK,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Investigation failed (${response.status}): ${
          errorText || response.statusText
        }`
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Unable to connect to Praxia backend. Please check whether the backend is running."
      );
    }

    throw error;
  }
}
