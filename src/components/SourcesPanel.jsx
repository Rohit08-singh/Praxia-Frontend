
export default function SourcesPanel({ sources = [] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <section className="sources-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">RETRIEVED KNOWLEDGE</p>
          <h2>Evidence sources</h2>
        </div>

        <span className="source-count">
          {sources.length} {sources.length === 1 ? "source" : "sources"}
        </span>
      </div>

      <div className="sources-list">
        {sources.map((source, index) => (
          <article className="source-card" key={index}>
            <div className="source-card-heading">
              <div>
                <span className="source-number">
                  SOURCE {String(index + 1).padStart(2, "0")}
                </span>

                <h3>{source.source_name || "Untitled source"}</h3>
              </div>

              {typeof source.distance === "number" && (
                <span className="source-distance">
                  Distance: {source.distance.toFixed(4)}
                </span>
              )}
            </div>

            <p className="source-text">{source.text}</p>

            <div className="source-meta">
              <span>Chunk index: {source.chunk_index ?? "N/A"}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
