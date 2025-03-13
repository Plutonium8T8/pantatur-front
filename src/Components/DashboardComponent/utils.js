import { Bar, Pie, Line, PolarArea } from "react-chartjs-2"
import { getLanguageByKey } from "../utils/getTranslationByKey"

export const datasetLabels = [
  "Leaduri per platformă",
  "Leaduri per zi",
  "Comision per lună",
  "Leaduri per lună",
  "Leaduri per etapă de lucru",
  "Ore mediu prelucrare etapă"
]

export const datasetTypes = ["pie", "bar", "line", "bar", "bar", "bar"]

export const metricsDashboardCharts = {
  platform_clients: {
    typeChart: "pie",
    label: "Leaduri per platformă"
  },
  weekly_tickets: {
    typeChart: "bar",
    label: "Leaduri per zi"
  },
  monthly_commission: {
    typeChart: "line",
    label: "Comision per lună"
  },
  monthly_tickets: {
    typeChart: "bar",
    label: "Leaduri per lună"
  },
  workflow_distribution: {
    typeChart: "bar",
    label: "Leaduri per etapă de lucru"
  },
  workflow_resolution_time: {
    typeChart: "bar",
    label: "Ore mediu prelucrare etapă"
  }
}

const platformColors = {
  facebook: {
    background: "rgba(16, 46, 216, 0.5)",
    border: "rgb(39, 64, 204)"
  },
  viber: { background: "rgba(104, 41, 229, 0.5)", border: "rgb(142, 54, 235)" },
  whatsapp: {
    background: "rgba(37, 211, 102, 0.5)",
    border: "rgba(37, 211, 102, 1)"
  },
  instagram: {
    background: "rgba(255, 99, 132, 0.5)",
    border: "rgba(255, 99, 132, 1)"
  },
  telegram: {
    background: "rgba(0, 136, 204, 0.5)",
    border: "rgba(0, 136, 204, 1)"
  }
}

const weekdaysColors = {
  Sunday: {
    background: "rgba(255, 99, 132, 0.5)",
    border: "rgba(255, 99, 132, 1)"
  }, // Red
  Monday: {
    background: "rgba(54, 162, 235, 0.5)",
    border: "rgba(54, 162, 235, 1)"
  }, // Blue
  Tuesday: {
    background: "rgba(255, 206, 86, 0.5)",
    border: "rgba(255, 206, 86, 1)"
  }, // Yellow
  Wednesday: {
    background: "rgba(75, 192, 192, 0.5)",
    border: "rgba(75, 192, 192, 1)"
  }, // Teal
  Thursday: {
    background: "rgba(153, 102, 255, 0.5)",
    border: "rgba(153, 102, 255, 1)"
  }, // Purple
  Friday: {
    background: "rgba(255, 159, 64, 0.5)",
    border: "rgba(255, 159, 64, 1)"
  }, // Orange
  Saturday: {
    background: "rgba(199, 199, 199, 0.5)",
    border: "rgba(199, 199, 199, 1)"
  } // Grey
}

const monthsColors = {
  January: {
    background: "rgba(255, 99, 132, 0.5)",
    border: "rgba(255, 99, 132, 1)"
  }, // Red
  February: {
    background: "rgba(54, 162, 235, 0.5)",
    border: "rgba(54, 162, 235, 1)"
  }, // Blue
  March: {
    background: "rgba(255, 206, 86, 0.5)",
    border: "rgba(255, 206, 86, 1)"
  }, // Yellow
  April: {
    background: "rgba(75, 192, 192, 0.5)",
    border: "rgba(75, 192, 192, 1)"
  }, // Teal
  May: {
    background: "rgba(153, 102, 255, 0.5)",
    border: "rgba(153, 102, 255, 1)"
  }, // Purple
  June: {
    background: "rgba(255, 159, 64, 0.5)",
    border: "rgba(255, 159, 64, 1)"
  }, // Orange
  July: {
    background: "rgba(255, 99, 132, 0.5)",
    border: "rgba(255, 99, 132, 1)"
  }, // Red
  August: {
    background: "rgba(54, 162, 235, 0.5)",
    border: "rgba(54, 162, 235, 1)"
  }, // Blue
  September: {
    background: "rgba(255, 206, 86, 0.5)",
    border: "rgba(255, 206, 86, 1)"
  }, // Yellow
  October: {
    background: "rgba(38, 201, 201, 0.5)",
    border: "rgba(75, 192, 192, 1)"
  }, // Teal
  November: {
    background: "rgba(153, 102, 255, 0.5)",
    border: "rgba(153, 102, 255, 1)"
  }, // Purple
  December: {
    background: "rgba(255, 159, 64, 0.5)",
    border: "rgba(255, 159, 64, 1)"
  } // Orange
}

