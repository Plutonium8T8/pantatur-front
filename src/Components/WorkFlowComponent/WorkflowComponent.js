import React from "react";
import Select from "react-select";
import { workflowOptions as rawWorkflowOptions } from '../../FormOptions/WorkFlowOption';

// Стили для каждого workflow
const workflowStyles = {
  Interesat: { backgroundColor: '#ffff88', borderColor: '#1B5E20', color: '#000' },
  'Apel de intrare': { backgroundColor: '#89C0FE', borderColor: '#388E3C', color: '#000' },
  'De prelucrat': { backgroundColor: '#ff8f92', borderColor: '#43A047', color: '#000' },
  'Luat in lucru': { backgroundColor: '#ebffb1', borderColor: '#2E7D32', color: '#000' },
  'Oferta trimisa': { backgroundColor: '#ffcc66', borderColor: '#2E7D32', color: '#000' },
  'Aprobat cu client': { backgroundColor: '#ffc8c8', borderColor: '#2E7D32', color: '#000' },
  'Contract semnat': { backgroundColor: '#ff8f92', borderColor: '#2E7D32', color: '#000' },
  'Plata primita': { backgroundColor: '#fff000', borderColor: '#2E7D32', color: '#000' },
  'Contract incheiat': { backgroundColor: '#87f2c0', borderColor: '#2E7D32', color: '#000' },
};

// Преобразуем workflowOptions в массив объектов
const workflowOptions = rawWorkflowOptions.map((workflow) => ({
  value: workflow,
  label: workflow,
}));

export const Workflow = ({ ticket, onChange = () => {} }) => {
  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? workflowStyles[state.data.value]?.backgroundColor || '#f0f0f0'
        : workflowStyles[state.data.value]?.backgroundColor || '#fff',
      color: workflowStyles[state.data.value]?.color || '#000',
      padding: '10px',
      cursor: 'pointer',
    }),
    control: (provided, state) => ({
      ...provided,
      borderColor: workflowStyles[ticket?.workflow]?.borderColor || '#ccc',
      backgroundColor: workflowStyles[ticket?.workflow]?.backgroundColor || '#fff',
      color: workflowStyles[ticket?.workflow]?.color || '#000',
      boxShadow: state.isFocused ? `0 0 0 2px ${workflowStyles[ticket?.workflow]?.borderColor || '#aaa'}` : 'none',
      '&:hover': {
        borderColor: workflowStyles[ticket?.workflow]?.borderColor || '#aaa',
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: workflowStyles[ticket?.workflow]?.color || '#000',
    }),
  };

  return (
    <div className="container-options-component">
      {/* <label> */}
        Workflow:
        <Select
          options={workflowOptions}
          value={workflowOptions.find(
            (option) => option.value === ticket?.workflow
          )}
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