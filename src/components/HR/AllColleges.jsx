import React, { useEffect, useState } from "react";
import "../../css/AllColleges.css";

const AllColleges = () => {
  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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
      setLoading(false);

    } catch (error) {
      console.error(error);
      setMessage("Error fetching colleges");
      setLoading(false);
    }
  };

  if (loading) return <div>Loading colleges...</div>;

  return (
    <div className="all-colleges-container">
      <h2>All Colleges</h2>

      {message && <p className="error">{message}</p>}

      {colleges.length === 0 ? (
        <p>No colleges found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>College Name</th>
            </tr>
          </thead>
          <tbody>
            {colleges.map((college, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{college}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AllColleges;