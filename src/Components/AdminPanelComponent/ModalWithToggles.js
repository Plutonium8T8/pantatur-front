import React, { useState } from "react";
import "./ModalWithToggles.css";

const ModalWithToggles = ({ employee, closeModal }) => {
    const [toggle1, setToggle1] = useState(false);
    const [toggle2, setToggle2] = useState(false);
    const [toggle3, setToggle3] = useState(false);
    const [toggle4, setToggle4] = useState(false);
    const [toggle5, setToggle5] = useState(false);
    const [toggle6, setToggle6] = useState(false);
    const [toggle7, setToggle7] = useState(false);
    const [toggle8, setToggle8] = useState(false);
    const [toggle9, setToggle9] = useState(false);

    return (
        <div className="modal-overlay">
            <div className="modal-content-toggle">
                <div className="modal-header">
                    <h3>Permesiuni angajat</h3>
                    <button className="close-button" onClick={closeModal}>
                        ×
                    </button>
                </div>
                <div className="modal-body">
                    <p>
                        {employee.name} ({employee.id})
                    </p>
                    <div className="toggles-group-container">
                        <div className="toggles-group">
                            {/* Dashboard*/}
                            <div className="toggle-item">
                                Dashboard - citire
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={toggle1}
                                        onChange={() => setToggle1(!toggle1)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="toggle-item">
                                Dashboard - editare
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={toggle2}
                                        onChange={() => setToggle2(!toggle2)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="toggle-item">
                                Dashboard - full acces
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={toggle3}
                                        onChange={() => setToggle3(!toggle3)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                        {/* Lead*/}
                        <div className="toggles-group">
                            <div className="toggle-item">
                                Lead - citire
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={toggle4}
                                        onChange={() => setToggle4(!toggle4)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="toggle-item">
                                Lead - editare
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={toggle5}
                                        onChange={() => setToggle5(!toggle5)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="toggle-item">
                                Lead - full acces
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={toggle6}
                                        onChange={() => setToggle6(!toggle6)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                        {/* Chat*/}
                        <div className="toggles-group">
                            <div className="toggle-item">
                                Chat - citire
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={toggle7}
                                        onChange={() => setToggle7(!toggle7)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="toggle-item">
                                Chat - editare
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={toggle8}
                                        onChange={() => setToggle8(!toggle8)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="toggle-item">
                                Chat - full acces
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={toggle9}
                                        onChange={() => setToggle9(!toggle9)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="close-button" onClick={closeModal}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalWithToggles;