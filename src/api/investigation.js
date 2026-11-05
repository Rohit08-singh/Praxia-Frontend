
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const INVESTIGATION_URL = `${API_BASE_URL}/api/v1/investigation`;

// Common API request handler
async function request(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        data?.detail || `Request failed (${response.status})`;

      throw new Error(
        typeof message === "string"
          ? message
          : JSON.stringify(message)
      );
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Unable to connect to Praxia backend. Please check whether the backend is running."
      );
    }

    throw error;
  }
}

// Start a new AI investigation
export function runInvestigation(caseId, query, topK = 3) {
  if (!caseId) {
    return Promise.reject(
      new Error("A case ID is required to start an investigation.")
    );
  }

  if (!query || !query.trim()) {
    return Promise.reject(
      new Error("Investigation query cannot be empty.")
    );
  }

  return request(`${INVESTIGATION_URL}/run`, {
    method: "POST",
    body: JSON.stringify({
      case_id: caseId,
      query: query.trim(),
      top_k: topK,
    }),
  });
}

// Fetch all investigations belonging to a case
export function getCaseInvestigations(caseId) {
  return request(`${INVESTIGATION_URL}/cases/${caseId}`);
}

// Fetch one investigation report
export function getInvestigationReport(reportId) {
  return request(`${INVESTIGATION_URL}/${reportId}`);
}

// Delete an investigation report
export function deleteInvestigationReport(reportId) {
  return request(`${INVESTIGATION_URL}/${reportId}`, {
    method: "DELETE",
  });
}
