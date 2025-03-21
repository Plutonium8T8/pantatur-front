import { getLanguageByKey } from "../utils"
import { workflowOptions } from "../../FormOptions"
import { MultiSelect } from "@mantine/core"

export const WorkflowFilter = ({ handleMultiSelectChange, selectedValues }) => {
  return (
    <MultiSelect
      label={getLanguageByKey("Workflow")}
      placeholder={getLanguageByKey("Alege workflow pentru afisare in sistem")}
      data={workflowOptions}
      onChange={(values) => handleMultiSelectChange("workflow", values)}
      defaultValue={selectedValues}
    />
    // <div className="d-flex flex-column gap-8">
    //   <label>{getLanguageByKey("Workflow")}</label>
    //   <CustomMultiSelect
    //     options={workflowOptions}
    //     placeholder={getLanguageByKey(
    //       "Alege workflow pentru afisare in sistem"
    //     )}
    //     onChange={(values) => handleMultiSelectChange("workflow", values)}
    //     selectedValues={selectedValues}
    //   />
    // </div>
  )
}
