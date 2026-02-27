import DriveCard from "./DriveCard";

const DriveList = ({ drives, toggleDetails, detailsDriveId, handleMyApplication }) => {
  return (
    <>
      <h2>Available Drives</h2>

      {drives.map((drive) => (
        <DriveCard
          key={drive.id}
          drive={drive}
          toggleDetails={toggleDetails}
          detailsDriveId={detailsDriveId}
          handleMyApplication={handleMyApplication}
        />
      ))}
    </>
  );
};

export default DriveList;