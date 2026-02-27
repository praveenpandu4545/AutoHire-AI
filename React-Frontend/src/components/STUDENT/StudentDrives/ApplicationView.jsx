const ApplicationView = ({
  selectedDrive,
  isRegistered,
  rounds,
  setMode,
  handleRegisterClick,
}) => {
  return (
    <>
      <h2>{selectedDrive.driveName} - My Application</h2>

      {!isRegistered ? (
        <>
          <p>You are not registered for this drive.</p>
          <button onClick={handleRegisterClick}>Register</button>
        </>
      ) : (
        <>
          <h3>Your Round Status</h3>
          {rounds
            .sort((a, b) => a.roundNumber - b.roundNumber)
            .map((round) => (
              <div key={round.id} className="round-box">
                <strong>
                  Round {round.roundNumber}: {round.roundName}
                </strong>
                <div className={`status ${round.status}`}>
                  {round.status}
                </div>
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