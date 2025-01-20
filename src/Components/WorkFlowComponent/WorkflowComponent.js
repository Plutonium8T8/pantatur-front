import React from "react";
import Select from "react-select";
import { workflowOptions as rawWorkflowOptions } from '../../FormOptions/WorkFlowOption';
import { workflowStyles } from "../utils/workflowStyles";

// Преобразуем workflowOptions в массив объектов
const workflowOptions = rawWorkflowOptions.map((workflow) => ({
  value: workflow,
  label: workflow,
}));

export const Workflow = ({ ticket, onChange = () => { } }) => {
  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? workflowStyles[state.data.value]?.backgroundColor || '#f0f0f0'
        : workflowStyles[state.data.value]?.backgroundColor || '#fff',
      color: workflowStyles[state.data.value]?.backgroundColor || '#000',
      padding: '10px',
      cursor: 'pointer',
    }),
    control: (provided, state) => ({
      ...provided,
      borderColor: workflowStyles[ticket?.workflow]?.borderColor || '#ccc',
      backgroundColor: workflowStyles[ticket?.workflow]?.backgroundColor || '#fff',
      color: workflowStyles[ticket?.workflow]?.backgroundColor || '#000',
      boxShadow: state.isFocused ? `0 0 0 2px ${workflowStyles[ticket?.workflow]?.borderColor || '#aaa'}` : 'none',
      '&:hover': {
        borderColor: workflowStyles[ticket?.workflow]?.borderColor || '#aaa',
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: workflowStyles[ticket?.workflow]?.backgroundColor || '#000',
    }),
  };

  return (
    <div className="container-options-component">
      {/* <label> */}
      Workflow:
      <Select
        options={workflowOptions}
        value={workflowOptions.find((option) => option.value === ticket?.workflow) || ""}
        onChange={(selected) =>
          onChange({ target: { name: 'workflow', value: selected.value } })
        }
        styles={customStyles}
        isSearchable={false}
      />
      {/* </label> */}
    </div>
  );
};

export default Workflow;