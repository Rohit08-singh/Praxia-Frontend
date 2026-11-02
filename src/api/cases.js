
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const CASES_URL = `${API_BASE_URL}/api/v1/cases`;

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  // DELETE returns 204 No Content
  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.detail || data?.message || `Request failed (${response.status})`;

    throw new Error(
      typeof message === "string" ? message : JSON.stringify(message)
    );
  }

  return data;
}

export const createCase = (caseData) =>
  request(CASES_URL, {
    method: "POST",
    body: JSON.stringify(caseData),
  });

export const getAllCases = () =>
  request(CASES_URL);

export const getCaseById = (caseId) =>
  request(`${CASES_URL}/${caseId}`);

export const updateCase = (caseId, updates) =>
  request(`${CASES_URL}/${caseId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });

export const deleteCase = (caseId) =>
  request(`${CASES_URL}/${caseId}`, {
    method: "DELETE",
  });
