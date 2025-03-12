import React, { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { Bar, Pie, Line, PolarArea } from "react-chartjs-2"
import GridLayout from "react-grid-layout"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"
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
import { showServerError, getLanguageByKey } from "../utils"
import "./Dashboard.css"
import { ISO_DATE } from "../../app-constants"

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

const Dashboard = () => {
  const [statistics, setStatistics] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const [selectedTechnicians, setSelectedTechnicians] = useState([])
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null
  })

  const fetchStatistics = useCallback(async ({ dateRange }) => {
    setIsLoading(true)
    const { start, end } = dateRange
    try {
      const statsData = await api.dashboard.statistics({
        start_date: start ? format(start, ISO_DATE) : null,
        end_date: end ? format(end, ISO_DATE) : null
      })

      setStatistics(statsData)
    } catch (error) {
      enqueueSnackbar(showServerError(error), { variant: "error" })
      setStatistics([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (
      (dateRange.start && dateRange.end) ||
      (!dateRange.start && !dateRange.end)
    ) {
      fetchStatistics({ dateRange })
      return
    }
  }, [fetchStatistics, dateRange])

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

  const statisticsLayout = Object.values(statistics)?.map((_, index) => ({
    i: `${index + 1}`,
    x: positionX[index] - 1,
    y: positionY[index] - 1,
    w: datasetWidths[index],
    h: datasetHeights[index],
    type: datasetTypes[index],
    label: getLanguageByKey(datasetLabels[index]) || `Chart ${index + 1}`
  }))

  return (
    <div className="dashboard-container-wrapper">
      <h1 className="dashboard-title | mb-16">
        {getLanguageByKey("Dashboard")}
      </h1>
      <div className="dashboard-divider" />

      <Filter
        onSelectedTechnicians={setSelectedTechnicians}
        onSelectDataRange={setDateRange}
        selectedTechnicians={selectedTechnicians}
        dateRange={dateRange}
      />

      {isLoading ? (
        <SpinnerRightBottom />
      ) : (
        <GridLayout
          className="dashboard-layout"
          layout={statisticsLayout}
          cols={cols}
          rowHeight={rowHeight}
          width={containerWidth}
          isResizable={true}
          isDraggable={true}
        >
          {Object.entries(statistics).map(([key, { data }]) => {
            const { typeChart, label } = metricsDashboardCharts[key]
            const ChartComponent = chartComponents[typeChart]
            const chartData = chartsMetadata(data, label, typeChart)

            return renderChart({
              Component: ChartComponent,
              chartData,
              chartLabel: label,
              index: key
            })
          })}
        </GridLayout>
      )}
    </div>
  )
}

export default Dashboard
