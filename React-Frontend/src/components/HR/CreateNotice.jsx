import React, { useState } from "react";
import "../../css/CreateNotice.css";
import NoticeBoard from "../NoticeBoard.jsx";

const CreateNotice = () => {

  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

  const [heading, setHeading] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showNotices, setShowNotices] = useState(false);

  const handleFileChange = (e) => {

    const newFiles = Array.from(e.target.files);

    setAttachments((prevFiles) => [
      ...prevFiles,
      ...newFiles
    ]);
  };

  const removeFile = (indexToRemove) => {

    const updatedFiles = attachments.filter(
      (_, index) => index !== indexToRemove
    );

    setAttachments(updatedFiles);
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);
      setMessage("");
      setError("");

      const token = localStorage.getItem("token");

      const formData = new FormData();

      formData.append("heading", heading);
      formData.append("body", body);

      attachments.forEach((file) => {
        formData.append("attachments[]", file);
      });

      const response = await fetch(
        `${BASE_URL}/springApi/notice/create-notice`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.text();

      if (response.ok) {

        alert("Notice created successfully");

        setHeading("");
        setBody("");
        setAttachments([]);

        document.getElementById("notice-files").value = "";

      } else {

        setError(data || "Failed to create notice");
      }

    } catch (err) {

      console.error(err);
      setError("Something went wrong");

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="create-notice-wrapper">

      <div className="create-notice-container">

        <div className="notice-top-bar">

  <h2>
    {
      showNotices
        ? "All Notices"
        : "Create Notice"
    }
  </h2>

  <button
    className="toggle-notice-btn"
    onClick={() => {

      setShowNotices(!showNotices);

    }}
  >
    {
      showNotices
        ? "Back To Form"
        : "Show All Notices"
    }
  </button>

</div>

        {
  !showNotices ? (

    <form onSubmit={handleSubmit}>

      <div className="notice-field">

        <label>Notice Heading</label>

        <input
          type="text"
          placeholder="Enter notice heading"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          required
        />

      </div>

      <div className="notice-field">

        <label>Notice Content</label>

        <textarea
          rows="10"
          placeholder="Enter detailed notice content"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />

      </div>

      <div className="notice-field">

        <label>Attachments</label>

        <div className="custom-file-upload">

          <input
            id="notice-files"
            type="file"
            multiple
            onChange={handleFileChange}
          />

        </div>

      </div>

      {
        attachments.length > 0 && (

          <div className="selected-files-container">

            {
              attachments.map((file, index) => (

                <div
                  key={index}
                  className="selected-file-card"
                >

                  <div className="file-details">

                    <span className="file-name">
                      {file.name}
                    </span>

                    <span className="file-size">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>

                  </div>

                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                  >
                    ✕
                  </button>

                </div>
              ))
            }

          </div>
        )
      }

      <button
        type="submit"
        className="create-notice-btn"
        disabled={loading}
      >
        {
          loading
            ? "Creating Notice..."
            : "Create Notice"
        }
      </button>

    </form>

  ) : (

    <NoticeBoard />

  )
}

        {
          message && (
            <p className="notice-success">
              {message}
            </p>
          )
        }

        {
          error && (
            <p className="notice-error">
              {error}
            </p>
          )
        }

      </div>

    </div>
  );
};

export default CreateNotice;