import React from "react";
import Select from "react-select";
import { workflowOptions as rawWorkflowOptions } from '../../FormOptions/WorkFlowOption';
import { workflowStyles } from "../utils/workflowStyles";
import { translations } from "../utils/translations";

const workflowOptions = rawWorkflowOptions.map((workflow) => ({
  value: workflow,
  label: workflow,
}));

export const Workflow = ({ ticket, onChange = () => { } }) => {
  const language = localStorage.getItem('language') || 'RO';

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? workflowStyles[state.data.value]?.backgroundColor || '#f0f0f0'
        : workflowStyles[state.data.value]?.backgroundColor || '#fff',
      color: '#000',
      padding: '10px',
      cursor: 'pointer',
    }),
    control: (provided, state) => ({
      ...provided,
      borderColor: workflowStyles[ticket?.workflow]?.borderColor || '#ccc',
      backgroundColor: workflowStyles[ticket?.workflow]?.backgroundColor || '#fff',
      color: '#000',
      boxShadow: state.isFocused ? `0 0 0 2px ${workflowStyles[ticket?.workflow]?.borderColor || '#aaa'}` : 'none',
      '&:hover': {
        borderColor: workflowStyles[ticket?.workflow]?.borderColor || '#aaa',
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#000',
    }),
  };

  const selectedOption = workflowOptions.find(
    (option) => option.value === ticket?.workflow
  );

  return (
    <div className="container-options-component">
      {/* <label>
            {translations['Etapa de lucru'][language]}
        </label> */}
      <Select
        options={workflowOptions}
        value={selectedOption || null}
        onChange={(selected) =>
          onChange({ target: { name: 'workflow', value: selected.value } })
        }
        styles={customStyles}
        isSearchable={false}
        getOptionLabel={(e) => translations[e.value]?.[language] || e.label}
      />
    </div>
  );
};

export default Workflow;