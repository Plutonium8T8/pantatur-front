import React from "react";
import { priorityOptions } from "./PriorityOption";

export const Priority = ({ ticket, onChange = () => { } }) => {
    return (
        <label>
            Priority:
            <select
                name="priority"
                value={ticket ? ticket.priority : priorityOptions[0]}
                onChange={onChange}
                style={{ display: 'block', width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
            >
                {priorityOptions.map(prority => <option key={prority} value={prority}>{prority}</option>)}
            </select>
        </label>
    )
}

export default Priority;