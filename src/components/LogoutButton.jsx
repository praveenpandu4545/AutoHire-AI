import { useNavigate } from "react-router-dom";
import "../css/LogoutButton.css";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove token
    localStorage.removeItem("token");

    // Redirect to home page
    navigate("/", { replace: true });
  };

  return (
    <button className="logout-btn" onClick={handleLogout}>
      Logout
    </button>
  );
}

export default LogoutButton;