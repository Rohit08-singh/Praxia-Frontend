
import { useState } from "react";

const examples = [
  {
    icon: "▤",
    text: "My electricity bill seems incorrect. How can I dispute it?",
  },
  {
    icon: "⌘",
    text: "Why does my website keep returning a 500 error?",
  },
  {
    icon: "◉",
    text: "My laptop overheats even when I run simple applications.",
  },
];

export default function ProblemForm({ onSubmit, loading }) {
  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState(3);

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery || loading) return;

    onSubmit(trimmedQuery, topK);
  }

  return (
    <section className="problem-form">
      <div className="section-heading">
        <p className="eyebrow">INVESTIGATION WORKSPACE</p>

        <h2>What problem are you trying to solve?</h2>

        <p>
          Describe the issue. Praxia will investigate available evidence,
          explore possible root causes, and suggest solutions.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="problem-query">
          Describe your problem
        </label>

        <textarea
          id="problem-query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Describe the issue, what you expected to happen, and any evidence or error messages..."
          rows={3}
          maxLength={5000}
          required
          disabled={loading}
        />

        <div className="form-footer">
          <span className="character-count">
            {query.length}/5000 characters
          </span>

          <label className="source-selector" htmlFor="top-k">
            <span>Evidence sources</span>

            <select
              id="top-k"
              value={topK}
              onChange={(event) =>
                setTopK(Number(event.target.value))
              }
              disabled={loading}
            >
              <option value={3}>3 sources</option>
              <option value={5}>5 sources</option>
              <option value={8}>8 sources</option>
            </select>
          </label>
        </div>

        <button
          className="investigate-button"
          type="submit"
          disabled={loading || !query.trim()}
        >
          <span className="button-sparkle" aria-hidden="true">
            ✦
          </span>

          <span>
            {loading ? "Investigation in progress..." : "Start investigation"}
          </span>

          {!loading && (
            <span className="button-arrow" aria-hidden="true">
              →
            </span>
          )}
        </button>
      </form>

      <div className="example-prompts">
        <p>Need an example? Start with one of these.</p>

        <div className="example-list">
          {examples.map((example) => (
            <button
              key={example.text}
              type="button"
              className="example-prompt"
              disabled={loading}
              onClick={() => setQuery(example.text)}
            >
              <span className="example-icon" aria-hidden="true">
                {example.icon}
              </span>

              <span className="example-text">
                {example.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
