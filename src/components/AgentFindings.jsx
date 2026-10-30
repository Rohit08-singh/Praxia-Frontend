
function FindingCard({ title, items, type }) {
  if (!items || items.length === 0) return null;

  const styles = {
    supported: {
      icon: "✓",
      label: "Evidence supported",
      className: "finding-supported",
    },
    warning: {
      icon: "!",
      label: "Needs verification",
      className: "finding-warning",
    },
    neutral: {
      icon: "•",
      label: "Additional information",
      className: "finding-neutral",
    },
  };

  const style = styles[type] || styles.neutral;

  return (
    <div className={`finding-card ${style.className}`}>
      <div className="finding-card-heading">
        <h4>{title}</h4>
        <span className="finding-count">{items.length}</span>
      </div>

      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <span className="finding-icon">{style.icon}</span>
            {typeof item === "string"
              ? item
              : JSON.stringify(item)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AgentFindings({ evidence, rootCause, solutions }) {
  if (!evidence && !rootCause && !solutions) return null;

  return (
    <section className="agent-findings">
      <div className="section-heading">
        <div>
          <p className="eyebrow">MULTI-AGENT ANALYSIS</p>
          <h2>Investigation findings</h2>
        </div>
      </div>

      {evidence && (
        <div className="agent-group">
          <h3>01 · Evidence Investigator</h3>

          <FindingCard
            title="Supported facts"
            items={evidence.supported_facts}
            type="supported"
          />

          <FindingCard
            title="Unsupported assumptions"
            items={evidence.unsupported_assumptions}
            type="warning"
          />

          <FindingCard
            title="Missing information"
            items={evidence.missing_information}
            type="neutral"
          />

          {evidence.overall_assessment && (
            <div className="agent-assessment">
              <strong>Evidence assessment</strong>
              <p>{evidence.overall_assessment}</p>
            </div>
          )}
        </div>
      )}

      {rootCause && (
        <div className="agent-group">
          <h3>02 · Root Cause Investigator</h3>

          <FindingCard
            title="Confirmed causes"
            items={rootCause.confirmed_causes}
            type="supported"
          />

          <FindingCard
            title="Possible causes"
            items={rootCause.possible_causes}
            type="warning"
          />

          <FindingCard
            title="Information needed"
            items={rootCause.information_needed}
            type="neutral"
          />

          {rootCause.overall_assessment && (
            <div className="agent-assessment">
              <strong>Root cause assessment</strong>
              <p>{rootCause.overall_assessment}</p>
            </div>
          )}
        </div>
      )}

      {solutions && (
        <div className="agent-group">
          <h3>03 · Solution Investigator</h3>

          <FindingCard
            title="Evidence-supported actions"
            items={solutions.evidence_supported_actions}
            type="supported"
          />

          <FindingCard
            title="Suggested actions"
            items={solutions.suggested_actions}
            type="neutral"
          />

          <FindingCard
            title="Cautions"
            items={solutions.cautions}
            type="warning"
          />

          {solutions.overall_assessment && (
            <div className="agent-assessment">
              <strong>Solution assessment</strong>
              <p>{solutions.overall_assessment}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
