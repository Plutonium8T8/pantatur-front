import React from "react";
import { workflowOptions } from "../../FormOptions/WorkFlowOption";

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

export const Workflow = ({ ticket, onChange = () => {} }) => {
  // Получаем текущий стиль
  const currentStyle = ticket && ticket.workflow 
    ? workflowStyles[ticket.workflow] 
    : { backgroundColor: '#fff', borderColor: '#ccc' };

  return (
    <div className="container-options-component">
      <label>
        Workflow:
        <select
          name="workflow"
          value={ticket ? ticket.workflow : workflowOptions[0]}
          onChange={onChange}
          className="workflow-select"
          style={{
            backgroundColor: currentStyle.backgroundColor,
            borderColor: currentStyle.borderColor,
            borderWidth: '2px',
            borderStyle: 'solid',
            borderRadius: '4px',
            padding: '0.5rem',
            color: '#000', // Дополнительно задаем цвет текста
          }}
        >
          {workflowOptions.map((workflow) => (
            <option key={workflow} value={workflow}>
              {workflow}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default Workflow;