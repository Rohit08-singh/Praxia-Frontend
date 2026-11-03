
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const INVESTIGATION_URL = `${API_BASE_URL}/api/v1/investigation`;

// Common function for handling API requests
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
        typeof message === "string" ? message : JSON.stringify(message)
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

// POST: Run and save an investigation for a case
export function runInvestigation(caseId, query, topK = 3) {
  if (!caseId) {
    throw new Error("A case ID is required to start an investigation.");
  }

  return request(`${INVESTIGATION_URL}/run`, {
    method: "POST",
    body: JSON.stringify({
      case_id: caseId,
      query,
      top_k: topK,
    }),
  });
}

// GET: Retrieve all investigation reports belonging to a case
export function getCaseInvestigations(caseId) {
  return request(`${INVESTIGATION_URL}/cases/${caseId}`);
}

// GET: Retrieve one investigation report
export function getInvestigationReport(reportId) {
  return request(`${INVESTIGATION_URL}/${reportId}`);
}

// DELETE: Delete one investigation report
export function deleteInvestigationReport(reportId) {
  return request(`${INVESTIGATION_URL}/${reportId}`, {
    method: "DELETE",
  });
}
