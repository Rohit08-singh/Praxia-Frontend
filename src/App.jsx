
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// Investigation
import {
  runInvestigationThunk,
  clearInvestigation,
} from "./features/investigation/investigationSlice";

// Cases
import { addCase } from "./features/cases/casesSlice";
import CasesDashboard from "./features/cases/CasesDashboard";

// Components
import ProblemForm from "./components/ProblemForm";
import ReportSection from "./components/ReportSection";
import AgentFindings from "./components/AgentFindings";
import SourcesPanel from "./components/SourcesPanel";
import EvidenceWorkspace from "./components/EvidenceWorkspace";

import "./features/cases/Cases.css";

export default function App() {
  const dispatch = useDispatch();

  // Navigation
  const [activeView, setActiveView] = useState("investigation");

  // Current case
  const [activeCase, setActiveCase] = useState(null);

  // UI states
  const [copied, setCopied] = useState(false);
  const [creatingCase, setCreatingCase] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Investigation state
  const { report, status, error } = useSelector(
    (state) => state.investigation
  );

  const loading = status === "loading" || creatingCase;

  // Create a case before investigation.
  async function handlePrepareCase(query) {
    setCreatingCase(true);
    setSubmitError("");

    try {
      const title =
        query.length > 80
          ? `${query.slice(0, 77)}...`
          : query;

      const createdCase = await dispatch(
        addCase({
          title,
          description: query,
          problem_type: "general",
        })
      ).unwrap();

      setActiveCase(createdCase);

      return createdCase;
    } catch (err) {
      const message =
        typeof err === "string"
          ? err
          : err?.message || "Unable to create your case.";

      setSubmitError(message);
      throw err;
    } finally {
      setCreatingCase(false);
    }
  }

  // Run investigation using the active case.
  async function handleInvestigation(query, topK) {
    setCopied(false);
    setSubmitError("");

    try {
      let caseToInvestigate = activeCase;

      if (!caseToInvestigate) {
        caseToInvestigate = await handlePrepareCase(query);
      }

      await dispatch(
        runInvestigationThunk({
          caseId: caseToInvestigate.id,
          query,
          topK,
        })
      ).unwrap();
    } catch (err) {
      const message =
        typeof err === "string"
          ? err
          : err?.message || "Unable to start the investigation.";

      setSubmitError(message);
    }
  }

  // Copy complete report.
  async function handleCopyReport() {
    if (!report) return;

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(report, null, 2)
      );

      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    } catch {
      setSubmitError("Unable to copy the report. Please try again.");
    }
  }

  // Reset current investigation and case selection.
  function handleNewInvestigation() {
    dispatch(clearInvestigation());

    setActiveCase(null);
    setCopied(false);
    setSubmitError("");
  }

  // Navigate to investigation page.
  function openNewInvestigation() {
    handleNewInvestigation();
    setActiveView("investigation");
  }

  return (
    <div className="workspace">

      {/* LEFT SIDEBAR */}
      <aside className="sidebar">

        {/* BRAND */}
        <a
          className="brand"
          href="/"
          aria-label="Praxia home"
          onClick={(event) => {
            event.preventDefault();
            openNewInvestigation();
          }}
        >
          <span className="brand-mark">P</span>

          <span className="brand-copy">
            <span className="brand-name">praxia</span>
            <span className="brand-caption">
              AI Investigation Workspace
            </span>
          </span>
        </a>

        <div className="workspace-label">
          WORKSPACE
        </div>

        {/* INVESTIGATION NAVIGATION */}
        <button
          className={`nav-item ${
            activeView === "investigation" ? "active" : ""
          }`}
          type="button"
          onClick={() => setActiveView("investigation")}
          aria-current={
            activeView === "investigation" ? "page" : undefined
          }
        >
          <span className="nav-icon">◈</span>
          <span>Investigation</span>
        </button>

        {/* CASES NAVIGATION */}
        <button
          className={`nav-item ${
            activeView === "cases" ? "active" : ""
          }`}
          type="button"
          onClick={() => setActiveView("cases")}
          aria-current={
            activeView === "cases" ? "page" : undefined
          }
        >
          <span className="nav-icon">▤</span>
          <span>Cases</span>
        </button>

        {/* NEW INVESTIGATION */}
        <button
          className="nav-item"
          type="button"
          onClick={openNewInvestigation}
        >
          <span className="nav-icon">＋</span>
          <span>New investigation</span>
        </button>

        {/* SIDEBAR BOTTOM */}
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="mini-status" />

            <div className="sidebar-note-copy">
              <strong>Praxia engine</strong>
              <small>AI-assisted analysis</small>
            </div>

            <span className="sidebar-chevron">›</span>
          </div>

          <span className="sidebar-version">
            PRAXIA · EARLY ACCESS
          </span>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <main className="main-area">

        {/* TOPBAR */}
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-separator">/</span>

            <strong>
              {activeView === "cases"
                ? "Cases"
                : "Investigation"}
            </strong>
          </div>

          <div className="topbar-status">
            <span className="mini-status" />
            Multi-agent AI
          </div>
        </header>

        {/* MAIN SCROLL AREA */}
        <div className="main-scroll">

          {/* CASES DASHBOARD */}
          {activeView === "cases" ? (
            <CasesDashboard />
          ) : (
            <>

              {/* HERO */}
              <section className="hero">
                <div className="hero-icon">
                  <span>✳</span>
                </div>

                <p className="eyebrow">
                  CLARITY STARTS WITH EVIDENCE
                </p>

                <h1>
                  Make sense of
                  <br />
                  <span>complex problems.</span>
                </h1>

                <p className="hero-description">
                  Bring a problem. Explore the evidence, understand
                  possible causes, and find your next step.
                </p>
              </section>

              {/* INVESTIGATION FORM */}
              <ProblemForm
                onSubmit={handleInvestigation}
                loading={loading}
              />

              {/* ACTIVE CASE */}
              {activeCase && (
                <section className="active-case-banner">
                  <div>
                    <p className="eyebrow">ACTIVE CASE</p>
                    <strong>{activeCase.title}</strong>
                    <small>
                      Case ID: {activeCase.id}
                    </small>
                  </div>

                  <button
                    type="button"
                    onClick={handleNewInvestigation}
                    disabled={loading}
                  >
                    Start new
                  </button>
                </section>
              )}

              {/* EVIDENCE MANAGEMENT */}
              {activeCase && (
                <EvidenceWorkspace
                  caseId={activeCase.id}
                />
              )}

              {/* LOADING */}
              {loading && (
                <section className="state-panel" role="status">
                  <div className="loading-spinner" />

                  <div>
                    <h3>
                      {creatingCase
                        ? "Preparing your case"
                        : "Investigating your problem"}
                    </h3>

                    <p>
                      {creatingCase
                        ? "Creating your case before starting the investigation."
                        : "Gathering evidence and analyzing possible explanations. This may take a little while."}
                    </p>
                  </div>
                </section>
              )}

              {/* ERROR */}
              {(error || submitError) && (
                <section className="error-panel" role="alert">
                  <div>
                    <strong>Something went wrong</strong>
                    <p>{submitError || error}</p>
                  </div>
                </section>
              )}

              {/* INVESTIGATION REPORT */}
              {report && (
                <section className="investigation-results">

                  <div className="report-heading">
                    <div>
                      <p className="eyebrow">
                        INVESTIGATION COMPLETE
                      </p>

                      <h2>Investigation report</h2>

                      <p>
                        Review the findings and recommendations
                        generated from your available evidence.
                      </p>
                    </div>

                    <button
                      className="copy-report-button"
                      type="button"
                      onClick={handleCopyReport}
                    >
                      {copied ? "Copied!" : "Copy report"}
                    </button>
                  </div>

                  <ReportSection report={report} />

                  <AgentFindings report={report} />

                  <SourcesPanel sources={report.sources || []} />

                </section>
              )}

              {/* EMPTY STATE */}
              {!report && !loading && !error && !submitError && (
                <section className="empty-workspace">
                  <div className="empty-workspace-icon">✳</div>

                  <h3>Ready to investigate</h3>

                  <p>
                    Describe your problem above to create a case.
                    You can then upload supporting documents,
                    add knowledge sources, and start your
                    investigation.
                  </p>
                </section>
              )}

            </>
          )}
        </div>
      </main>

      {/* RIGHT CONTEXT PANEL */}
      <aside className="context-panel">

        <div className="context-top">
          <span className="context-label">
            WORKSPACE GUIDE
          </span>

          <h3>
            Better answers
            <br />
            start with context.
          </h3>

          <p>
            Praxia organizes evidence, investigates possible
            causes, and helps you understand what to do next.
          </p>
        </div>

        <div className="context-divider" />

        <div className="workflow-card">
          <p className="context-label">
            INVESTIGATION WORKFLOW
          </p>

          <div className="workflow-step">
            <span className="workflow-number">01</span>
            <div>
              <strong>Describe</strong>
              <small>Explain the problem clearly.</small>
            </div>
          </div>

          <div className="workflow-step">
            <span className="workflow-number">02</span>
            <div>
              <strong>Add evidence</strong>
              <small>Upload documents and sources.</small>
            </div>
          </div>

          <div className="workflow-step">
            <span className="workflow-number">03</span>
            <div>
              <strong>Investigate</strong>
              <small>Analyze evidence and possible causes.</small>
            </div>
          </div>

          <div className="workflow-step">
            <span className="workflow-number">04</span>
            <div>
              <strong>Review</strong>
              <small>Read the final report and next steps.</small>
            </div>
          </div>
        </div>

        <div className="context-tip">
          <span className="context-tip-icon">✦</span>

          <div>
            <strong>Useful tip</strong>
            <p>
              Include dates, amounts, events, and other
              specific details when describing a problem.
            </p>
          </div>
        </div>

        <div className="context-footer">
          <span className="mini-status" />
          Praxia AI workspace
        </div>

      </aside>
    </div>
  );
}
