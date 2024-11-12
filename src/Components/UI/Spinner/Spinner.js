import React from 'react';

import './spinner.modules.css';

const Spinner = () => {
    return (
        <div className='spinner-container'>
            <div className="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
        </div>
    );
};

export default Spinner;