
import { useDispatch, useSelector } from "react-redux";
import { removeCase } from "./casesSlice";

export default function CaseDetails({
  caseItem,
  onClose,
  onEdit,
}) {
  const dispatch = useDispatch();

  const deleting = useSelector(
    (state) => state.cases.loading.delete
  );

  if (!caseItem) {
    return null;
  }

  function formatDate(date) {
    if (!date) return "Not available";

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatStatus(status) {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  async function handleDelete() {
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
            <strong>
              {formatStatus(caseItem.problem_type)}
            </strong>
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

      <div className="cases-details-actions">
        <button
          type="button"
          className="cases-danger-button"
          onClick={handleDelete}
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
