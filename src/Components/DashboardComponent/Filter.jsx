import Select from "../SelectComponent/SelectComponent"
import { platformOptions } from "../utils/platformOptions"
import CustomMultiSelect from "../MultipleSelect/MultipleSelect"
import { workflowOptions } from "../../FormOptions/WorkFlowOption"
import { Input } from "../Input"
import { metricOptions } from "./utils"

export const Filter = ({
  onSelectPlatform,
  onSelectMetrics,
  onSelectWorkflow,
  setSelectDataRange,
  platform,
  metrics,
  workflow,
  dataRange
}) => {
  return (
    <div className="d-flex gap-8">
      <Select
        options={platformOptions}
        id="platform"
        className="input-field"
        onChange={(platform) => onSelectPlatform(platform)}
        value={platform}
        placeholder="Selectează platforma"
        clear
      />

      <CustomMultiSelect
        options={metricOptions}
        onChange={(metric) => onSelectMetrics(metric)}
        selectedValues={metrics}
        placeholder="Selectează indicatori"
      />

      <Select
        options={workflowOptions}
        placeholder="Selectează flux de lucru"
        id="workflow"
        className="input-field"
        onChange={(workflow) => onSelectWorkflow(workflow)}
        value={workflow}
        clear
      />

      <Input
        type="date"
        onChange={(e) =>
          setSelectDataRange((prev) => ({ ...prev, start: e.target.value }))
        }
      />

      <Input
        type="date"
        onChange={(e) =>
          setSelectDataRange((prev) => ({ ...prev, end: e.target.value }))
        }
      />
    </div>
  )
}
