// AiResultView.jsx

const AiResultView = ({
  aiResult,
  handleFinalRegister,
  setMode,
}) => {
  return (
    <div className="ai-result-box">

      {/* ================= STRICT ELIGIBILITY FAILED ================= */}
      {!aiResult.eligible && (
        <>
          <p className="not-eligible">❌ Not Eligible</p>

          {aiResult.analysis?.reasons && (
            <>
              <h4>Reasons:</h4>
              <ul>
                {aiResult.analysis.reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </>
          )}

          <p className="ai-conclusion">
            {aiResult.analysis?.conclusion}
          </p>

          <button
            className="back-button"
            onClick={() => setMode("application")}
          >
            Back
          </button>
        </>
      )}

      {/* ================= STRICT ELIGIBILITY PASSED ================= */}
      {aiResult.eligible && (
  <>
    <h3>Suitability Score: {aiResult.percentage}%</h3>
    <p className="eligible">Eligible ✅</p>

    {aiResult.analysis?.strengths?.length > 0 && (
      <>
        <h4>Strengths:</h4>
        <ul>
          {aiResult.analysis.strengths.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </>
    )}

    {aiResult.analysis?.weaknesses?.length > 0 && (
      <>
        <h4>Areas of Improvement:</h4>
        <ul>
          {aiResult.analysis.weaknesses.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </>
    )}

    {aiResult.analysis?.improvements?.length > 0 && (
      <>
        <h4>Recommended Actions:</h4>
        <ul>
          {aiResult.analysis.improvements.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </>
    )}

    <p className="ai-conclusion">
      {aiResult.analysis?.conclusion}
    </p>

    {/* 🔥 BUTTON GROUP */}
    <div className="ai-button-group">
      <button onClick={handleFinalRegister}>
        Register
      </button>

      <button
        className="back-button"
        onClick={() => setMode("application")}
      >
        Back
      </button>
    </div>
  </>
)}
    </div>
  );
};

export default AiResultView;