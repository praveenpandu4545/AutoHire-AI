import React, { useEffect, useState } from "react";
import "../css/CreateNotice.css";

const NoticeBoard = () => {

  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

  const [allNotices, setAllNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetchAllNotices();

  }, []);

  const fetchAllNotices = async () => {

    try {

      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/springApi/notice/get-all-notices`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setAllNotices(data);
      }

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="create-notice-wrapper">

      <div className="create-notice-container">

        <div className="notice-top-bar">

          <h2>All Notices</h2>

        </div>

        <div className="all-notices-container">

          {
            loading ? (

              <p className="notice-loading">
                Loading notices...
              </p>

            ) : allNotices.length === 0 ? (

              <p className="notice-loading">
                No notices available
              </p>

            ) : (

              allNotices.map((notice) => (

                <div
                  key={notice.id}
                  className="notice-card"
                >

                  <div className="notice-card-header">

                    <h3>
                      {notice.heading}
                    </h3>

                    <button
                      className="more-info-btn"
                      onClick={() => {

                        if (
                          selectedNotice?.id === notice.id
                        ) {
                          setSelectedNotice(null);
                        } else {
                          setSelectedNotice(notice);
                        }
                      }}
                    >
                      {
                        selectedNotice?.id === notice.id
                          ? "Hide Details"
                          : "More Info"
                      }
                    </button>

                  </div>

                  {
                    selectedNotice?.id === notice.id && (

                      <div className="notice-details">

                        <div className="notice-detail-section">

                          <h4>Heading</h4>

                          <p>
                            {selectedNotice.heading}
                          </p>

                        </div>

                        <div className="notice-detail-section">

                          <h4>Notice Content</h4>

                          <p>
                            {selectedNotice.body}
                          </p>

                        </div>

                        <div className="notice-detail-section">

                          <h4>Attachments</h4>

                          {
                            selectedNotice.attachments?.length > 0 ? (

                              <div className="attachments-grid">

                                {
                                  selectedNotice.attachments.map(
                                    (file) => (

                                      <button
                                        key={file.id}
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
                                                  headers: {
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

                                            link.href = url;

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

                                          } catch (err) {

                                            console.error(err);
                                          }
                                        }}
                                      >

                                        <div className="attachment-icon">
                                          📄
                                        </div>

                                        <div className="attachment-info">

                                          <span className="attachment-name">
                                            {file.fileName}
                                          </span>

                                          <span className="attachment-download">
                                            Click to download
                                          </span>

                                        </div>

                                      </button>
                                    )
                                  )
                                }

                              </div>

                            ) : (

                              <p className="no-attachments">
                                No attachments available
                              </p>
                            )
                          }

                        </div>

                      </div>
                    )
                  }

                </div>
              ))
            )
          }

        </div>

      </div>

    </div>
  );
};

export default NoticeBoard;