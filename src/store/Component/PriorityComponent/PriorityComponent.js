import React from "react";
import { priorityOptions } from "../../../PriorityOption";

export const Priority = ({ ticket, onChange = () => { } }) => {
    return (
        <div className="container-options-component">
        <label>
            Priority:
            <select
                name="priority"
                value={ticket ? ticket.priority : priorityOptions[0]}
                onChange={onChange}
                className="priority-select"
                style={{ display: 'block', padding: '0.5rem', marginBottom: '1rem' }}
            >
                {priorityOptions.map(prority => <option key={prority} value={prority}>{prority}</option>)}
            </select>
        </label>
        </div>
    )
}

export default Priority;