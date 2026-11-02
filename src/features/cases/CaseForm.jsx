
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCase, editCase } from "./casesSlice";

export default function CaseForm({ existingCase, onClose }) {
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.cases);

  const isEditing = Boolean(existingCase);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    problem_type: "general",
    status: "open",
  });

  const [formError, setFormError] = useState("");

  // Load existing case data when editing
  useEffect(() => {
    if (existingCase) {
      setFormData({
        title: existingCase.title || "",
        description: existingCase.description || "",
        problem_type: existingCase.problem_type || "general",
        status: existingCase.status || "open",
      });
    }
  }, [existingCase]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (formData.title.trim().length < 3) {
      setFormError("Title must contain at least 3 characters.");
      return;
    }

    if (formData.description.trim().length < 5) {
      setFormError("Description must contain at least 5 characters.");
      return;
    }

    try {
      if (isEditing) {
        const { status, ...updates } = formData;

        await dispatch(
          editCase({
            caseId: existingCase.id,
            updates: formData,
          })
        ).unwrap();
      } else {
        const { status, ...newCase } = formData;

        await dispatch(addCase(newCase)).unwrap();
      }

      onClose();
    } catch (error) {
      setFormError(
        typeof error === "string"
          ? error
          : "Unable to save the case. Please try again."
      );
    }
  }

  return (
    <section className="cases-form-card">
      <div className="cases-form-heading">
        <div>
          <p className="cases-eyebrow">
            {isEditing ? "UPDATE RECORD" : "NEW RECORD"}
          </p>

          <h2>
            {isEditing ? "Edit case" : "Create a new case"}
          </h2>

          <p>
            {isEditing
              ? "Update the information associated with this case."
              : "Describe your problem to create a case in Praxia."}
          </p>
        </div>

        <button
          type="button"
          className="cases-icon-button"
          onClick={onClose}
          aria-label="Close form"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="cases-form">
        <div className="cases-field">
          <label htmlFor="case-title">Case title</label>

          <input
            id="case-title"
            name="title"
            type="text"
            placeholder="e.g. Electricity bill increased"
            value={formData.title}
            onChange={handleChange}
            maxLength={200}
            required
          />
        </div>

        <div className="cases-field">
          <label htmlFor="case-description">
            Problem description
          </label>

          <textarea
            id="case-description"
            name="description"
            placeholder="Explain what happened and provide relevant details..."
            value={formData.description}
            onChange={handleChange}
            rows={5}
            required
          />
        </div>

        <div className="cases-field">
          <label htmlFor="case-type">Problem category</label>

          <select
            id="case-type"
            name="problem_type"
            value={formData.problem_type}
            onChange={handleChange}
          >
            <option value="general">General</option>
            <option value="electricity_bill">Electricity Bill</option>
            <option value="banking">Banking</option>
            <option value="education">Education</option>
            <option value="consumer_complaint">Consumer Complaint</option>
            <option value="technical">Technical</option>
            <option value="other">Other</option>
          </select>
        </div>

        {isEditing && (
          <div className="cases-field">
            <label htmlFor="case-status">Case status</label>

            <select
              id="case-status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        )}

        {formError && (
          <div className="cases-form-error" role="alert">
            {formError}
          </div>
        )}

        <div className="cases-form-actions">
          <button
            type="button"
            className="cases-secondary-button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="cases-primary-button"
            disabled={
              loading.create ||
              loading.update
            }
          >
            {loading.create || loading.update
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Create case"}
          </button>
        </div>
      </form>
    </section>
  );
}
