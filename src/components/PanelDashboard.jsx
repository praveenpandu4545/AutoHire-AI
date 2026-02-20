import LogoutButton from "./LogoutButton";

function PanelDashboard() {
  const token = localStorage.getItem("token");

  return (
    <div style={{ padding: "30px" }}>
        <LogoutButton />
      <h2>Panel Dashboard</h2>
      <p>You are logged in.</p>
      <p><strong>JWT:</strong> {token}</p>
    </div>
  );
}

export default PanelDashboard;