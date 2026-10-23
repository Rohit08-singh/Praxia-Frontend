
import { useState } from "react";
import { runInvestigation } from "./api/investigation";
import ProblemForm from "./components/ProblemForm";

function ResultSection({ title, data }) {
  if (
    data == null ||
    data === "" ||
    (Array.isArray(data) && data.length === 0)
  ) {
    return null;
  }

  return (
    <section className="result-section">
      <h3>{title}</h3>
      <pre>
        {typeof data === "string"
          ? data
          : JSON.stringify(data, null, 2)}
      </pre>
    </section>
  );
}

export default function App() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleInvestigation(query, topK) {
    setLoading(true);
    setError("");
    setReport(null);
    setCopied(false);

    try {
      const result = await runInvestigation(query, topK);
      setReport(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong during the investigation."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyReport() {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(report, null, 2)
      );
      setCopied(true);
    } catch {
      setError("Unable to copy the report. Please try again.");
    }
  }

  function handleNewInvestigation() {
    setReport(null);
    setError("");
    setCopied(false);
  }

  return (
    <div className="workspace">
      <aside className="sidebar">
        <a
          className="brand"
          href="/"
          aria-label="Praxia home"
        >
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

          <ProblemForm
            onSubmit={handleInvestigation}
            loading={loading}
          />

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

          {error && (
            <section className="error-panel" role="alert">
              <div>
                <h3>Investigation needs attention</h3>
                <p>{error}</p>
              </div>

              <button
                className="secondary-button"
                type="button"
                onClick={() => setError("")}
              >
                Dismiss
              </button>
            </section>
          )}

          {report && (
            <section
              className="report-container"
              aria-live="polite"
            >
              <div className="report-heading">
                <div>
                  <p className="eyebrow">INVESTIGATION RESULTS</p>
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

              <ResultSection
                title="Final report"
                data={report.final_report}
              />

              <ResultSection
                title="Evidence findings"
                data={report.evidence_findings}
              />

              <ResultSection
                title="Possible root causes"
                data={report.root_cause_findings}
              />

              <ResultSection
                title="Suggested solutions"
                data={report.solution_findings}
              />

              <ResultSection
                title="Retrieved sources"
                data={report.sources}
              />

              <details className="raw-response">
                <summary>View complete API response</summary>
                <pre>{JSON.stringify(report, null, 2)}</pre>
              </details>

              <p className="report-disclaimer">
                AI-generated findings may be incomplete or incorrect.
                Verify important claims against the original evidence.
              </p>
            </section>
          )}

          <footer className="app-footer">
            <span>Built for clearer thinking.</span>
            <span>Praxia © 2026</span>
          </footer>
        </div>
      </main>

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
