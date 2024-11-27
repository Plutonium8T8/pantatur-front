import React from "react";
import Select from "react-select";
import { workflowOptions as rawWorkflowOptions } from '../../FormOptions/WorkFlowOption';

// Стили для каждого workflow
const workflowStyles = {
  Interesat: { backgroundColor: '#ffff88', borderColor: '#1B5E20' },
  'Apel de intrare': { backgroundColor: '#89C0FE', borderColor: '#388E3C' },
  'De prelucrat': { backgroundColor: '#ff8f92', borderColor: '#43A047' },
  'Luat in lucru': { backgroundColor: '#ebffb1', borderColor: '#2E7D32' },
  'Oferta trimisa': { backgroundColor: '#ffcc66', borderColor: '#2E7D32' },
  'Aprobat cu client': { backgroundColor: '#ffc8c8', borderColor: '#2E7D32' },
  'Contract semnat': { backgroundColor: '#ff8f92', borderColor: '#2E7D32' },
  'Plata primita': { backgroundColor: '#fff000', borderColor: '#2E7D32' },
  'Contract incheiat': { backgroundColor: '#87f2c0', borderColor: '#2E7D32' },
};

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
      color: '#000',
      padding: '10px',
    }),
    control: (provided) => ({
      ...provided,
      borderColor: workflowStyles[ticket?.workflow]?.borderColor || '#ccc',
      '&:hover': {
        borderColor: workflowStyles[ticket?.workflow]?.borderColor || '#aaa',
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#000',
    }),
  };

  return (
    <div className="container-options-component">
      {/* <label> */}
      Workflow
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