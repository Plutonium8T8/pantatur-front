import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useUser } from "../../UserContext";
import "./UserProfile.css";
import { FaUser } from "react-icons/fa";
import { translations } from "../utils/translations";

const UserPage = ({ isOpen, onClose }) => {
  const { userId } = useUser();
  const [error, setError] = useState(null);

  const language = localStorage.getItem('language') || 'RO';

  // User data states
  const [users, setUsers] = useState({
    username: "",
    email: ""
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
      const userResponse = await fetch(`https://pandatur-api.com/users/${userId}`, {
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

      console.log(users);

      // Fetch extended user information
      const extendedResponse = await fetch(`https://pandatur-api.com/users-extended/${userId}`, {
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
      const technicianResponse = await fetch(`https://pandatur-api.com/users-technician/${userId}`, {
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
      const response = await fetch(`https://pandatur-api.com/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          "email":users.email, 
          "username":users.username
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      console.log("User data saved successfully");

      response = await fetch(`https://pandatur-api.com/users-extended/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          "name":usersExtended.name, 
          "surname":usersExtended.surname, 
          "address":usersExtended.address, 
          "date_of_birth":usersExtended.date_of_birth, 
          "id_card_number":usersExtended.id_card_number, 
          "id_card_release":usersExtended.id_card_release, 
          "id_card_series":usersExtended.id_card_series, 
          "idnp":usersExtended.idnp, 
          "phone":usersExtended.phone
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      console.log("User data saved successfully");

      response = await fetch(`https://pandatur-api.com/users-technician/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          "department":usersTechnician.department, 
          "job_title":usersTechnician.job_title, 
          "personal_exemption_number":usersTechnician.personal_exemption_number, 
          "policy_number":usersTechnician.policy_number
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      console.log("User Tech data saved successfully");
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
              <FaUser />{translations['Gestionare utilizatori'][language]}
            </h2>
          </header>
          <form className="user-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <h3>{translations['Informații utilizator'][language]}</h3>
              {Object.keys(users).filter(attribute => !['password', 'roles', 'email_confirmed', 'password_reset_token', 'password_reset_requested_at', 'id'].includes(attribute)).map((key) => (
                <input
                  key={key}
                  type="text"
                  name={key}
                  placeholder={translations[key][language]}
                  value={users[key]}
                  onChange={handleUsersChange}
                />
              ))}
            </div>

            <div className="input-group">
              <h3>{translations['Informații extinse'][language]}</h3>
              {Object.keys(usersExtended).filter(attribute => !['user', 'photo', 'id'].includes(attribute)).map((key) => (
                <input
                  key={key}
                  type={["date_of_birth", "id_card_release"].includes(key) ? "date" : "text"}
                  name={key}
                  placeholder={translations[key][language]}
                  value={usersExtended[key]}
                  onChange={handleUsersExtendedChange}
                />
              ))}
            </div>

            <div className="input-group">
            <h3>{translations['Informații manager'][language]}</h3>
              {Object.keys(usersTechnician).filter(attribute => !['id', 'salary'].includes(attribute)).map((key) => (
                <input
                  key={key}
                  type="text"
                  name={key}
                  placeholder={translations[key][language]}
                  value={usersTechnician[key]}
                  onChange={handleUsersTechnicianChange}
                />
              ))}
            </div>

            <div className="button-container">
              <button type="submit" className="submit-button">
                {translations['Salvează'][language]}
              </button>
              <button type="button" className="clear-button" onClick={onClose}>
                {translations['Închide'][language]}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
