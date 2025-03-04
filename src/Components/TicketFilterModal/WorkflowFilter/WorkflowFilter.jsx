import CustomMultiSelect from "../../MultipleSelect/MultipleSelect"
import { getLanguageByKey } from "../../utils/getLanguageByKey"
import { workflowOptions } from "../../../FormOptions/WorkFlowOption"
import "./WorkflowFilter.css"

export const WorkflowFilter = ({
  onClose,
  handleResetFilters,
  onApplyFilter,
  handleMultiSelectChange,
  selectedValues
}) => {
  return (
    <>
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

      <div className="modal-buttons">
        <button onClick={onApplyFilter} className="apply-btn">
          {getLanguageByKey("Aplica filtru")}
        </button>
        <button onClick={handleResetFilters} className="reset-btn">
          {getLanguageByKey("Reset filter")}
        </button>
        <button onClick={onClose} className="cancel-btn">
          {getLanguageByKey("Close")}
        </button>
      </div>
    </>
  )
}
