
function isEmpty(value) {
  return (
    value == null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

function formatLabel(value) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function ValueDisplay({ value }) {
  if (isEmpty(value)) return null;

  if (Array.isArray(value)) {
    return (
      <ul className="report-list">
        {value.map((item, index) => (
          <li key={index}>
            <ValueDisplay value={item} />
          </li>
        ))}
      </ul>
    );
  }

  if (typeof value === "object") {
    return (
      <div className="report-object">
        {Object.entries(value).map(([key, item]) => {
          if (isEmpty(item)) return null;

          return (
            <div className="report-field" key={key}>
              <h4>{formatLabel(key)}</h4>
              <ValueDisplay value={item} />
            </div>
          );
        })}
      </div>
    );
  }

  return <p>{String(value)}</p>;
}

export default function ReportSection({ title, data }) {
  if (isEmpty(data)) return null;

  return (
    <section className="result-section">
      <h3>{title}</h3>
      <ValueDisplay value={data} />
    </section>
  );
}
