
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  uploadDocumentThunk,
  fetchCaseDocuments,
  fetchDocumentDetails,
  removeDocument,
  clearDocuments,
  clearSelectedDocument,
} from "./documentsSlice";

import "./Documents.css";

function formatFileSize(bytes) {
  if (!bytes) return "0 Bytes";

  const units = ["Bytes", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
}

function formatDate(date) {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getFileType(contentType, filename) {
  const extension = filename?.split(".").pop()?.toLowerCase();

  if (contentType?.includes("pdf") || extension === "pdf") {
    return "PDF";
  }

  if (
    contentType?.includes("word") ||
    extension === "docx" ||
    extension === "doc"
  ) {
    return "DOCX";
  }

  return extension?.toUpperCase() || "FILE";
}

export default function DocumentsPanel({ caseItem }) {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const {
    documents,
    selectedDocument,
    status,
    error,
    uploadStatus,
    uploadError,
    detailsStatus,
    detailsError,
    deleteStatus,
    deleteError,
  } = useSelector((state) => state.documents);

  const [selectedFile, setSelectedFile] = useState(null);
  const [localError, setLocalError] = useState("");

  const caseId = caseItem?.id;

  useEffect(() => {
    if (!caseId) return;

    dispatch(clearDocuments());
    dispatch(clearSelectedDocument());
    dispatch(fetchCaseDocuments(caseId));

    setSelectedFile(null);
    setLocalError("");
  }, [dispatch, caseId]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["pdf", "docx"].includes(extension)) {
      setLocalError("Only PDF and DOCX files are supported.");
      setSelectedFile(null);
      event.target.value = "";
      return;
    }

    setLocalError("");
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !caseId) return;

    setLocalError("");

    try {
      await dispatch(
        uploadDocumentThunk({
          caseId,
          file: selectedFile,
        })
      ).unwrap();

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch {
      // The upload error is displayed from Redux state.
    }
  };

  const handleViewDocument = (documentId) => {
    dispatch(fetchDocumentDetails(documentId));
  };

  const handleDeleteDocument = async (documentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) return;

    try {
      await dispatch(removeDocument(documentId)).unwrap();
    } catch {
      // The deletion error is displayed from Redux state.
    }
  };

  const closeDocumentDetails = () => {
    dispatch(clearSelectedDocument());
  };

  if (!caseId) {
    return (
      <div className="documents-empty">
        <p>Select a case to manage its documents.</p>
      </div>
    );
  }

  return (
    <section className="documents-panel">
      <div className="documents-heading">
        <div>
          <span className="documents-eyebrow">CASE RESOURCES</span>
          <h2>Documents</h2>
          <p>
            Upload and manage supporting documents for this investigation.
          </p>
        </div>

        <div className="documents-count">
          <span>{documents.length}</span>
          <small>Documents</small>
        </div>
      </div>

      {/* UPLOAD SECTION */}

      <div className="document-upload-card">
        <div className="document-upload-icon">↑</div>

        <h3>Add supporting documents</h3>

        <p>
          Select a PDF or DOCX file to upload it to this case.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          hidden
        />

        <button
          type="button"
          className="document-select-button"
          onClick={() => fileInputRef.current?.click()}
        >
          Choose file
        </button>

        {selectedFile && (
          <div className="selected-document">
            <span>{selectedFile.name}</span>
            <small>{formatFileSize(selectedFile.size)}</small>

            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
            >
              Remove
            </button>
          </div>
        )}

        {localError && (
          <p className="document-error">{localError}</p>
        )}

        {uploadError && (
          <p className="document-error">{uploadError}</p>
        )}

        <button
          type="button"
          className="document-upload-button"
          disabled={!selectedFile || uploadStatus === "loading"}
          onClick={handleUpload}
        >
          {uploadStatus === "loading" ? "Uploading..." : "Upload document"}
        </button>

        {uploadStatus === "succeeded" && (
          <p className="document-success">
            Document uploaded successfully.
          </p>
        )}
      </div>

      {/* DOCUMENT LIST */}

      <div className="documents-list-section">
        <div className="documents-list-heading">
          <div>
            <h3>Uploaded documents</h3>
            <p>Documents attached to this case</p>
          </div>
        </div>

        {status === "loading" && (
          <div className="documents-message">
            Loading documents...
          </div>
        )}

        {status === "failed" && (
          <div className="document-error">
            {error || "Unable to load documents."}
          </div>
        )}

        {status === "succeeded" && documents.length === 0 && (
          <div className="documents-empty">
            <div className="documents-empty-icon">▤</div>
            <h3>No documents uploaded yet</h3>
            <p>
              Upload supporting files to give Praxia more evidence
              for investigating this case.
            </p>
          </div>
        )}

        {documents.length > 0 && (
          <div className="documents-grid">
            {documents.map((document) => (
              <article
                className="document-card"
                key={document.id}
              >
                <div className="document-card-top">
                  <div className="document-file-icon">
                    {getFileType(
                      document.content_type,
                      document.original_filename
                    )}
                  </div>

                  <button
                    type="button"
                    className="document-delete-button"
                    title="Delete document"
                    disabled={deleteStatus === "loading"}
                    onClick={() => handleDeleteDocument(document.id)}
                  >
                    ×
                  </button>
                </div>

                <h4 title={document.original_filename}>
                  {document.original_filename}
                </h4>

                <div className="document-card-meta">
                  <span>{formatFileSize(document.size_bytes)}</span>
                  <span>{formatDate(document.created_at)}</span>
                </div>

                <button
                  type="button"
                  className="document-view-button"
                  onClick={() => handleViewDocument(document.id)}
                >
                  View document details
                </button>
              </article>
            ))}
          </div>
        )}

        {deleteError && (
          <p className="document-error">{deleteError}</p>
        )}
      </div>

      {/* DOCUMENT DETAILS */}

      {selectedDocument && (
        <div className="document-details-overlay">
          <div className="document-details-modal">
            <div className="document-details-heading">
              <div>
                <span className="documents-eyebrow">
                  DOCUMENT DETAILS
                </span>
                <h3>{selectedDocument.original_filename}</h3>
              </div>

              <button
                type="button"
                className="document-modal-close"
                onClick={closeDocumentDetails}
              >
                ×
              </button>
            </div>

            {detailsStatus === "loading" && (
              <p>Loading document details...</p>
            )}

            {detailsStatus === "failed" && (
              <p className="document-error">
                {detailsError || "Unable to load document details."}
              </p>
            )}

            {detailsStatus === "succeeded" && (
              <>
                <div className="document-information">
                  <div>
                    <span>File name</span>
                    <strong>{selectedDocument.original_filename}</strong>
                  </div>

                  <div>
                    <span>File type</span>
                    <strong>{selectedDocument.content_type}</strong>
                  </div>

                  <div>
                    <span>File size</span>
                    <strong>
                      {formatFileSize(selectedDocument.size_bytes)}
                    </strong>
                  </div>

                  <div>
                    <span>Uploaded on</span>
                    <strong>
                      {formatDate(selectedDocument.created_at)}
                    </strong>
                  </div>

                  <div>
                    <span>Document ID</span>
                    <strong className="document-id">
                      {selectedDocument.id}
                    </strong>
                  </div>
                </div>

                <div className="extracted-text-section">
                  <h4>Extracted text</h4>

                  {selectedDocument.extracted_text?.trim() ? (
                    <pre>
                      {selectedDocument.extracted_text}
                    </pre>
                  ) : (
                    <p className="documents-empty-text">
                      No extracted text is available for this document.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
