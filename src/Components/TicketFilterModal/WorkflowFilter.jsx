import CustomMultiSelect from "../MultipleSelect/MultipleSelect"
import { getLanguageByKey } from "../utils/getLanguageByKey"
import { workflowOptions } from "../../FormOptions/WorkFlowOption"

export const WorkflowFilter = ({ handleMultiSelectChange, selectedValues }) => {
  return (
    <div className="d-flex flex-column gap-8">
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
