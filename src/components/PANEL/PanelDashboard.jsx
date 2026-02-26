import { useNavigate } from "react-router-dom";

function PanelDashboard() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Panel Dashboard</h2>
      <p>You are logged in.</p>
      <p><strong>JWT:</strong> {token}</p>
      <button className="logout-btn" onClick={handleLogout}>
          Logout
      </button>
    </div>
  );
}

export default PanelDashboard;