import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useUser } from "../../UserContext";
import "./UserProfile.css";
import { FaUser } from "react-icons/fa";

const UserPage = ({ isOpen, onClose }) => {
  const { userId } = useUser();
  const [error, setError] = useState(null);

  // User data states
  const [users, setUsers] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [usersExtended, setUsersExtended] = useState({
    name: "",
    surname: "",
    date_of_birth: "",
    id_card_series: "",
    id_card_number: "",
    id_card_release: "",
    idnp: "",
    address: "",
    phone: "",
  });

  const [usersTechnician, setUsersTechnician] = useState({
    policy_number: "",
    personal_exemption_number: "",
    job_title: "",
    department: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchUserData();
    }
  }, [isOpen]);

  const fetchUserData = async () => {
    try {
      const token = Cookies.get("jwt");

      // Fetch user basic information
      const userResponse = await fetch(`https://pandatur-api.com/user/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUsers(userData || {});
      } else {
        console.error(`Error fetching user: ${userResponse.status} - ${userResponse.statusText}`);
      }

      // Fetch extended user information
      const extendedResponse = await fetch(`https://pandatur-api.com/user_extended/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (extendedResponse.ok) {
        const extendedData = await extendedResponse.json();
        setUsersExtended(extendedData || {});
      } else {
        console.error(`Error fetching user_extended: ${extendedResponse.status} - ${extendedResponse.statusText}`);
      }

      // Fetch technician user information
      const technicianResponse = await fetch(`https://pandatur-api.com/user_technician/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (technicianResponse.ok) {
        const technicianData = await technicianResponse.json();
        setUsersTechnician(technicianData || {});
      } else {
        console.error(`Error fetching user_technician: ${technicianResponse.status} - ${technicianResponse.statusText}`);
      }

    } catch (error) {
      console.error("Error fetching user data:", error.message);
    }
  };


  // Handlers for each user type
  const handleUsersChange = (e) => {
    const { name, value } = e.target;
    setUsers((prev) => ({ ...prev, [name]: value }));
  };

  const handleUsersExtendedChange = (e) => {
    const { name, value } = e.target;
    setUsersExtended((prev) => ({ ...prev, [name]: value }));
  };

  const handleUsersTechnicianChange = (e) => {
    const { name, value } = e.target;
    setUsersTechnician((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get("jwt");
      const response = await fetch("https://pandatur-api.com/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          users,
          users_extended: usersExtended,
          users_technician: usersTechnician,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      console.log("User data saved successfully");
      onClose();
    } catch (error) {
      console.error("Error saving user data:", error.message);
      setError("Error saving user data.");
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="userSlideInModal">
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <header className="modal-header">
            <h2>
              <FaUser /> User Management
            </h2>
          </header>
          {error && <div className="error-message">{error}</div>}

          <form className="user-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <h3>Basic User Information</h3>
              {Object.keys(users).map((key) => (
                <input
                  key={key}
                  type="text"
                  name={key}
                  placeholder={key.replace(/_/g, " ")}
                  value={users[key]}
                  onChange={handleUsersChange}
                />
              ))}
            </div>

            <div className="input-group">
              <h3>Extended User Information</h3>
              {Object.keys(usersExtended).map((key) => (
                <input
                  key={key}
                  type={key === "date_of_birth" ? "date" : "text"}
                  name={key}
                  placeholder={key.replace(/_/g, " ")}
                  value={usersExtended[key]}
                  onChange={handleUsersExtendedChange}
                />
              ))}
            </div>

            <div className="input-group">
              <h3>Technician Information</h3>
              <label>Name:</label>
              {Object.keys(usersTechnician).map((key) => (
                <input
                  key={key}
                  type="text"
                  name={key}
                  placeholder={key.replace(/_/g, " ")}
                  value={usersTechnician[key]}
                  onChange={handleUsersTechnicianChange}
                />
              ))}
            </div>

            <div className="button-container">
              <button type="submit" className="submit-button">
                Save
              </button>
              <button type="button" className="clear-button" onClick={onClose}>
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