const workflowColors = {
  Interesat: {
    background: "rgba(54, 162, 235, 0.5)",
    border: "rgba(54, 162, 235, 1)"
  },
  "Aprobat cu client": {
    background: "rgba(75, 192, 192, 0.5)",
    border: "rgba(75, 192, 192, 1)"
  },
  "Contract semnat": {
    background: "rgba(255, 206, 86, 0.5)",
    border: "rgba(255, 206, 86, 1)"
  }, // Yellow
  "Apel de intrare": {
    background: "rgba(153, 102, 255, 0.5)",
    border: "rgba(153, 102, 255, 1)"
  }, // Purple
  "Plată primită": {
    background: "rgba(255, 159, 64, 0.5)",
    border: "rgba(255, 159, 64, 1)"
  }, // Orange
  "Contract încheiat": {
    background: "rgba(46, 204, 113, 0.5)",
    border: "rgba(46, 204, 113, 1)"
  }, // Green
  "De prelucrat": {
    background: "rgba(231, 76, 60, 0.5)",
    border: "rgba(231, 76, 60, 1)"
  }, // Red
  "Luati în lucru": {
    background: "rgba(52, 152, 219, 0.5)",
    border: "rgba(52, 152, 219, 1)"
  }, // Light Blue
  "Ofertă trimisă": {
    background: "rgba(155, 89, 182, 0.5)",
    border: "rgba(155, 89, 182, 1)"
  } // Violet
}

export const chartComponents = {
  pie: Pie,
  bar: Bar,
  line: Line,
  polar: PolarArea
}

export const chartsMetadata = (statArray, chartLabel, chartType) => {
  let chartData = {}

  if (chartType === "pie" || chartType === "polar") {
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
              platformColors[stat.platform]?.border || "rgba(200, 200, 200, 1)"
          ),
          borderWidth: 1
        }
      ]
    }
  } else {
    chartData = {
      labels: statArray.map((stat) => {
        const periodKey =
          stat.week_period || stat.workflow || stat.month_period || stat.month
        return getLanguageByKey[periodKey] || periodKey || "Indisponibil"
      }),
      datasets: [
        {
          label: chartLabel,
          data: statArray.map(
            (stat) => stat.tickets_count || stat.total_commission || 0
          ),
          backgroundColor: statArray.map(
            (stat) =>
              weekdaysColors[stat.week_period]?.background ||
              workflowColors[stat.workflow]?.background ||
              workflowColors[stat.time_period]?.background ||
              monthsColors[stat.month_period]?.background ||
              "rgba(86, 244, 96, 0.69)"
          ),
          borderColor: statArray.map(
            (stat) =>
              weekdaysColors[stat.week_period]?.border ||
              workflowColors[stat.workflow]?.border ||
              monthsColors[stat.month_period]?.border ||
              "rgb(3, 202, 0)"
          ),
          borderWidth: 1
        }
      ]
    }
  }

  return chartData
}

export const normalizeUserGraphs = (graphs) => {
  return graphs.map((graph) => ({
    graphName: graph.graph_name,
    i: `${graph.id}`,
    x: graph.x,
    y: graph.y,
    w: graph.w,
    h: graph.h
  }))
}

export const renderChart = ({ Component, chartData, index, chartLabel }) => {
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

// TODO: Need to check if we needd this
export const getLastItemId = (list) => {
  const lastItem = list[list.length - 1]
  const id = lastItem?.split(":")[0]

  return id
}
