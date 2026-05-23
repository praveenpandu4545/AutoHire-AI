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
            className="college-search-input"
          />

          <button
            onClick={() =>
              setShowDeleteSection(
                !showDeleteSection
              )
            }
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