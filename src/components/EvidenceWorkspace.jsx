import { useEffect, useState } from "react";

import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  indexKnowledgeSource,
  searchKnowledge,
} from "../api/evidence";

export default function EvidenceWorkspace({ caseId }) {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);

  const [sourceName, setSourceName] = useState("");
  const [sourceText, setSourceText] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!caseId) return;

    let active = true;

    async function loadDocuments() {
      try {
        const data = await getDocuments(caseId);
        if (active) setDocuments(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) setError(err.message);
      }
    }

    loadDocuments();

    return () => {
      active = false;
    };
  }, [caseId]);

  async function handleUpload(event) {
    event.preventDefault();

    if (!file) {
      setError("Please select a document first.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const uploaded = await uploadDocument(caseId, file);

      setDocuments((previous) => [uploaded, ...previous]);
      setFile(null);

      // The upload response may contain extracted text.
      // Index it separately because upload does not index automatically.
      if (uploaded.extracted_text?.trim()) {
        const sourceName =
          uploaded.original_filename || `document-${uploaded.id}`;

        const indexed = await indexKnowledgeSource(
          sourceName,
          uploaded.extracted_text
        );

        setMessage(
          `Document uploaded and ${indexed.chunks_indexed} chunks indexed.`
        );
      } else {
        setMessage(
          "Document uploaded, but no extracted text was returned. It has not been indexed."
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleIndexSource(event) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await indexKnowledgeSource(
        sourceName.trim(),
        sourceText.trim()
      );

      setMessage(
        `${result.chunks_indexed} chunks indexed from ${result.source_name}.`
      );

      setSourceName("");
      setSourceText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(event) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSearchResults([]);

    try {
      const result = await searchKnowledge(searchQuery, 3);
      setSearchResults(result.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(documentId) {
    if (!window.confirm("Delete this uploaded document?")) return;

    setError("");
    setMessage("");

    try {
      await deleteDocument(documentId);

      setDocuments((previous) =>
        previous.filter((document) => document.id !== documentId)
      );

      setMessage("Document deleted.");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="evidence-workspace">
      <div className="evidence-heading">
        <div>
          <p className="eyebrow">INVESTIGATION RESOURCES</p>
          <h2>Evidence and knowledge</h2>
          <p>
            Add documents and reference material before running your
            investigation.
          </p>
        </div>

        <span className="evidence-count">
          {documents.length} documents
        </span>
      </div>

      {message && (
        <div className="evidence-message" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="evidence-error" role="alert">
          {error}
        </div>
      )}

      <div className="evidence-grid">
        {/* Document upload */}
        <div className="evidence-card">
          <div className="evidence-card-title">
            <span className="evidence-icon">↥</span>
            <div>
              <h3>Upload documents</h3>
              <p>Attach supporting documents to this case.</p>
            </div>
          </div>

          <form onSubmit={handleUpload}>
            <label htmlFor="evidence-file">Choose a file</label>

            <input
              id="evidence-file"
              type="file"
              accept=".pdf,.docx"
              onChange={(event) =>
                setFile(event.target.files?.[0] || null)
              }
              disabled={loading}
            />

            {file && (
              <p className="selected-file">
                Selected: {file.name}
              </p>
            )}

            <button
              className="evidence-button"
              type="submit"
              disabled={loading || !file}
            >
              Upload and index
            </button>
          </form>
        </div>

        {/* Manual knowledge source */}
        <div className="evidence-card">
          <div className="evidence-card-title">
            <span className="evidence-icon">▤</span>
            <div>
              <h3>Add knowledge source</h3>
              <p>Index policy text or other reference material.</p>
            </div>
          </div>

          <form onSubmit={handleIndexSource}>
            <label htmlFor="source-name">Source name</label>

            <input
              id="source-name"
              value={sourceName}
              onChange={(event) => setSourceName(event.target.value)}
              placeholder="e.g. Electricity Billing Policy"
              minLength={1}
              maxLength={200}
              required
            />

            <label htmlFor="source-content">Source content</label>

            <textarea
              id="source-content"
              value={sourceText}
              onChange={(event) => setSourceText(event.target.value)}
              placeholder="Paste the reference material here..."
              minLength={20}
              maxLength={200000}
              required
            />

            <button
              className="evidence-button"
              type="submit"
              disabled={
                loading ||
                !sourceName.trim() ||
                sourceText.trim().length < 20
              }
            >
              Index knowledge source
            </button>
          </form>
        </div>
      </div>

      {/* Uploaded document list */}
      <div className="evidence-list-section">
        <h3>Uploaded documents</h3>

        {documents.length === 0 ? (
          <p className="evidence-empty">
            No documents have been uploaded to this case yet.
          </p>
        ) : (
          <div className="evidence-document-list">
            {documents.map((document) => (
              <div className="evidence-document" key={document.id}>
                <div className="document-file-icon">PDF</div>

                <div className="document-details">
                  <strong>{document.original_filename}</strong>
                  <span>
                    {(document.size_bytes / 1024).toFixed(1)} KB
                  </span>
                </div>

                <button
                  type="button"
                  className="document-delete"
                  onClick={() => handleDelete(document.id)}
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search indexed knowledge */}
      <div className="evidence-search-section">
        <h3>Search indexed knowledge</h3>

        <form onSubmit={handleSearch}>
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search your indexed documents and sources..."
            minLength={3}
            maxLength={5000}
            required
          />

          <button
            className="evidence-button"
            type="submit"
            disabled={loading || searchQuery.trim().length < 3}
          >
            Search
          </button>
        </form>

        {searchResults.map((result, index) => (
          <article className="knowledge-result" key={`${result.source_name}-${result.chunk_index}-${index}`}>
            <div>
              <strong>{result.source_name}</strong>
              <span>Chunk {result.chunk_index}</span>
            </div>

            <p>{result.text}</p>

            <small>
              Retrieval distance: {Number(result.distance).toFixed(4)}
            </small>
          </article>
        ))}
      </div>
    </section>
  );
}