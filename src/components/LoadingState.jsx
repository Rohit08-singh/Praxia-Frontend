
import "./LoadingState.css";

function LoadingState() {
  return (
    <div className="ai-loading" role="status" aria-live="polite">
      <div className="ai-loading-animation">
        <div className="ai-loading-orbit ai-orbit-one"></div>
        <div className="ai-loading-orbit ai-orbit-two"></div>

        <div className="ai-loading-core">
          <span>AI</span>
        </div>
      </div>

      <div className="ai-loading-content">
        <h3>Investigating your case</h3>

        <p>
          Praxia is analyzing your problem and preparing an
          investigation report. This may take a little while.
        </p>

        <div className="ai-loading-progress">
          <div className="ai-loading-progress-bar"></div>
        </div>

        <div className="ai-loading-status">
          <span className="ai-loading-dot"></span>
          <span>Investigation is in progress...</span>
        </div>
      </div>
    </div>
  );
}

export default LoadingState;
