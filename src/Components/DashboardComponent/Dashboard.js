import React, { useState, useEffect, useCallback } from "react";
import { Bar, Pie, Line, PolarArea } from "react-chartjs-2";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { translations } from "../utils/translations";
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
import { api } from "../../api";
import { SpinnerRightBottom } from "../SpinnerRightBottom";
import { Filter } from "./Filter";
import { chartsMetadata } from "./utils";

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
  RadialLinearScale,
);

const metricsDashboardCharts = {
  platform_clients: {
    typeChart: "pie",
    label: "Leaduri per platformă",
  },
  weekly_tickets: {
    typeChart: "bar",
    label: "Leaduri per zi",
  },
  monthly_commission: {
    typeChart: "line",
    label: "Comision per lună",
  },
  monthly_tickets: {
    typeChart: "bar",
    label: "Leaduri per lună",
  },
  workflow_distribution: {
    typeChart: "bar",
    label: "Leaduri per etapă de lucru",
  },
  workflow_resolution_time: {
    typeChart: "bar",
    label: "Ore mediu prelucrare etapă",
  },
};

const datasetLabels = [
  "Leaduri per platformă",
  "Leaduri per zi",
  "Comision per lună",
  "Leaduri per lună",
  "Leaduri per etapă de lucru",
  "Ore mediu prelucrare etapă",
];

const datasetTypes = ["pie", "bar", "line", "bar", "bar", "bar"];

const datasetWidths = [2, 2, 2, 4, 4, 4];

const datasetHeights = [2, 1, 1, 2, 2, 2];

const positionX = [1, 3, 3, 5, 1, 5];

const positionY = [1, 1, 2, 1, 3, 3];

const chartComponents = {
  pie: Pie,
  bar: Bar,
  line: Line,
  polar: PolarArea,
};

const metricsDashboardData = (metricsDashboard) => {
  const metricsLayout = metricsDashboard.map((m, index) => ({
    i: `${index + 1}`,
    x: positionX[index] - 1,
    y: positionY[index] - 1,
    w: datasetWidths[index],
    h: datasetHeights[index],
    type: metricsDashboardCharts[m.id].typeChart,
    label:
      translations[metricsDashboardCharts[m.id].label][language] ||
      `Chart ${index + 1}`,
  }));

  return metricsLayout;
};

const language = localStorage.getItem("language") || "RO";

const Dashboard = () => {
  const [statistics, setStatistics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [platform, setPlatform] = useState();
  const [metrics, setMetrics] = useState([]);
  const [workflow, setWorkflow] = useState();
  const [dataRange, setDataRange] = useState({
    start: undefined,
    end: undefined,
  });
  const [metricsDashboard, setMetricsDashboard] = useState();

  const fetchStatistics = useCallback(
    async ({ platform, metrics, workflow, dataRange }) => {
      setIsLoading(true);
      try {
        const statsData = await api.dashboard.statistics({
          platform,
          metrics,
          workflow,
          data_range: dataRange,
        });

        if (
          typeof statistics === "object" &&
          statistics !== null &&
          metrics.length
        ) {
          setStatistics(Object.values(statsData));

          const metricsData = Object.entries(statsData).map(([key, value]) => ({
            id: key,
            value,
          }));
          console.log("🚀 ~ metricsData ~ metricsData:", metricsData);

          setMetricsDashboard(metricsData);
          return;
        }

        setStatistics(statsData);
      } catch (error) {
        console.error("Error fetching statistics:", error);
        setStatistics([]);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (
      (!dataRange.start && dataRange.end) ||
      (dataRange.start && !dataRange.end)
    )
      return;

    fetchStatistics({ platform, metrics, workflow, dataRange });
  }, [
    fetchStatistics,
    platform,
    metrics,
    workflow,
    dataRange.start,
    dataRange.end,
  ]);

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

  let cols = 4;
  if (containerWidth > 1400) {
    cols = 8;
  }
  const rowHeight = containerWidth / cols + 50;

  const statisticsLayout = statistics?.map((_, index) => ({
    i: `${index + 1}`,
    x: positionX[index] - 1,
    y: positionY[index] - 1,
    w: datasetWidths[index],
    h: datasetHeights[index],
    type: datasetTypes[index],
    label: translations[datasetLabels[index]][language] || `Chart ${index + 1}`,
  }));

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        padding: "5px",
      }}
    >
      <Filter
        onSelectPlatform={setPlatform}
        onSelectMetrics={setMetrics}
        onSelectWorkflow={setWorkflow}
        setSelectDataRange={setDataRange}
        dataRange={dataRange}
        platform={platform}
        metrics={metrics}
        workflow={workflow}
      />

      {isLoading ? (
        <SpinnerRightBottom />
      ) : (
        <GridLayout
          className="layout"
          layout={
            metricsDashboard
              ? metricsDashboardData(metricsDashboard)
              : statisticsLayout
          }
          cols={cols}
          rowHeight={rowHeight}
          width={containerWidth}
          isResizable={true}
          isDraggable={true}
        >
          {statistics?.map((statArray, index) => {
            const chartType = statisticsLayout[index].type;
            const ChartComponent = chartComponents[chartType];
            const chartLabel = statisticsLayout[index].label;

            const char = chartsMetadata(statArray, chartLabel, chartType);

            return (
              <div
                key={statisticsLayout[index].i}
                style={{ width: "100%", height: "100%", alignItems: "center" }}
              >
                <div
                  className="chart-container"
                  style={{
                    height: "100%",
                    width: "100%",
                  }}
                >
                  <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
                    {chartLabel}
                  </h3>
                  <ChartComponent data={char} />
                </div>
              </div>
            );
          })}
        </GridLayout>
      )}
    </div>
  );
};

export default Dashboard;
