import React, { useState, useEffect, useCallback } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import Cookies from "js-cookie";
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
} from "chart.js";

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
  facebook: { background: "rgba(16, 46, 216, 0.5)", border: "rgb(39, 64, 204)" },
  viber: { background: "rgba(104, 41, 229, 0.5)", border: "rgb(142, 54, 235)" },
  whatsapp: { background: "rgba(37, 211, 102, 0.5)", border: "rgba(37, 211, 102, 1)" },
  instagram: { background: "rgba(255, 99, 132, 0.5)", border: "rgba(255, 99, 132, 1)" },
  telegram: { background: "rgba(0, 136, 204, 0.5)", border: "rgba(0, 136, 204, 1)" },
};

const weekdaysColors = {
  Sunday: { background: "rgba(255, 99, 132, 0.5)", border: "rgba(255, 99, 132, 1)" }, // Red
  Monday: { background: "rgba(54, 162, 235, 0.5)", border: "rgba(54, 162, 235, 1)" }, // Blue
  Tuesday: { background: "rgba(255, 206, 86, 0.5)", border: "rgba(255, 206, 86, 1)" }, // Yellow
  Wednesday: { background: "rgba(75, 192, 192, 0.5)", border: "rgba(75, 192, 192, 1)" }, // Teal
  Thursday: { background: "rgba(153, 102, 255, 0.5)", border: "rgba(153, 102, 255, 1)" }, // Purple
  Friday: { background: "rgba(255, 159, 64, 0.5)", border: "rgba(255, 159, 64, 1)" }, // Orange
  Saturday: { background: "rgba(199, 199, 199, 0.5)", border: "rgba(199, 199, 199, 1)" }, // Grey
};

const monthsColors = {
  January: { background: "rgba(255, 99, 132, 0.5)", border: "rgba(255, 99, 132, 1)" }, // Red
  February: { background: "rgba(54, 162, 235, 0.5)", border: "rgba(54, 162, 235, 1)" }, // Blue
  March: { background: "rgba(255, 206, 86, 0.5)", border: "rgba(255, 206, 86, 1)" }, // Yellow
  April: { background: "rgba(75, 192, 192, 0.5)", border: "rgba(75, 192, 192, 1)" }, // Teal
  May: { background: "rgba(153, 102, 255, 0.5)", border: "rgba(153, 102, 255, 1)" }, // Purple
  June: { background: "rgba(255, 159, 64, 0.5)", border: "rgba(255, 159, 64, 1)" }, // Orange
  July: { background: "rgba(255, 99, 132, 0.5)", border: "rgba(255, 99, 132, 1)" }, // Red
  August: { background: "rgba(54, 162, 235, 0.5)", border: "rgba(54, 162, 235, 1)" }, // Blue
  September: { background: "rgba(255, 206, 86, 0.5)", border: "rgba(255, 206, 86, 1)" }, // Yellow
  October: { background: "rgba(38, 201, 201, 0.5)", border: "rgba(75, 192, 192, 1)" }, // Teal
  November: { background: "rgba(153, 102, 255, 0.5)", border: "rgba(153, 102, 255, 1)" }, // Purple
  December: { background: "rgba(255, 159, 64, 0.5)", border: "rgba(255, 159, 64, 1)" }, // Orange
};


const workflowColors = {
  "Interesat": { background: "rgba(54, 162, 235, 0.5)", border: "rgba(54, 162, 235, 1)" }, // Blue
  "Aprobat cu client": { background: "rgba(75, 192, 192, 0.5)", border: "rgba(75, 192, 192, 1)" }, // Teal
  "Contract semnat": { background: "rgba(255, 206, 86, 0.5)", border: "rgba(255, 206, 86, 1)" }, // Yellow
  "Apel de intrare": { background: "rgba(153, 102, 255, 0.5)", border: "rgba(153, 102, 255, 1)" }, // Purple
  "Plată primită": { background: "rgba(255, 159, 64, 0.5)", border: "rgba(255, 159, 64, 1)" }, // Orange
  "Contract încheiat": { background: "rgba(46, 204, 113, 0.5)", border: "rgba(46, 204, 113, 1)" }, // Green
  "De prelucrat": { background: "rgba(231, 76, 60, 0.5)", border: "rgba(231, 76, 60, 1)" }, // Red
  "Luati în lucru": { background: "rgba(52, 152, 219, 0.5)", border: "rgba(52, 152, 219, 1)" }, // Light Blue
  "Ofertă trimisă": { background: "rgba(155, 89, 182, 0.5)", border: "rgba(155, 89, 182, 1)" }, // Violet
};

const Dashboard = () => {
  const [statistics, setStatistics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

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
      console.log(statsData[0]);
      setStatistics(statsData[0] || []); 
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
      }
    };
    updateContainerDimensions();
    window.addEventListener("resize", updateContainerDimensions);
    return () =>
      window.removeEventListener("resize", updateContainerDimensions);
  }, []);

  let cols = 2;
  if (containerWidth > 1400) {
    cols = 4;
  }
  const rowHeight = containerWidth / cols;

  const datasetLabels = [
    "Leaduri per platforma",
    "Leaduri per zi",
    "Comision per luna",
    "Leaduri per luna",
    "Leaduri per etapa de lucru",
  ];

  const datasetTypes = [
    "pie",
    "bar",
    "line",
    "bar",
    "bar"
  ];

  const datasetWidths = [
    1,
    2,
    2,
    2,
    2
  ];

  const layout = statistics.map((_, index) => ({
    i: `${index + 1}`,
    x: index % cols,
    y: Math.floor(index / cols),
    w: datasetWidths[index],
    h: 1,
    type: datasetTypes[index],
    label: datasetLabels[index] || `Chart ${index + 1}`
  }));

  // Chart type mapping
  const chartComponents = {
    pie: Pie,
    bar: Bar,
    line: Line
  };

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
          const chartType = layout[index].type;
          const ChartComponent = chartComponents[chartType];
          const chartLabel = layout[index].label;

          let chartData = {};

          if (chartType === "pie") {
            // Pie chart (platform-based)
            chartData = {
              labels: statArray.map((stat) => stat.platform),
              datasets: [
                {
                  label: chartLabel,
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
          } else {
            chartData = {
              labels: statArray.map((stat) => stat.week_period || stat.workflow || stat.month_period || stat.month),
              datasets: [
                {
                  label: chartLabel,
                  data: statArray.map((stat) => stat.tickets_count || stat.total_commission || 0),
                  backgroundColor: statArray.map(
                    (stat) => weekdaysColors[stat.week_period]?.background ||
                              workflowColors[stat.workflow]?.background ||
                              workflowColors[stat.time_period]?.background ||
                              monthsColors[stat.month_period]?.background ||
                              "rgba(200, 200, 200, 0.5)"
                  ),
                  borderColor: statArray.map(
                    (stat) => weekdaysColors[stat.week_period]?.border ||
                              workflowColors[stat.workflow]?.border ||
                              monthsColors[stat.month_period]?.border ||
                              "rgba(200, 200, 200, 1)"
                  ),
                  borderWidth: 1,
                },
              ],
            };
          }

          return (
            <div key={layout[index].i} style={{ width: "100%", height: "100%" }}>
              <div
                className="chart-container"
                style={{
                  height: "90%",
                  width: "90%",
                }}
              >
                <h3 style={{ textAlign: "center", marginBottom: "10px" }}>{chartLabel}</h3>
                <ChartComponent data={chartData} />
              </div>
            </div>
          );
        })}
      </GridLayout>
    </div>
  );
};

export default Dashboard;
