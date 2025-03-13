import React, { useState, useEffect, useCallback, useMemo } from "react"
import { format } from "date-fns"
import { useSnackbar } from "notistack"
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
import { useUser } from "../../UserContext"
import { api } from "../../api"
import { SpinnerRightBottom } from "../SpinnerRightBottom"
import { Filter } from "./Filter"
import {
  chartsMetadata,
  metricsDashboardCharts,
  normalizeUserGraphs,
  renderChart,
  chartComponents
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

const Dashboard = () => {
  const [statistics, setStatistics] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const [selectedTechnicians, setSelectedTechnicians] = useState([])
  const [userGraphs, setUserGraphs] = useState([])
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null
  })
  const { userId } = useUser()
  const { enqueueSnackbar } = useSnackbar()

  const fetchStatistics = useCallback(async ({ dateRange }) => {
    setIsLoading(true)
    const { start, end } = dateRange
    try {
      const statsData = await api.dashboard.statistics({
        start_date: start ? format(start, ISO_DATE) : null,
        end_date: end ? format(end, ISO_DATE) : null,
        user_id: userId
      })

      const { user_graphs, ...rest } = statsData

      if (user_graphs) {
        setUserGraphs(normalizeUserGraphs(user_graphs))
      }

      setStatistics(rest)
    } catch (error) {
      enqueueSnackbar(showServerError(error), { variant: "error" })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const changeGraphPosition = async (id, graphPositions) => {
    try {
      await api.dashboard.updateGraphById(id, {
        user_id: userId,
        ...graphPositions
      })
    } catch (error) {
      enqueueSnackbar(showServerError(error), { variant: "error" })
    }
  }

  const updateGraph = (movedGraph) => {
    const chartId = userGraphs.find(({ i }) => i === movedGraph.i)?.i

    if (chartId) {
      changeGraphPosition(chartId, {
        x: movedGraph.x,
        y: movedGraph.y,
        w: movedGraph.w,
        h: movedGraph.h
      })
    }
  }

  useEffect(() => {
    if (!!dateRange.start !== !!dateRange.end) {
      return
    }

    fetchStatistics({
      dateRange
    })
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

  const { cols, rowHeight } = useMemo(() => {
    const cols = containerWidth > 1400 ? 6 : 4
    const rowHeight = containerWidth / cols + 50

    return { cols, rowHeight }
  }, [containerWidth])

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
          layout={userGraphs}
          cols={cols}
          rowHeight={rowHeight}
          width={containerWidth}
          isResizable={true}
          isDraggable={true}
          compactType={null}
          preventCollision={true}
          onResizeStop={(_, __, resizeGraph) => updateGraph(resizeGraph)}
          onDragStop={(_, __, movedGraph) => updateGraph(movedGraph)}
        >
          {userGraphs.map((graph) => {
            const { typeChart, label } = metricsDashboardCharts[graph.graphName]
            const ChartComponent = chartComponents[typeChart]

            const chartData = chartsMetadata(
              statistics[graph.graphName].data,
              label,
              typeChart
            )

            return renderChart({
              Component: ChartComponent,
              chartData,
              chartLabel: label,
              index: graph.i
            })
          })}
        </GridLayout>
      )}
    </div>
  )
}

export default Dashboard
