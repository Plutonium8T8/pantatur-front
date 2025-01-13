import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const TechnicianSelect = ({ onTechnicianChange, selectedTechnicianId }) => {
    const [technicians, setTechnicians] = useState([]);
    const [selectedTechnician, setSelectedTechnician] = useState(selectedTechnicianId || ""); // Убедитесь, что начальное значение - строка

    const fetchTechnicians = async () => {
        const token = Cookies.get('jwt');

        try {
            const response = await fetch('https://pandatur-api.com/users-technician', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка запроса: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            const formattedData = data.map((item) => ({
                id: item.id.id, // Изменено на актуальную вложенность
                name: `${item.id.name} ${item.id.surname}`, // Используем имя и фамилию из вложенного объекта
            }));

            setTechnicians(formattedData);
        } catch (error) {
            console.error('Ошибка при получении данных техников:', error);
        }
    };

    useEffect(() => {
        fetchTechnicians();
    }, []);

    useEffect(() => {
        setSelectedTechnician(selectedTechnicianId || ""); // Синхронизация с внешним состоянием
    }, [selectedTechnicianId]);

    const handleChange = (event) => {
        const technicianId = event.target.value;
        setSelectedTechnician(technicianId);
        onTechnicianChange(technicianId);
    };

    return (
        <div className='tech-container'>
            <label htmlFor="technician-select">Responsabil lead:</label>
            <select
                id="technician-select"
                value={selectedTechnician}
                onChange={handleChange}
                className='tech-select'
            >
                <option value="">
                    Select
                </option>
                {technicians.map((technician) => (
                    <option key={technician.id} value={technician.id}>
                        {technician.name} ({technician.id})
                    </option>
                ))}
            </select>
        </div>
    );
};

export default TechnicianSelect;