import AiResultView from "./AiResultView";

const ConfirmView = ({
  selectedDrive,
  hasResume,
  aiResult,
  aiLoading,
  handleAiCheck,
  handleFinalRegister,
  setMode,
}) => {
  return (
    <>
      <h2>{selectedDrive.driveName} - AI Check</h2>

      <div className="confirm-box">
        <p>
          Resume Uploaded: {hasResume ? "✅ Uploaded" : "❌ Not Uploaded"}
        </p>

        {!hasResume && (
          <>
            <p className="resume-warning">
              Please upload your resume before registering.
            </p>
            <button onClick={() => setMode("application")}>
              Back
            </button>
          </>
        )}

        {hasResume && !aiResult && (
          <>
            <hr />
            <p>
              You have to go through our AI Checkup before registering.
            </p>
            <button onClick={handleAiCheck}>
              Run AI Check
            </button>
          </>
        )}

        {aiLoading && <p>Running AI Analysis...</p>}

        {aiResult && (
          <AiResultView
            aiResult={aiResult}
            handleFinalRegister={handleFinalRegister}
            setMode={setMode}
          />
        )}
      </div>
    </>
  );
};

export default ConfirmView;