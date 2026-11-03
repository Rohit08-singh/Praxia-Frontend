
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { removeCase } from "./casesSlice";

import {
  runInvestigationThunk,
  fetchCaseInvestigations,
  fetchInvestigationReport,
  removeInvestigationReport,
  clearSelectedReport,
} from "../investigation/investigationSlice";

export default function CaseDetails({
  caseItem,
  onClose,
  onEdit,
}) {
  const dispatch = useDispatch();

  const deleting = useSelector(
    (state) => state.cases.loading.delete
  );

  const {
    report,
    reports,
    selectedReport,
    status,
    error,
    historyStatus,
    historyError,
    reportStatus,
    deleteStatus,
    deleteError,
  } = useSelector((state) => state.investigation);

  // Load saved investigation history whenever a case is opened.
  useEffect(() => {
    if (caseItem?.id) {
      dispatch(clearSelectedReport());
      dispatch(fetchCaseInvestigations(caseItem.id));
    }
  }, [dispatch, caseItem?.id]);

  if (!caseItem) {
    return null;
  }

  function formatDate(date) {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatStatus(value) {
    if (!value) return "Unknown";

    return value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  // Start a new AI investigation for this case.
  async function handleStartInvestigation() {
    try {
      await dispatch(
        runInvestigationThunk({
          caseId: caseItem.id,
          query: caseItem.description,
          topK: 3,
        })
      ).unwrap();
    } catch (error) {
      console.error("Investigation failed:", error);
    }
  }

  // Open an existing saved report.
  async function handleViewReport(reportId) {
    try {
      await dispatch(
        fetchInvestigationReport(reportId)
      ).unwrap();
    } catch (error) {
      console.error("Unable to load report:", error);
    }
  }

  // Delete an individual investigation report.
  async function handleDeleteReport(reportId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this investigation report?"
    );

    if (!confirmed) return;

    try {
      await dispatch(
        removeInvestigationReport(reportId)
      ).unwrap();

      dispatch(clearSelectedReport());
    } catch (error) {
      window.alert(
        typeof error === "string"
          ? error
          : "Unable to delete the investigation report."
      );
    }
  }

  // Delete the entire case.
  async function handleDeleteCase() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${caseItem.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await dispatch(removeCase(caseItem.id)).unwrap();
      onClose();
    } catch (error) {
      window.alert(
        typeof error === "string"
          ? error
          : "Unable to delete this case. Please try again."
      );
    }
  }

  return (
    <section className="cases-details-card">

      {/* HEADER */}
      <div className="cases-details-header">
        <div>
          <p className="cases-eyebrow">CASE INFORMATION</p>
          <h2>Case details</h2>
        </div>

        <button
          type="button"
          className="cases-icon-button"
          onClick={onClose}
          aria-label="Close case details"
        >
          ×
        </button>
      </div>

      {/* CASE INFORMATION */}
      <div className="cases-details-content">

        <div className="cases-details-title">
          <span className="cases-detail-label">CASE TITLE</span>
          <h3>{caseItem.title}</h3>
        </div>

        <div className="cases-details-meta">
          <div>
            <span className="cases-detail-label">STATUS</span>

            <span
              className={`cases-status cases-status-${caseItem.status || "unknown"}`}
            >
              {formatStatus(caseItem.status)}
            </span>
          </div>

          <div>
            <span className="cases-detail-label">CATEGORY</span>
            <strong>{formatStatus(caseItem.problem_type)}</strong>
          </div>

          <div>
            <span className="cases-detail-label">CASE ID</span>
            <code>{caseItem.id}</code>
          </div>
        </div>

        <div className="cases-details-description">
          <span className="cases-detail-label">
            PROBLEM DESCRIPTION
          </span>

          <p>{caseItem.description}</p>
        </div>

        <div className="cases-details-dates">
          <div>
            <span className="cases-detail-label">CREATED</span>
            <p>{formatDate(caseItem.created_at)}</p>
          </div>

          <div>
            <span className="cases-detail-label">LAST UPDATED</span>
            <p>{formatDate(caseItem.updated_at)}</p>
          </div>
        </div>
      </div>

      {/* AI INVESTIGATION SECTION */}
      <div className="cases-investigation-section">

        <div className="cases-investigation-heading">
          <div>
            <p className="cases-eyebrow">PRAXIA AI</p>
            <h3>AI Investigation</h3>
            <p>
              Analyze this case using Praxia's multi-agent
              investigation workflow.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="cases-primary-button cases-investigate-button"
          onClick={handleStartInvestigation}
          disabled={status === "loading"}
        >
          {status === "loading"
            ? "Investigating..."
            : "✳ Start AI Investigation"}
        </button>

        {status === "loading" && (
          <p className="cases-info-message">
            Praxia's AI agents are analyzing the case.
            Please wait...
          </p>
        )}

        {status === "failed" && error && (
          <div className="cases-error" role="alert">
            {error}
          </div>
        )}

        {status === "succeeded" && report && (
          <div className="cases-success-message">
            <strong>Investigation completed!</strong>
            <p>Your investigation report has been saved.</p>
          </div>
        )}
      </div>

      {/* INVESTIGATION HISTORY */}
      <div className="cases-investigation-history">

        <div className="cases-history-heading">
          <div>
            <h3>Investigation history</h3>
            <p>
              Saved reports associated with this case.
            </p>
          </div>

          <button
            type="button"
            className="cases-refresh-button"
            disabled={historyStatus === "loading"}
            onClick={() =>
              dispatch(fetchCaseInvestigations(caseItem.id))
            }
          >
            ↻ Refresh
          </button>
        </div>

        {historyStatus === "loading" && (
          <p className="cases-info-message">
            Loading investigation history...
          </p>
        )}

        {historyStatus === "failed" && (
          <div className="cases-error" role="alert">
            {historyError}
          </div>
        )}

        {historyStatus === "succeeded" && reports.length === 0 && (
          <div className="cases-history-empty">
            <p>No investigations yet.</p>
            <span>
              Start an AI investigation to generate your first report.
            </span>
          </div>
        )}

        {historyStatus === "succeeded" && reports.length > 0 && (
          <div className="cases-history-list">
            {reports.map((item) => (
              <article
                className="cases-history-item"
                key={item.id}
              >
                <div className="cases-history-item-info">
                  <strong>
                    {item.query || "AI Investigation"}
                  </strong>

                  <span>
                    {formatDate(item.created_at)}
                  </span>

                  <span className="cases-status cases-status-resolved">
                    {formatStatus(item.status || "completed")}
                  </span>
                </div>

                <div className="cases-history-item-actions">
                  <button
                    type="button"
                    className="cases-view-button"
                    onClick={() => handleViewReport(item.id)}
                  >
                    View report →
                  </button>

                  <button
                    type="button"
                    className="cases-danger-button"
                    disabled={deleteStatus === "loading"}
                    onClick={() => handleDeleteReport(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {deleteError && (
          <div className="cases-error" role="alert">
            {deleteError}
          </div>
        )}

        {/* SELECTED REPORT */}
        {reportStatus === "loading" && (
          <p className="cases-info-message">
            Loading saved report...
          </p>
        )}

        {reportStatus === "failed" && (
          <div className="cases-error" role="alert">
            Unable to load the selected report.
          </div>
        )}

        {selectedReport && (
          <div className="cases-saved-report">
            <div className="cases-saved-report-heading">
              <div>
                <p className="cases-eyebrow">SAVED REPORT</p>
                <h3>Investigation report</h3>
              </div>

              <button
                type="button"
                className="cases-icon-button"
                onClick={() => dispatch(clearSelectedReport())}
                aria-label="Close report"
              >
                ×
              </button>
            </div>

            <p>
              <strong>Query:</strong> {selectedReport.query}
            </p>

            {selectedReport.final_report && (
              <div className="cases-report-content">
                <h4>Final report</h4>

                <pre>
                  {JSON.stringify(
                    selectedReport.final_report,
                    null,
                    2
                  )}
                </pre>
              </div>
            )}

            <div className="cases-report-content">
              <h4>Evidence findings</h4>
              <pre>
                {JSON.stringify(
                  selectedReport.evidence_findings,
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="cases-report-content">
              <h4>Root cause findings</h4>
              <pre>
                {JSON.stringify(
                  selectedReport.root_cause_findings,
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="cases-report-content">
              <h4>Solution findings</h4>
              <pre>
                {JSON.stringify(
                  selectedReport.solution_findings,
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="cases-report-content">
              <h4>Sources</h4>
              <pre>
                {JSON.stringify(
                  selectedReport.sources,
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* ACTIONS */}
      <div className="cases-details-actions">

        <button
          type="button"
          className="cases-danger-button"
          onClick={handleDeleteCase}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete case"}
        </button>

        <div>
          <button
            type="button"
            className="cases-secondary-button"
            onClick={onClose}
          >
            Close
          </button>

          <button
            type="button"
            className="cases-primary-button"
            onClick={() => onEdit(caseItem)}
          >
            Edit case
          </button>
        </div>
      </div>
    </section>
  );
}
