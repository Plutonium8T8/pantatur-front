import { workflowOptions } from "../../FormOptions/WorkFlowOption"

export const platformOptions = [
  "telegram",
  "viber",
  "whatsapp",
  "facebook",
  "instagram",
  "sipuni"
]

export const filterDefaults = {
  workflow: workflowOptions.filter(
    (wf) => wf !== "Realizat cu succes" && wf !== "Închis și nerealizat"
  ),
  tags: []
}
