import React from "react";
import { workflowOptions } from "./WorkFlowOption";

export const Workflow = ({ticket, onChange = () => {}}) => {
    return (
        <label>
            Workflow:
            <select
                name="workflow"
                value={ticket ? ticket.workflow : workflowOptions[0]}
                onChange={onChange}
                style={{ display: 'block', width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
            >
                {workflowOptions.map(workflow => <option key={workflow} value={workflow}>{workflow}</option>)}
            </select>
        </label>
    )
}

export default Workflow;