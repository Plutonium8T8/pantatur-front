import React from 'react';
import { Bar, Line, Pie, Radar, Doughnut, PolarArea } from 'react-chartjs-2';
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

const Dashboard = () => {
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
        labels: ['În lucru', 'Încheiate cu succes', 'Încheiate fără succes'],
        datasets: [
            {
                data: [30, 50, 20],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                ],
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
                <div style={{ marginBottom: '30px' }}>
                    <h3>Statusurile lead-urilor</h3>
                    <Pie data={pieData} />
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