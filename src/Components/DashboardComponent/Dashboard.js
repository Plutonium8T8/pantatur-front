import React, { useState, useEffect, useCallback } from 'react';
import { Bar, Line, Pie, Radar, Doughnut, PolarArea } from 'react-chartjs-2';
import Cookies from 'js-cookie';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    ArcElement,
    RadialLinearScale,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    ArcElement,
    RadialLinearScale
);

const platformColors = {
    facebook: {
        background: 'rgba(16, 46, 216, 0.5)', // Facebook's signature blue
        border: 'rgb(39, 64, 204)',
    },
    viber: {
        background: 'rgba(104, 41, 229, 0.5)', // Viber's purple-blue
        border: 'rgb(142, 54, 235)',
    },
    whatsapp: {
        background: 'rgba(37, 211, 102, 0.5)', // WhatsApp's green
        border: 'rgba(37, 211, 102, 1)',
    },
    instagram: {
        background: 'rgba(255, 99, 132, 0.5)', // Instagram's reddish-pink
        border: 'rgba(255, 99, 132, 1)',
    },
    telegram: {
        background: 'rgba(0, 136, 204, 0.5)', // Telegram's blue
        border: 'rgba(0, 136, 204, 1)',
    },
};


const Dashboard = () => {
    const [statistics, setStatistics] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchStatistics = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = Cookies.get('jwt');
            const statsResponse = await fetch('https://pandatur-api.com/dashboard/statistics', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!statsResponse.ok) throw new Error('Failed to fetch statistics.');

            const statsData = await statsResponse.json();
            console.log('StatsData:', statsData[0]);

            setStatistics(statsData[0]); // Correctly update the state
        } catch (error) {
            console.error('Error fetching statistics:', error);
            setStatistics([]); // Reset statistics on error
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatistics();
    }, []);

    useEffect(() => {
        console.log('Updated statistics state:', statistics);
    }, [statistics]);

    const barData = {
        labels: ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai'],
        datasets: [
            {
                label: 'Lead-uri',
                data: [12, 19, 15, 22, 25],
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const lineData = {
        labels: ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri'],
        datasets: [
            {
                label: 'Lead-uri active',
                data: [5, 10, 8, 12, 7],
                fill: false,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
            },
        ],
    };

    const pieData = {
        labels: statistics.map((stat) => stat.platform)
            ? statistics.map((stat) => stat.platform)
            : ['No messages'],
        datasets: [
            {
                data: statistics.length
                    ? statistics.map((stat) => stat.distinct_clients || 0)
                    : [1],
                    backgroundColor: statistics.map(
                        (stat) => platformColors[stat.platform]?.background || 'rgba(200, 200, 200, 0.5)' // Default gray
                    ),
                    borderColor: statistics.map(
                        (stat) => platformColors[stat.platform]?.border || 'rgba(200, 200, 200, 1)' // Default gray
                    ),
                borderWidth: 1,
            },
        ],
    };

    const radarData = {
        labels: ['Vânzări', 'Marketing', 'Suport', 'Dezvoltare', 'Management'],
        datasets: [
            {
                label: 'Evaluare pe departamente',
                data: [8, 7, 9, 6, 7],
                backgroundColor: 'rgba(255, 159, 64, 0.5)',
                borderColor: 'rgba(255, 159, 64, 1)',
            },
        ],
    };

    const doughnutData = {
        labels: ['Desktop', 'Mobile', 'Tablet'],
        datasets: [
            {
                data: [55, 30, 15],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 205, 86, 0.5)',
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 205, 86, 1)',
                ],
            },
        ],
    };

    const polarData = {
        labels: ['Rusia', 'SUA', 'Europa', 'Asia'],
        datasets: [
            {
                data: [25, 35, 20, 20],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 205, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                ],
            },
        ],
    };

    return (
        <div className='container-dashboard'>
            <h2>Tabloul de bord</h2>
            <div className='container-graf'>
                <div style={{ marginBottom: '30px' }}>
                    <h3>Lead-uri pe luni</h3>
                    <Bar data={barData} />
                </div>
                <div style={{ marginBottom: '30px' }}>
                    <h3>Lead-uri active pe săptămână</h3>
                    <Line data={lineData} />
                </div>
                <div className='pie-chart' style={{ marginBottom: '30px' }}>
                    <h3>Statusurile lead-urilor</h3>
                    <Pie data={pieData}/>
                </div>
                <div style={{ marginBottom: '30px' }}>
                    <h3>Evaluare pe departamente</h3>
                    <Radar data={radarData} />
                </div>
                <div style={{ marginBottom: '30px' }}>
                    <h3>Distribuția dispozitivelor</h3>
                    <Doughnut data={doughnutData} />
                </div>
                <div style={{ marginBottom: '30px' }}>
                    <h3>Distribuția vânzărilor pe regiuni</h3>
                    <PolarArea data={polarData} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;