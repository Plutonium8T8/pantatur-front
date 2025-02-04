import React from "react";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '18px', color: 'red' }}>
            <h2>No acces page!</h2>
        </div>
    );
};

export default ErrorPage;
