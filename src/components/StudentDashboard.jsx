import LogoutButton from "./LogoutButton";

function StudentDashboard() {
  const token = localStorage.getItem("token");

  return (
    <div style={{ padding: "30px" }}>
      <h2>Student Dashboard</h2>
      <LogoutButton />
      <p>You are logged in.</p>
      <p><strong>JWT:</strong> {token}</p>
    </div>
  );
}

export default StudentDashboard;