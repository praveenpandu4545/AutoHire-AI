// src/components/admin/AllColleges.jsx

import React, { useEffect, useMemo, useState } from "react";
import "../../css/AllColleges.css";

const AllColleges = () => {
  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/springApi/college/getAll`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch colleges");
      }

      const data = await response.json();
      setColleges(data);
    } catch (error) {
      console.error(error);
      setMessage("Error fetching colleges");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Enterprise Safe Search
  const filteredColleges = useMemo(() => {
    const searchLower = search.toLowerCase().trim();

    return colleges.filter((college) =>
      String(college || "")
        .toLowerCase()
        .includes(searchLower)
    );
  }, [colleges, search]);

  if (loading) {
    return (
      <div className="all-colleges-container">
        <div className="loading-box">Loading colleges...</div>
      </div>
    );
  }

  return (
    <div className="all-colleges-container">
      <div className="colleges-header">
        <h2>All Colleges</h2>

        <input
          type="text"
          placeholder="Search colleges..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="college-search-input"
        />
      </div>

      {message && <p className="error-message">{message}</p>}

      {filteredColleges.length === 0 ? (
        <div className="empty-state">
          No colleges found.
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="colleges-table">
            <thead>
              <tr>
                <th>#</th>
                <th>College Name</th>
              </tr>
            </thead>
            <tbody>
              {filteredColleges.map((college, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{college}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllColleges;