import Select from "../SelectComponent/SelectComponent"
import { platformOptions } from "../utils/platformOptions"
import CustomMultiSelect from "../MultipleSelect/MultipleSelect"
import { workflowOptions } from "../../FormOptions/WorkFlowOption"
import { metricOptions } from "./utils"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { ISO_DATE } from "../../app-constants"
import { format } from "date-fns"
import { getLanguageByKey } from "../utils"

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

      <DatePicker
        dateFormat={ISO_DATE}
        placeholderText={getLanguageByKey("Selectează data de start")}
        selected={dataRange.start}
        isClearable
        onChange={(date) => {
          setSelectDataRange((prev) => ({
            ...prev,
            start: date ? format(date, ISO_DATE) : undefined
          }))
        }}
      />

      <DatePicker
        dateFormat={ISO_DATE}
        placeholderText={getLanguageByKey("Selectează data de sfârșit")}
        selected={dataRange.end}
        isClearable
        onChange={(date) => {
          setSelectDataRange((prev) => ({
            ...prev,
            end: date ? format(date, ISO_DATE) : undefined
          }))
        }}
      />
    </div>
  )
}
