import React, { useState, useEffect, useCallback } from "react"
import { Bar, Pie, Line, PolarArea } from "react-chartjs-2"
import GridLayout from "react-grid-layout"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"
import { translations } from "../utils/translations"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"
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
  RadialLinearScale
} from "chart.js"
import { enqueueSnackbar } from "notistack"
import { api } from "../../api"
import { SpinnerRightBottom } from "../SpinnerRightBottom"
import { Filter } from "./Filter"
import {
  chartsMetadata,
  datasetHeights,
  datasetLabels,
  datasetTypes,
  datasetWidths,
  metricsDashboardCharts,
  positionY,
  positionX
} from "./utils"
import { showServerError } from "../utils"
import "./Dashboard.css"

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
)

const THRESHOLD = 47

const chartComponents = {
  pie: Pie,
  bar: Bar,
  line: Line,
  polar: PolarArea
}

const renderChart = ({ Component, chartData, index, chartLabel }) => {
  return (
    <div
      key={index}
      style={{ width: "100%", height: "100%", alignItems: "center" }}
    >
      <div
        className="chart-container"
        style={{
          height: "100%",
          width: "100%"
        }}
      >
        <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
          {chartLabel}
        </h3>
        <Component data={chartData} />
      </div>
    </div>
  )
}

const metricsDashboardData = (metricsDashboard) => {
  const metricsLayout = Object.keys(metricsDashboard).map((key, index) => ({
    i: `${index + 1}`,
    x: positionX[index] - 1,
    y: positionY[index] - 1,
    w: datasetWidths[index],
    h: datasetHeights[index],
    type: metricsDashboardCharts[key].typeChart,
    label:
      translations[metricsDashboardCharts[key].label][language] ||
      `Chart ${index + 1}`
  }))

  return metricsLayout
}

const language = localStorage.getItem("language") || "RO"

const Dashboard = () => {
  const [statistics, setStatistics] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const [platform, setPlatform] = useState()
  const [metrics, setMetrics] = useState([])
  const [workflow, setWorkflow] = useState()
  const [dataRange, setDataRange] = useState({
    start: undefined,
    end: undefined
  })
  const [metricsDashboard, setMetricsDashboard] = useState()

  const fetchStatistics = useCallback(
    async ({ platform, metrics, workflow, dataRange }) => {
      setIsLoading(true)
      try {
        const statsData = await api.dashboard.statistics({
          ...(metrics.length && { metrics }),
          ...(platform && { platform }),
          ...(workflow && { workflow }),
          ...(dataRange.start && dataRange.end && { data_range: dataRange })
        })

        if (statsData && typeof statsData === "object" && metrics.length) {
          setMetricsDashboard(statsData)

          return
        }

        setStatistics(statsData)
      } catch (error) {
        enqueueSnackbar(showServerError(error), { variant: "error" })
        setStatistics([])
      } finally {
        setIsLoading(false)
      }
    },
    [setIsLoading, setStatistics, setMetricsDashboard]
  )

  useEffect(() => {
    if (
      (!dataRange.start && dataRange.end) ||
      (dataRange.start && !dataRange.end)
    ) {
      return
    }

    fetchStatistics({ platform, metrics, workflow, dataRange })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fetchStatistics,
    platform,
    metrics,
    workflow,
    dataRange.start,
    dataRange.end
  ])

  useEffect(() => {
    const updateContainerDimensions = () => {
      const container = document.querySelector(".page-content")
      if (container) {
        setContainerWidth(container.offsetWidth - THRESHOLD)
      }
    }
    updateContainerDimensions()
    window.addEventListener("resize", updateContainerDimensions)
    return () => window.removeEventListener("resize", updateContainerDimensions)
  }, [])

  let cols = 4
  if (containerWidth > 1400) {
    cols = 6
  }
  const rowHeight = containerWidth / cols + 50

  const statisticsLayout = statistics?.map((_, index) => ({
    i: `${index + 1}`,
    x: positionX[index] - 1,
    y: positionY[index] - 1,
    w: datasetWidths[index],
    h: datasetHeights[index],
    type: datasetTypes[index],
    label: translations[datasetLabels[index]][language] || `Chart ${index + 1}`
  }))

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title | mb-16">Dashboard</h1>
      <div className="dashboard-divider" />

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
          className="dashboard-layout"
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
          {metricsDashboard
            ? Object.entries(metricsDashboard).map(([key, value]) => {
                const { typeChart, label } = metricsDashboardCharts[key]
                const ChartComponent = chartComponents[typeChart]
                const chartData = chartsMetadata(value, label, typeChart)

                return renderChart({
                  Component: ChartComponent,
                  chartData,
                  chartLabel: label,
                  index: key
                })
              })
            : statistics?.map((statArray, index) => {
                const layoutItem = statisticsLayout[index]
                if (!layoutItem) return null

                const { type: chartType, label: chartLabel } = layoutItem
                const ChartComponent = chartComponents[chartType]

                const chartData = chartsMetadata(
                  statArray,
                  chartLabel,
                  chartType
                )

                return renderChart({
                  Component: ChartComponent,
                  chartData,
                  chartLabel,
                  index
                })
              })}
        </GridLayout>
      )}
    </div>
  )
}

export default Dashboard
