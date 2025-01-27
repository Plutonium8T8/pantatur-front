import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { translations } from '../Components/utils/translations';

const TechnicianSelect = ({ onTechnicianChange, selectedTechnicianId }) => {
    const [technicians, setTechnicians] = useState([]);
    const [selectedTechnician, setSelectedTechnician] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const language = localStorage.getItem('language') || 'RO';

    const fetchTechnicians = async () => {
        const token = Cookies.get('jwt');
        setIsLoading(true);

        try {
            const response = await fetch('https://pandatur-api.com/users-technician', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Origin: 'https://plutonium8t8.github.io',
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка запроса: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            const formattedData = data.map((item) => ({
                id: item.id.id,
                name: `${item.id.name} ${item.id.surname}`,
            }));

            setTechnicians(formattedData);
        } catch (error) {
            console.error('Ошибка при получении данных техников:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTechnicians();
    }, []);

    useEffect(() => {
        if (selectedTechnicianId === null || selectedTechnicianId === undefined) {
            setSelectedTechnician("");
        } else {
            setSelectedTechnician(selectedTechnicianId);
        }
    }, [selectedTechnicianId]);

    const handleChange = (event) => {
        const technicianId = event.target.value;
        setSelectedTechnician(technicianId);
        onTechnicianChange(technicianId);
    };

    return (
        <div className="input-group">
            <label htmlFor="extra-info-select">{translations['Manager responsabil'].language}</label>
            <select
                id="extra-info-select"
                className="technician-select"
                value={selectedTechnician || ""}
                onChange={handleChange}
                required
            >
                <option value="" disabled>
                    {technicians.length === 0 ? translations['Încărcăm...'][language] : translations['Manager responsabil'][language]}
                </option>
                {technicians.map((technician) => (
                    <option key={technician.id} value={technician.id}>
                        #{technician.id} {technician.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default TechnicianSelect;