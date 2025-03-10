import Select from "../../SelectComponent/SelectComponent"
import { platformOptions } from "../../../Components/utils/platformOptions"
import CustomMultiSelect from "../../MultipleSelect/MultipleSelect"
import { workflowOptions } from "../../../FormOptions/WorkFlowOption"
import { LabelInput } from "../../LabelInput"
import "./Filter.css"
import { metricOptions } from "../utils"

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
    <div className="dashboard-filter">
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

      <LabelInput
        type="date"
        onChange={(e) =>
          setSelectDataRange((prev) => ({ ...prev, start: e.target.value }))
        }
      />

      <LabelInput
        type="date"
        onChange={(e) =>
          setSelectDataRange((prev) => ({ ...prev, end: e.target.value }))
        }
      />
    </div>
  )
}
