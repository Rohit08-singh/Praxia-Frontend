
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  runInvestigationThunk,
  clearInvestigation,
} from "./features/investigation/investigationSlice";

import ProblemForm from "./components/ProblemForm";
import ReportSection from "./components/ReportSection";
import AgentFindings from "./components/AgentFindings";
import SourcesPanel from "./components/SourcesPanel";

export default function App() {
  const dispatch = useDispatch();

  // Get investigation data from Redux
  const { report, status, error } = useSelector(
    (state) => state.investigation
  );

  // Local state for copy button feedback
  const [copied, setCopied] = useState(false);

  const loading = status === "loading";

  // Start a new investigation
  function handleInvestigation(query, topK) {
    setCopied(false);

    dispatch(
      runInvestigationThunk({
        query,
        topK,
      })
    );
  }

  // Copy complete investigation report
  async function handleCopyReport() {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(report, null, 2)
      );

      setCopied(true);
    } catch {
      alert("Unable to copy the report. Please try again.");
    }
  }

  // Clear current investigation
  function handleNewInvestigation() {
    dispatch(clearInvestigation());
    setCopied(false);
  }

  return (
    <div className="workspace">

      {/* LEFT SIDEBAR */}
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Praxia home">
          <span className="brand-mark">P</span>

          <span className="brand-copy">
            <span className="brand-name">praxia</span>
            <span className="brand-caption">
              AI Investigation Workspace
            </span>
          </span>
        </a>

        <div className="workspace-label">WORKSPACE</div>

        <button
          className="nav-item active"
          type="button"
          aria-current="page"
        >
          <span className="nav-icon">✳</span>
          <span>Investigation</span>
        </button>

        <button
          className="nav-item"
          type="button"
          onClick={handleNewInvestigation}
        >
          <span className="nav-icon">＋</span>
          <span>New investigation</span>
        </button>

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
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-separator">/</span>
            <strong>Investigation</strong>
          </div>

          <div className="topbar-status">
            <span className="mini-status" />
            Multi-agent AI
          </div>
        </header>

        <div className="main-scroll">

          {/* HERO SECTION */}
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

          {/* LOADING STATE */}
          {loading && (
            <section className="state-panel" role="status">
              <div className="loading-spinner" />

              <div>
                <h3>Investigating your problem</h3>
                <p>
                  Gathering evidence and analyzing possible
                  explanations. This may take a little while.
                </p>
              </div>
            </section>
          )}

          {/* ERROR STATE */}
          {error && (
            <section className="error-panel" role="alert">
              <div>
                <h3>Investigation needs attention</h3>
                <p>{error}</p>
              </div>

              <button
                className="secondary-button"
                type="button"
                onClick={handleNewInvestigation}
              >
                Dismiss
              </button>
            </section>
          )}

          {/* INVESTIGATION RESULTS */}
          {report && (
            <section
              className="report-container"
              aria-live="polite"
            >

              {/* REPORT HEADER */}
              <div className="report-heading">
                <div>
                  <p className="eyebrow">
                    INVESTIGATION RESULTS
                  </p>

                  <h2>Your investigation report</h2>
                </div>

                <div className="report-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={handleCopyReport}
                  >
                    {copied ? "Copied ✓" : "Copy report"}
                  </button>

                  <button
                    className="secondary-button"
                    type="button"
                    onClick={handleNewInvestigation}
                  >
                    New investigation
                  </button>
                </div>
              </div>

              {/* FINAL SYNTHESIZED REPORT */}
              <ReportSection
                title="Final investigation report"
                data={report.final_report}
              />

              {/* AI AGENT FINDINGS */}
              <AgentFindings
                evidence={report.evidence_findings}
                rootCause={report.root_cause_findings}
                solutions={report.solution_findings}
              />

              {/* RETRIEVED KNOWLEDGE SOURCES */}
              <SourcesPanel
                sources={report.sources}
              />

              {/* ORIGINAL JSON FOR DEBUGGING */}
              <details className="raw-response">
                <summary>View complete API response</summary>

                <pre>
                  {JSON.stringify(report, null, 2)}
                </pre>
              </details>

              <p className="report-disclaimer">
                AI-generated findings may be incomplete or incorrect.
                Verify important claims against the original evidence.
              </p>
            </section>
          )}

          {/* FOOTER */}
          <footer className="app-footer">
            <span>Built for clearer thinking.</span>
            <span>Praxia © 2026</span>
          </footer>

        </div>
      </main>

      {/* RIGHT CONTEXT PANEL */}
      <aside className="context-panel">
        <div className="context-heading">
          <span>YOUR WORKSPACE</span>

          <span className="context-menu" aria-hidden="true">
            ···
          </span>
        </div>

        <section className="context-card welcome-card">
          <div className="context-card-art" aria-hidden="true">
            <div className="context-art-sheet">
              <span />
              <span />
              <span />
            </div>

            <div className="context-symbol">✳</div>
          </div>

          <h3>Think it through.</h3>

          <p>
            Turn uncertainty into a structured investigation,
            one step at a time.
          </p>
        </section>

        <section className="context-section">
          <h4>HOW PRAXIA WORKS</h4>

          <div className="workflow-step">
            <span className="step-number">01</span>

            <div>
              <strong>Gather evidence</strong>
              <p>Retrieve relevant information and sources.</p>
            </div>
          </div>

          <div className="workflow-step">
            <span className="step-number">02</span>

            <div>
              <strong>Explore causes</strong>
              <p>Investigate possible explanations.</p>
            </div>
          </div>

          <div className="workflow-step">
            <span className="step-number">03</span>

            <div>
              <strong>Find next steps</strong>
              <p>Review suggested solutions and limitations.</p>
            </div>
          </div>
        </section>

        <section className="context-tip">
          <div className="tip-heading">
            <span className="tip-icon">✦</span>
            <span className="tip-label">A USEFUL TIP</span>
          </div>

          <p>
            Include what happened, what you expected, and any
            evidence or error messages you have.
          </p>
        </section>

        <div className="context-bottom">
          <span className="mini-status" />
          <span>Findings should be verified</span>
        </div>
      </aside>

    </div>
  );
}
