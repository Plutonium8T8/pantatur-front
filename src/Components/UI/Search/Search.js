import React, { useState, useEffect, useContext } from 'react';
import { FilterContext } from '../../../App';

import './Search.modules.css';

const Search = () => {
    const [value, setValue] = useState("");
    const [filter, setFilter] = useContext(FilterContext);
    //задержка до отправки запроса в секундах шаг изменения милисекунд
    const delay = 1000;

    const onChangeHandler = (value) => {
        setValue(value);
    };

    useEffect(() => {
        console.log('filter updated');
        const timer = setTimeout(() => {
            if (filter.search === null && value.length !== 0) {
                setFilter(state => {
                    return {
                        ...state, search: value
                    }
                });
            } else if (filter.search !== null && value.length === 0) {
                setFilter(state => {
                    return {
                        ...state, search: null
                    }
                });
            } else {
                setFilter(state => {
                    return {
                        ...state, search: value
                    }
                });
            }
        }, delay);
        return () => {
            clearTimeout(timer)
        };
    }, [value, delay]);

    //useEffect(() => {
    //    console.log(filter);
    //}, [filter.search]);

    return (
        <div className="text-field">
            <div className="text-field__icon text-field__icon_search">
                <input id='search' className="text-field__input" type="text" placeholder="css" value={value} onChange={(e) => onChangeHandler(e.target.value)} placeholder="Поисковой запрос" />
            </div>
        </div>
    );
};

export default Search;