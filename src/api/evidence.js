const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function request(url, options = {}) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body instanceof FormData
        ? {}
        : options.body
          ? { "Content-Type": "application/json" }
          : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = data?.detail;
    throw new Error(
      typeof detail === "string"
        ? detail
        : detail
          ? JSON.stringify(detail)
          : `Request failed (${response.status})`
    );
  }

  return data;
}

export function getDocuments(caseId) {
  return request(`/api/v1/cases/${caseId}/documents`);
}

export function uploadDocument(caseId, file) {
  const formData = new FormData();
  formData.append("file", file);

  return request(`/api/v1/cases/${caseId}/documents`, {
    method: "POST",
    body: formData,
  });
}

export function deleteDocument(documentId) {
  return request(`/api/v1/documents/${documentId}`, {
    method: "DELETE",
  });
}

export function indexKnowledgeSource(sourceName, content) {
  return request("/api/v1/rag/index", {
    method: "POST",
    body: JSON.stringify({
      source_name: sourceName,
      text: content,
    }),
  });
}

export function searchKnowledge(query, topK = 3) {
  return request("/api/v1/rag/search", {
    method: "POST",
    body: JSON.stringify({
      query,
      top_k: topK,
    }),
  });
}