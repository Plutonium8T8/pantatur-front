import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const TechnicianSelect = ({ onTechnicianChange }) => {
    const [technicians, setTechnicians] = useState([]);
    const [selectedTechnician, setSelectedTechnician] = useState('');

    const fetchTechnicians = async () => {
        const token = Cookies.get('jwt');

        try {
            const response = await fetch('https://pandaturapi.com/users-technician', {
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
                id: item.id.id.id,
                name: `${item.id.name} ${item.id.surname}`,
            }));

            setTechnicians(formattedData);
        } catch (error) {
            console.error('Ошибка при получении данных техников:', error);
        }
    };

    useEffect(() => {
        fetchTechnicians();
    }, []);

    const handleChange = (event) => {
        const technicianId = event.target.value;
        setSelectedTechnician(technicianId);
        onTechnicianChange(technicianId); // Передаем выбранного техника в родительский компонент
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
                        {technician.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default TechnicianSelect;