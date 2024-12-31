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
        labels: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май'],
        datasets: [
            {
                label: 'Лиды',
                data: [12, 19, 15, 22, 25],
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const lineData = {
        labels: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'],
        datasets: [
            {
                label: 'Активные лиды',
                data: [5, 10, 8, 12, 7],
                fill: false,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
            },
        ],
    };

    const pieData = {
        labels: ['В работе', 'Закрыто успешно', 'Закрыто неуспешно'],
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
        labels: ['Продажи', 'Маркетинг', 'Поддержка', 'Разработка', 'Управление'],
        datasets: [
            {
                label: 'Оценка по отделам',
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
        labels: ['Россия', 'США', 'Европа', 'Азия'],
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
        <div style={{ padding: '20px' }}>
            <h2>Дашборд</h2>
            <div style={{ marginBottom: '30px' }}>
                <h3>Лиды по месяцам</h3>
                <Bar data={barData} />
            </div>
            <div style={{ marginBottom: '30px' }}>
                <h3>Активные лиды за неделю</h3>
                <Line data={lineData} />
            </div>
            <div style={{ marginBottom: '30px' }}>
                <h3>Статусы лидов</h3>
                <Pie data={pieData} />
            </div>
            <div style={{ marginBottom: '30px' }}>
                <h3>Оценка по отделам</h3>
                <Radar data={radarData} />
            </div>
            <div style={{ marginBottom: '30px' }}>
                <h3>Распределение устройств</h3>
                <Doughnut data={doughnutData} />
            </div>
            <div style={{ marginBottom: '30px' }}>
                <h3>Распределение продаж по регионам</h3>
                <PolarArea data={polarData} />
            </div>
        </div>
    );
};

export default Dashboard;