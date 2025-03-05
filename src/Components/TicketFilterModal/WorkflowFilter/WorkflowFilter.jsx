import CustomMultiSelect from "../../MultipleSelect/MultipleSelect"
import { getLanguageByKey } from "../../utils/getLanguageByKey"
import { workflowOptions } from "../../../FormOptions/WorkFlowOption"
import "./WorkflowFilter.css"

export const WorkflowFilter = ({ handleMultiSelectChange, selectedValues }) => {
  return (
    <div className="workflow-multi-select">
      <label>{getLanguageByKey("Workflow")}</label>
      <CustomMultiSelect
        options={workflowOptions}
        placeholder={getLanguageByKey(
          "Alege workflow pentru afisare in sistem"
        )}
        onChange={(values) => handleMultiSelectChange("workflow", values)}
        selectedValues={selectedValues}
      />
    </div>
  )
}
