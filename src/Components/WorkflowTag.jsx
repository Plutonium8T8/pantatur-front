import { Tag } from "./Tag"

export const workflowStyles = {
  Interesat: "#ffffcc",
  "Apel de intrare": "#cde6fc",
  "De prelucrat": "#ffd5d6",
  "Luat în lucru": "#f5ffdc",
  "Ofertă trimisă": "#ffeebb",
  "Aprobat cu client": "#ffe5e5",
  "Contract semnat": "#ffd5d6",
  "Plată primită": "#fffacc",
  "Contract încheiat": "#cdeedd",
  "Realizat cu succes": "#d4fcd4",
  "Închis și nerealizat": "#ff9999",
  default: "#ddd"
}

export const workflowBrightStyles = {
  Interesat: "#ffff99",
  "Apel de intrare": "#a3d4fc",
  "De prelucrat": "#ffb3b4",
  "Luat în lucru": "#eaffb3",
  "Ofertă trimisă": "#ffd480",
  "Aprobat cu client": "#ffc1c1",
  "Contract semnat": "#ffb3b4",
  "Plată primită": "#ffea80",
  "Contract încheiat": "#a8e6c1",
  "Realizat cu succes": "#8bf58b",
  "Închis și nerealizat": "#ff4d4d",
  default: "#929292"
}

export const getColorByWorkflowType = (type, fallbackColor) => {
  if (typeof fallbackColor === "string") {
    return workflowStyles[type] || fallbackColor
  }
  return workflowStyles[type] || workflowStyles["default"]
}

export const getBrightByWorkflowType = (type) => {
  return workflowBrightStyles[type] || workflowBrightStyles["default"]
}

export const WorkflowTag = ({ type }) => {
  return (
    <Tag
      style={{
        backgroundColor: getColorByWorkflowType(type),
        borderColor: getBrightByWorkflowType(type),
        color: "#17a2b8"
      }}
    >
      {type}
    </Tag>
  )
}
