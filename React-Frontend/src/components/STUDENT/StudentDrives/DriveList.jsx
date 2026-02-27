const DriveList = ({
  drives,
  toggleDetails,
  detailsDriveId,
  handleMyApplication,
}) => {
  return (
    <>
      <h2>Available Drives</h2>

      {drives.map((drive) => (
        <div key={drive.id} className="drive-card">
          <div className="drive-title">{drive.driveName}</div>

          <div className="button-group">
            <button onClick={() => toggleDetails(drive.id)}>
              View Details
            </button>
            <button onClick={() => handleMyApplication(drive)}>
              My Application
            </button>
          </div>

          {detailsDriveId === drive.id && (
            <div className="details-box">
              <p><strong>No of Rounds:</strong> {drive.noOfRounds}</p>
              <p><strong>Required Skills:</strong></p>
              <ul>
                {drive.requiredSkills?.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default DriveList;