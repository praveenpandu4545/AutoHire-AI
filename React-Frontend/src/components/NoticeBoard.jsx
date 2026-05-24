import React, {
  useEffect,
  useState,
} from "react";
import "../css/CreateNotice.css";

const NoticeBoard = () => {

  const BASE_URL =
    import.meta.env
      .VITE_SPRING_API_BASE_URL;

  const [allNotices,
    setAllNotices] =
    useState([]);

  const [selectedNotice,
    setSelectedNotice] =
    useState(null);

  const [loading,
    setLoading] =
    useState(true);

  const [role,
    setRole] =
    useState("");

  const [showDeleteBox,
    setShowDeleteBox] =
    useState(false);

  const [selectedNoticeId,
    setSelectedNoticeId] =
    useState("");

  useEffect(() => {
    fetchAllNotices();
    fetchRole();
  }, []);

  const fetchRole =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const response =
          await fetch(
            `${BASE_URL}/springApi/delete/get-role`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (
          response.ok
        ) {

          const data =
            await response.text();

          setRole(data);
        }

      } catch (err) {

        console.error(
          "Role fetch error:",
          err
        );
      }
    };

  const fetchAllNotices =
    async () => {

      try {

        setLoading(true);

        const token =
          localStorage.getItem(
            "token"
          );

        const response =
          await fetch(
            `${BASE_URL}/springApi/notice/get-all-notices`,
            {
              method:
                "GET",
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (
          response.ok
        ) {
          setAllNotices(
            data
          );
        }

      } catch (err) {

        console.error(
          err
        );

      } finally {

        setLoading(
          false
        );
      }
    };

  const handleDeleteNotice =
    async () => {

      if (
        !selectedNoticeId
      ) {
        alert(
          "Please select a notice"
        );
        return;
      }

      const confirmDelete =
        window.confirm(
          "Are you sure you want to delete this notice?"
        );

      if (
        !confirmDelete
      ) {
        return;
      }

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const response =
          await fetch(
            `${BASE_URL}/springApi/delete/notice/${selectedNoticeId}`,
            {
              method:
                "DELETE",
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const msg =
          await response.text();

        if (
          response.ok
        ) {

          alert(msg);

          setAllNotices(
            (prev) =>
              prev.filter(
                (
                  notice
                ) =>
                  notice.id !==
                  Number(
                    selectedNoticeId
                  )
              )
          );

          if (
            selectedNotice?.id ===
            Number(
              selectedNoticeId
            )
          ) {
            setSelectedNotice(
              null
            );
          }

          setSelectedNoticeId(
            ""
          );

          setShowDeleteBox(
            false
          );

        } else {

          alert(msg);
        }

      } catch (err) {

        console.error(
          err
        );

        alert(
          "Delete failed"
        );
      }
    };

  return (
    <div className="create-notice-wrapper">

      <div className="create-notice-container">

        {/* Top Bar */}
        <div className="notice-top-bar">

          <h2>
            All Notices
          </h2>

          {role ===
            "ROLE_HR" && (
            <button
              className="delete-btn"
              onClick={() =>
                setShowDeleteBox(
                  !showDeleteBox
                )
              }
                style={{
    background: "#c81f1f",
    color: "#000",
    borderRadius: "6px",
    padding: "8px 14px",
    fontSize: "14px",
    fontWeight: "1500",
    cursor: "pointer",
  }}
              
            >
              Delete Notice
            </button>
          )}

        </div>

        {/* Delete Box */}
        {role ===
          "ROLE_HR" &&
          showDeleteBox && (

          <div
            style={{
              display:
                "flex",
              gap: "10px",
              marginBottom:
                "20px",
            }}
          >

            <select
              value={
                selectedNoticeId
              }
              onChange={(
                e
              ) =>
                setSelectedNoticeId(
                  e.target.value
                )
              }
            >
              <option value="">
                Select Notice
              </option>

              {allNotices.map(
                (
                  notice
                ) => (
                  <option
                    key={
                      notice.id
                    }
                    value={
                      notice.id
                    }
                  >
                    {
                      notice.heading
                    }
                  </option>
                )
              )}
            </select>

            <button
              onClick={
                handleDeleteNotice
              }
              style={{
    background: "#6dadee",
    color: "#000",
    border: "1px solid #cfcfcf",
    borderRadius: "6px",
    padding: "8px 14px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  }}
            >
              Submit
            </button>

          </div>
        )}

        <div className="all-notices-container">

          {loading ? (

            <p className="notice-loading">
              Loading notices...
            </p>

          ) : allNotices.length ===
            0 ? (

            <p className="notice-loading">
              No notices available
            </p>

          ) : (

            allNotices.map(
              (
                notice
              ) => (

                <div
                  key={
                    notice.id
                  }
                  className="notice-card"
                >

                  <div className="notice-card-header">

                    <h3>
                      {
                        notice.heading
                      }
                    </h3>

                    <button
                      className="more-info-btn"
                      onClick={() => {

                        if (
                          selectedNotice?.id ===
                          notice.id
                        ) {
                          setSelectedNotice(
                            null
                          );
                        } else {
                          setSelectedNotice(
                            notice
                          );
                        }
                      }}
                    >
                      {selectedNotice?.id ===
                      notice.id
                        ? "Hide Details"
                        : "More Info"}
                    </button>

                  </div>

                  {selectedNotice?.id ===
                    notice.id && (

                    <div className="notice-details">

                      <div className="notice-detail-section">

                        <h4>
                          Heading
                        </h4>

                        <p>
                          {
                            selectedNotice.heading
                          }
                        </p>

                      </div>

                      <div className="notice-detail-section">

                        <h4>
                          Notice Content
                        </h4>

                        <p>
                          {
                            selectedNotice.body
                          }
                        </p>

                      </div>

                      <div className="notice-detail-section">

                        <h4>
                          Attachments
                        </h4>

                        {selectedNotice
                          .attachments
                          ?.length >
                        0 ? (

                          <div className="attachments-grid">

                            {selectedNotice.attachments.map(
                              (
                                file
                              ) => (

                                <button
                                  key={
                                    file.id
                                  }
                                  className="attachment-card"
                                  onClick={async () => {

                                    try {

                                      const token =
                                        localStorage.getItem(
                                          "token"
                                        );

                                      const response =
                                        await fetch(
                                          `${BASE_URL}/springApi/notice/attachment/${file.id}`,
                                          {
                                            headers:
                                            {
                                              Authorization:
                                                `Bearer ${token}`,
                                            },
                                          }
                                        );

                                      const blob =
                                        await response.blob();

                                      const url =
                                        window.URL.createObjectURL(
                                          blob
                                        );

                                      const link =
                                        document.createElement(
                                          "a"
                                        );

                                      link.href =
                                        url;

                                      link.download =
                                        file.fileName;

                                      document.body.appendChild(
                                        link
                                      );

                                      link.click();

                                      link.remove();

                                      window.URL.revokeObjectURL(
                                        url
                                      );

                                    } catch (
                                      err
                                    ) {

                                      console.error(
                                        err
                                      );
                                    }
                                  }}
                                >

                                  <div className="attachment-icon">
                                    📄
                                  </div>

                                  <div className="attachment-info">

                                    <span className="attachment-name">
                                      {
                                        file.fileName
                                      }
                                    </span>

                                    <span className="attachment-download">
                                      Click to download
                                    </span>

                                  </div>

                                </button>
                              )
                            )}

                          </div>

                        ) : (

                          <p className="no-attachments">
                            No attachments available
                          </p>
                        )}

                      </div>

                    </div>
                  )}

                </div>
              )
            )
          )}

        </div>

      </div>

    </div>
  );
};

export default NoticeBoard;