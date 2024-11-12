import React from 'react';

import './RadioButton.modules.css';


const RadioButton = ({ checked, onChange, label, id, name, value, tgForm = null }) => (
  <div className="input-radio-container">
    <input
      type="radio"
      className={"custom-radio " + (tgForm ? "tg " : "")}
      id={id}
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
    />
    <label className='radio-label' htmlFor={id}>{label}</label>
  </div>
);

export default RadioButton;