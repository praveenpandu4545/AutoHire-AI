import { useEffect, useState } from "react";
import "../../css/StudentResume.css";

function StudentResume() {
  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;
  const token = localStorage.getItem("token");

  const [resumeExists, setResumeExists] = useState(false);
  const [resumeURL, setResumeURL] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showATS, setShowATS] = useState(false);
  const [atsResult, setAtsResult] = useState(null); // 🔥 changed to object

  useEffect(() => {
    checkResume();
  }, []);

  const checkResume = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/springApi/student/resume/info`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const exists = await response.json();
      setResumeExists(exists);

      if (exists) {
        fetchResumeForView();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResumeForView = async () => {
    const response = await fetch(
      `${BASE_URL}/springApi/student/resume/download`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setResumeURL(url);
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${BASE_URL}/springApi/student/resume/upload`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    if (!response.ok) {
      alert(await response.text());
      return;
    }

    alert("Resume uploaded successfully");
    setResumeExists(true);
    fetchResumeForView();
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete resume?")) return;

    const response = await fetch(
      `${BASE_URL}/springApi/student/resume/delete`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      alert(await response.text());
      return;
    }

    alert("Resume deleted");
    setResumeExists(false);
    setResumeURL(null);
  };

  /* ================= ATS FEATURE ================= */

  const handleCheckATS = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/springApi/ai/checkATS`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!result.success) {
        alert(result.message);
        return;
      }

      setAtsResult(JSON.parse(result.data));
      setShowATS(true);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch ATS result");
    }
  };

  const handleBackToResume = () => {
    setShowATS(false);
  };

  /* ================================================= */

  if (loading) return <div>Loading...</div>;

  return (
    <div className="resume-container">
      <h2>Student Resume</h2>

      {!resumeExists ? (
        <div className="upload-box">
          <label htmlFor="upload" className="upload-label">
            ⬆ Upload Resume
          </label>

          <input
            id="upload"
            type="file"
            accept="application/pdf"
            hidden
            onChange={(e) => handleUpload(e.target.files[0])}
          />
        </div>
      ) : (
        <>
          {/* ===== ANALYZER SCREEN ===== */}
          {showATS ? (
            <div className="ats-result-container">
              <h3>Resume Intelligence Report ✨</h3>

              {atsResult ? (
                <>
                  <h2>Score: {atsResult.resume_score}/100</h2>

                  <p
                    style={{
                      marginTop: "15px",
                      fontSize: "16px",
                      lineHeight: "1.6",
                      color: "#333",
                    }}
                  >
                    <strong>Summary:</strong> {atsResult.summary}
                  </p>

                  {/* Strengths */}
                  <h4 style={{ marginTop: "20px", color: "green" }}>
                    ✅ Strengths
                  </h4>
                  <ul>
                    {atsResult.strengths?.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>

                  {/* Weaknesses */}
                  <h4 style={{ marginTop: "20px", color: "#e67e22" }}>
                    ⚠ Weaknesses
                  </h4>
                  <ul>
                    {atsResult.weaknesses?.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>

                  {/* Suggestions */}
                  <h4 style={{ marginTop: "20px", color: "#007bff" }}>
                    🚀 Suggestions
                  </h4>
                  <ul>
                    {atsResult.suggestions?.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p>No data available</p>
              )}

              <button
                className="back-btn"
                onClick={handleBackToResume}
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  marginTop: "20px",
                }}
              >
                Back to Resume
              </button>
            </div>
          ) : (
            <>
              {/* ===== PDF VIEWER ===== */}
              <div className="viewer-container">
                {resumeURL && (
                  <iframe
                    src={resumeURL}
                    title="Resume Viewer"
                    width="100%"
                    height="500px"
                  />
                )}
              </div>

              <div className="resume-buttons">
                <label className="replace-btn">
                  Replace
                  <input
                    type="file"
                    accept="application/pdf"
                    hidden
                    onChange={(e) => handleUpload(e.target.files[0])}
                  />
                </label>

                <button
                  className="delete-btn"
                  onClick={handleDelete}
                >
                  Delete
                </button>

                <button
                  className="ats-btn"
                  onClick={handleCheckATS}
                >
                  Resume Intelligence Analyzer ✨✨
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default StudentResume;