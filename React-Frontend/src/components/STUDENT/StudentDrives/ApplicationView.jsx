const ApplicationView = ({
  selectedDrive,
  isRegistered,
  rounds,
  setMode,
  handleRegisterClick,
}) => {

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "";
    return new Date(dateTime).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <h2>{selectedDrive.driveName} - My Application</h2>

      {!isRegistered ? (
        <>
          <p className="not-registered">
            You are not registered for this drive.
          </p>
          <button onClick={handleRegisterClick}>Register</button>
        </>
      ) : (
        <>
          <h3>Your Round Status</h3>

          {rounds
            .sort((a, b) => a.roundNumber - b.roundNumber)
            .map((round) => (
              <div key={round.id} className="round-box">

                {/* Round Title */}
                <div>
                  <strong>
                    Round {round.roundNumber}: {round.roundName}
                  </strong>
                </div>

                {/* Status Badge */}
                <div className={`status ${round.status}`}>
                  {round.status}
                </div>

                {/* Interview Section */}
                {round.interviewScheduled && (
                  <div className="interview-box">
                    
                    <div className="interview-title">
                      Interview Scheduled
                    </div>

                    {round.panelName && (
                      <div>
                        <strong>Panel:</strong> {round.panelName}
                      </div>
                    )}

                    {round.interviewStartTime && round.interviewEndTime && (
                      <div>
                        <strong>Time:</strong>{" "}
                        {formatDateTime(round.interviewStartTime)}{" "}
                        -{" "}
                        {formatDateTime(round.interviewEndTime)}
                      </div>
                    )}

                  </div>
                )}

              </div>
            ))}
        </>
      )}

      <button
        className="back-button"
        onClick={() => setMode("list")}
      >
        Back to Drives
      </button>
    </>
  );
};

export default ApplicationView;