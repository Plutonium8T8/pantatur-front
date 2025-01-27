import React, { useState, useEffect, useCallback } from 'react';
import { Bar, Line, Pie, Radar, Doughnut, PolarArea } from 'react-chartjs-2';
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
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
    const [statistics, setStatistics] = useState([]); // Array of 8 statistic arrays
    const [isLoading, setIsLoading] = useState(false);
    const [containerWidth, setContainerWidth] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    const fetchStatistics = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = Cookies.get("jwt");
            const response = await fetch(
                "https://pandatur-api.com/dashboard/statistics",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                }
            );
            if (!response.ok) throw new Error("Failed to fetch statistics.");
            const statsData = await response.json();
            console.log('Stats: ', statsData[0]);
            setStatistics(statsData[0]); // Assuming `statsData` is an array of 8 arrays
        } catch (error) {
            console.error("Error fetching statistics:", error);
            setStatistics([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatistics();
    }, [fetchStatistics]);

    useEffect(() => {
        const updateContainerDimensions = () => {
            const container = document.querySelector(".page-content");
            if (container) {
                setContainerWidth(container.offsetWidth);
                setContainerHeight(container.offsetHeight);
            }
        };
        updateContainerDimensions();
        window.addEventListener("resize", updateContainerDimensions);
        return () => window.removeEventListener("resize", updateContainerDimensions);
    }, []);

    const cols = 3; // Number of columns
    const rowHeight = containerHeight / cols;

    // Dynamically generate layout for 8 charts
    const layout = Array.from({ length: 8 }, (_, index) => ({
        i: 1,
        x: index % cols,
        y: Math.floor(index / cols),
        w: 1,
        h: 1,
    }));

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <GridLayout
                className="layout"
                layout={layout}
                cols={cols}
                rowHeight={rowHeight}
                width={containerWidth}
                isResizable={true}
                isDraggable={true}
            >
                {statistics.map((statArray, index) => {
                    // Prepare data for each chart
                    const pieData = {
                        labels: statArray.map((stat) => stat.platform),
                        datasets: [
                            {
                                data: statArray.map((stat) => stat.distinct_clients || 0),
                                backgroundColor: statArray.map(
                                    (stat) =>
                                        platformColors[stat.platform]?.background ||
                                        "rgba(200, 200, 200, 0.5)"
                                ),
                                borderColor: statArray.map(
                                    (stat) =>
                                        platformColors[stat.platform]?.border ||
                                        "rgba(200, 200, 200, 1)"
                                ),
                                borderWidth: 1,
                            },
                        ],
                    };

                    return (
                        <div key={1} style={{ width: "100%", height: "100%" }}>
                            <div
                                className="chart-container"
                                style={{
                                    height: "100%",
                                    width: "100%",
                                }}
                            >
                                <Pie data={pieData} />
                            </div>
                        </div>
                    );
                })}
            </GridLayout>
        </div>
    );
};

export default Dashboard;
