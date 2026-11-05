
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const DOCUMENTS_URL = `${API_BASE_URL}/api/v1`;

// Common API request handler
async function request(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        ...options.headers,
      },
    });

    // DELETE endpoint returns 204 No Content
    if (response.status === 204) {
      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      return null;
    }

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

// Upload document to a case
export function uploadDocument(caseId, file) {
  if (!caseId) {
    return Promise.reject(new Error("A case ID is required."));
  }

  if (!file) {
    return Promise.reject(new Error("Please select a document."));
  }

  const formData = new FormData();
  formData.append("file", file);

  return request(
    `${DOCUMENTS_URL}/cases/${caseId}/documents`,
    {
      method: "POST",
      body: formData,
    }
  );
}

// Get all documents associated with a case
export function getCaseDocuments(caseId) {
  if (!caseId) {
    return Promise.reject(new Error("A case ID is required."));
  }

  return request(
    `${DOCUMENTS_URL}/cases/${caseId}/documents`
  );
}

// Get individual document details
export function getDocumentById(documentId) {
  if (!documentId) {
    return Promise.reject(new Error("A document ID is required."));
  }

  return request(
    `${DOCUMENTS_URL}/documents/${documentId}`
  );
}

// Delete document
export function deleteDocument(documentId) {
  if (!documentId) {
    return Promise.reject(new Error("A document ID is required."));
  }

  return request(
    `${DOCUMENTS_URL}/documents/${documentId}`,
    {
      method: "DELETE",
    }
  );
}
