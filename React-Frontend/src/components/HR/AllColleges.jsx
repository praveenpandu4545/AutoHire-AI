import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import "../../css/AllColleges.css";

const AllColleges = () => {
  const BASE_URL =
    import.meta.env.VITE_SPRING_API_BASE_URL;

  const [colleges, setColleges] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [showDeleteSection,
    setShowDeleteSection] =
    useState(false);

  const [selectedCollege,
    setSelectedCollege] =
    useState("");

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/springApi/college/getAll`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch colleges"
        );
      }

      const data =
        await response.json();

      setColleges(data);
    } catch (error) {
      console.error(error);
      setMessage(
        "Error fetching colleges"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollege =
    async () => {
      if (!selectedCollege) {
        alert(
          "Please select a college"
        );
        return;
      }

      const confirmDelete =
        window.confirm(
          `Are you sure you want to delete "${selectedCollege}"?`
        );

      if (!confirmDelete) return;

      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const response =
          await fetch(
            `${BASE_URL}/springApi/delete/college?clgName=${encodeURIComponent(
              selectedCollege
            )}`,
            {
              method: "DELETE",
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const msg =
          await response.text();

        if (!response.ok) {
          throw new Error(msg);
        }

        alert(msg);

        // remove instantly from UI
        setColleges((prev) =>
          prev.filter(
            (college) =>
              college !==
              selectedCollege
          )
        );

        setSelectedCollege("");
        setShowDeleteSection(false);
      } catch (error) {
        console.error(error);
        alert(
          error.message ||
            "Delete failed"
        );
      }
    };

  const filteredColleges =
    useMemo(() => {
      const searchLower =
        search
          .toLowerCase()
          .trim();

      return colleges.filter(
        (college) =>
          college
            .toLowerCase()
            .includes(
              searchLower
            )
      );
    }, [colleges, search]);

  if (loading) {
    return (
      <div className="all-colleges-container">
        <div className="loading-box">
          Loading colleges...
        </div>
      </div>
    );
  }

  return (
    <div className="all-colleges-container">
      <div className="colleges-header">
        <h2>All Colleges</h2>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Search colleges..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            style={{ 
              width : "500px"
            }}
            className="college-search-input"
          />

          <button
  onClick={() =>
    setShowDeleteSection(
      !showDeleteSection
    )
  }
  style={{
    background:
      "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow:
      "0 8px 20px rgba(239, 68, 68, 0.35)",
    transition: "0.25s ease",
  }}
>
  Delete
</button>
        </div>
      </div>

      {/* Delete Section */}
      {showDeleteSection && (
        <div
          style={{
            marginBottom:
              "20px",
            display: "flex",
            gap: "10px",
            alignItems:
              "center",
          }}
        >
          <select
            value={
              selectedCollege
            }
            onChange={(e) =>
              setSelectedCollege(
                e.target.value
              )
            }
            style={{
              width: "100%",
              height: "38px",
              padding: "0 16px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.08)",
              background:
                "linear-gradient(180deg, rgba(190, 205, 232, 0.95), rgba(149, 178, 231, 0.95))",
              color: "#080101",
              fontSize: "15px",
              fontWeight: "500",
              outline: "none",
              cursor: "pointer",
              boxSizing: "border-box",
              boxShadow:
                "0 4px 12px rgba(0,0,0,0.15)",
              width : "350px"
            }}
          >
            <option value="">
              Select College
            </option>

            {colleges.map(
              (
                college,
                index
              ) => (
                <option
                  key={index}
                  value={
                    college
                  }
                >
                  {college}
                </option>
              )
            )}
          </select>

          <button
            onClick={
              handleDeleteCollege
            }
             style={{
                background:
                  "linear-gradient(135deg, #e4d4d4, #3c49df)",
                color: "#100a0a",
                border: "none",
                borderRadius: "10px",
                padding: "10px 18px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "0.25s ease",
              }}
          >
            Submit
          </button>
        </div>
      )}

      {message && (
        <p className="error-message">
          {message}
        </p>
      )}

      {filteredColleges.length ===
      0 ? (
        <div className="empty-state">
          No colleges found.
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="colleges-table">
            <thead>
              <tr>
                <th>#</th>
                <th>
                  College Name
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredColleges.map(
                (
                  college,
                  index
                ) => (
                  <tr key={index}>
                    <td>
                      {index + 1}
                    </td>

                    <td>
                      {college}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllColleges;