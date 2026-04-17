import { useNavigate } from "react-router-dom";

function Opening() {
  const navigate = useNavigate();

  const containerStyle = {
    position: "fixed", // 🔥 key fix
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundImage: "url('/photos/bg-Picsart-AiImageEnhancer.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  };

  const overlayStyle = {
    background: "rgba(255, 255, 255, 0.2)", // light overlay for readability
    height: "100%",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  };

  const contentStyle = {
    textAlign: "center",
    color: "#111827", // 🔥 black text
    maxWidth: "650px",
    padding: "40px",
    marginTop: "80px", // 🔥 pushes content slightly down from top
  };

  const titleStyle = {
    color : "#3c8cd1",
    fontSize: "56px", // 🔥 bigger
    fontWeight: "bold",
    fontFamily: "sans-serif",
    marginBottom: "12px",
  };

  const taglineStyle = {
    fontSize: "20px", // 🔥 bigger
    marginBottom: "22px",
    fontWeight: "500",
  };

  const descStyle = {
    fontSize: "18px", // 🔥 bigger
    marginBottom: "35px",
    lineHeight: "1.7",
    fontWeight: "400",
  };

  const buttonContainer = {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
  };

  const buttonStyle = {
    padding: "14px 30px",
    fontSize: "16px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    color: "white",
    fontWeight: "600",
  };

  return (
    <div style={containerStyle}>
      <div style={overlayStyle}>
        <div style={contentStyle}>

          <h1 style={titleStyle}>AutoHire AI</h1>

          <p style={taglineStyle}>
            Intelligent Hiring. Simplified.
          </p>

          <p style={descStyle}>
            Streamline your hiring process with AI-powered resume analysis,
            automated eligibility checks, and structured interview workflows.
            Whether you're a student seeking opportunities or a panel managing
            interviews — everything is handled seamlessly.
          </p>

          <div style={buttonContainer}>
            <button
              style={{ ...buttonStyle, background: "#22c55e" }}
              onClick={() => navigate("/Student-Auth")}
            >
              🎓 Student
            </button>

            <button
              style={{ ...buttonStyle, background: "#3b82f6" }}
              onClick={() => navigate("/Panel-Auth")}
            >
              👨‍💼 Panel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Opening;