
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchCases,
  fetchCaseById,
  clearSelectedCase,
  clearCasesError,
} from "./casesSlice";

import CaseForm from "./CaseForm";
import CaseDetails from "./CaseDetails";

export default function CasesDashboard() {
  const dispatch = useDispatch();

  const {
    items,
    selectedCase,
    loading,
    error,
  } = useSelector((state) => state.cases);

  const [showForm, setShowForm] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch cases when the dashboard opens
  useEffect(() => {
    dispatch(fetchCases());
  }, [dispatch]);

  function handleCreate() {
    dispatch(clearCasesError());
    dispatch(clearSelectedCase());

    setEditingCase(null);
    setShowDetails(false);
    setShowForm(true);
  }

  async function handleViewDetails(caseId) {
    dispatch(clearCasesError());

    setShowForm(false);
    setEditingCase(null);
    setShowDetails(true);

    try {
      await dispatch(fetchCaseById(caseId)).unwrap();
    } catch {
      setShowDetails(false);
    }
  }

  function handleEdit(caseItem) {
    setEditingCase(caseItem);
    setShowDetails(false);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingCase(null);
  }

  function handleCloseDetails() {
    setShowDetails(false);
    dispatch(clearSelectedCase());
  }

  function formatDate(date) {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatStatus(status) {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  const openCount = items.filter(
    (item) => item.status === "open"
  ).length;

  const inProgressCount = items.filter(
    (item) => item.status === "in_progress"
  ).length;

  const resolvedCount = items.filter(
    (item) => item.status === "resolved"
  ).length;

  return (
    <div className="cases-dashboard">

      {/* PAGE HEADING */}
      <section className="cases-page-heading">
        <div>
          <p className="cases-eyebrow">CASE MANAGEMENT</p>

          <h1>Your cases</h1>

          <p>
            Organize problems, track their progress, and manage
            every case from one place.
          </p>
        </div>

        <button
          type="button"
          className="cases-primary-button"
          onClick={handleCreate}
        >
          <span>＋</span> Create new case
        </button>
      </section>

      {/* SUMMARY CARDS */}
      <section className="cases-stats-grid">
        <div className="cases-stat-card">
          <span className="cases-stat-icon">▤</span>
          <p>Total cases</p>
          <h2>{items.length}</h2>
        </div>

        <div className="cases-stat-card">
          <span className="cases-stat-icon">◷</span>
          <p>Open cases</p>
          <h2>{openCount}</h2>
        </div>

        <div className="cases-stat-card">
          <span className="cases-stat-icon">↻</span>
          <p>In progress</p>
          <h2>{inProgressCount}</h2>
        </div>

        <div className="cases-stat-card">
          <span className="cases-stat-icon">✓</span>
          <p>Resolved</p>
          <h2>{resolvedCount}</h2>
        </div>
      </section>

      {/* CASE LIST */}
      <section className="cases-list-section">
        <div className="cases-list-heading">
          <div>
            <h2>All cases</h2>
            <p>
              {items.length} {items.length === 1 ? "case" : "cases"} in your workspace
            </p>
          </div>

          <button
            type="button"
            className="cases-refresh-button"
            onClick={() => dispatch(fetchCases())}
            disabled={loading.list}
          >
            ↻ Refresh
          </button>
        </div>

        {/* LOADING */}
        {loading.list && (
          <div className="cases-state">
            <div className="cases-spinner" />
            <p>Loading your cases...</p>
          </div>
        )}

        {/* ERROR */}
        {!loading.list && error && (
          <div className="cases-error" role="alert">
            <p>{error}</p>

            <button
              type="button"
              className="cases-secondary-button"
              onClick={() => dispatch(fetchCases())}
            >
              Try again
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading.list && !error && items.length === 0 && (
          <div className="cases-empty-state">
            <div className="cases-empty-icon">▤</div>

            <h3>No cases yet</h3>

            <p>
              Start by creating your first case. You can organize
              a problem and track it here.
            </p>

            <button
              type="button"
              className="cases-primary-button"
              onClick={handleCreate}
            >
              ＋ Create your first case
            </button>
          </div>
        )}

        {/* CASE CARDS */}
        {!loading.list && !error && items.length > 0 && (
          <div className="cases-grid">
            {items.map((caseItem) => (
              <article
                className="cases-card"
                key={caseItem.id}
              >
                <div className="cases-card-top">
                  <span className="cases-card-category">
                    {formatStatus(caseItem.problem_type)}
                  </span>

                  <span
                    className={`cases-status cases-status-${caseItem.status || "unknown"}`}
                  >
                    {formatStatus(caseItem.status)}
                  </span>
                </div>

                <h3>{caseItem.title}</h3>

                <p className="cases-card-description">
                  {caseItem.description}
                </p>

                <div className="cases-card-footer">
                  <span>
                    {formatDate(caseItem.created_at)}
                  </span>

                  <button
                    type="button"
                    className="cases-view-button"
                    onClick={() => handleViewDetails(caseItem.id)}
                  >
                    View details →
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* CASE DETAILS */}
      {showDetails && (
        loading.details ? (
          <div className="cases-overlay">
            <div className="cases-modal">
              <div className="cases-spinner" />
              <p>Loading case details...</p>
            </div>
          </div>
        ) : selectedCase ? (
          <div className="cases-overlay">
            <div className="cases-modal">
              <CaseDetails
                caseItem={selectedCase}
                onClose={handleCloseDetails}
                onEdit={handleEdit}
              />
            </div>
          </div>
        ) : null
      )}

      {/* CREATE / EDIT FORM */}
      {showForm && (
        <div className="cases-overlay">
          <div className="cases-modal">
            <CaseForm
              existingCase={editingCase}
              onClose={handleCloseForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}
