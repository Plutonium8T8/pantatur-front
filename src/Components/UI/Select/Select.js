import React, { useEffect, useState } from 'react';

import './Select.modules.css';

const Select = ({
    optionsList = [
        {
            id: '10',
            name: '10'
        },
        {
            id: '25',
            name: '25'
        },
        {
            id: '50',
            name: '50'
        },
        {
            id: '75',
            name: '75'
        },
        {
            id: '100',
            name: '100'
        },
        {
            id: 'all',
            name: 'Все'
        }
    ],
    value = {
        id: '25',
        name: '25'
    },
    onSelect = () => { } }

) => {

    const [showOptionList, setShowOptionList] = useState(false);
    const [position, setPosition] = useState('');

    const setShowOptionListHandler = () => {
        setShowOptionList(state => !state);
    };

    const optionClickHandler = ({ target }) => {
        const selectedId = target.getAttribute('value');
        const selectedItem = optionsList.find(item => item.id === selectedId);
        //console.log(target.getAttribute('value'));
        //console.log(selectedItem);
        onSelect({ ...selectedItem });
        setShowOptionList(false);
    };

    useEffect(() => {
        document.addEventListener("mousedown", clickOutsideHandler);

        return () => {
            document.removeEventListener("mousedown", clickOutsideHandler);
        };
    }, []);

    const clickOutsideHandler = (e) => {
        if (
            !e.target.classList.contains("custom-select-option") &&
            !e.target.classList.contains("selected-text")
        ) {
            setShowOptionList(false);
        };
    };

    const getCurrentDimension = () => {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        }
    }

    const optionListHeight = () => {
        return optionsList.length * (44+2);
    }

    return (
        <div className="custom-select-container" id="select-options"
            ref={el => {
                // el can be null - see https://reactjs.org/docs/refs-and-the-dom.html#caveats-with-callback-refs
                if (!el) return;
                                //положение от низа элемента    //положение от верха элемента   //Высота вьюпорта
                //console.log(el.getBoundingClientRect().bottom, el.getBoundingClientRect().top, getCurrentDimension().height, optionListHeight(), getCurrentDimension().height - el.getBoundingClientRect().bottom); // prints 200px
                if (getCurrentDimension().height - el.getBoundingClientRect().bottom < optionListHeight()) {
                    setPosition('top');
                } else {
                    setPosition("");
                }
            }}
        >
            <div
                className={showOptionList ? "selected-text active" : "selected-text"}
                onClick={(e) => {
                    setShowOptionListHandler(e)
                    //var stickyContainer = document.getElementById("select-options");
                    //console.log(stickyContainer && stickyContainer.offsetTop, getCurrentDimension().height);

                }}
            >
                {value.name}
            </div>
            {showOptionList && (
                <ul className={"select-options " + position}>
                    {position === 'top' && optionsList.toReversed().map(option => {
                        if (value.id !== option.id) {
                            return (
                                <li
                                    className="custom-select-option"
                                    data-name={option.name}
                                    key={option.id}
                                    value={option.id}
                                    onClick={optionClickHandler}
                                >
                                    {option.name}
                                </li>
                            );
                        };
                    })}
                    {position === '' && optionsList.map(option => {
                        if (value.id !== option.id) {
                            return (
                                <li
                                    className="custom-select-option"
                                    data-name={option.name}
                                    key={option.id}
                                    value={option.id}
                                    onClick={optionClickHandler}
                                >
                                    {option.name}
                                </li>
                            );
                        };
                    })}
                </ul>
            )}
        </div>
    );
};

export default Select;
