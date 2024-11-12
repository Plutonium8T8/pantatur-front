import React from 'react';
import { NumericFormat, NumberFormatBase } from 'react-number-format';

export const DateInput = (props) => {

    const onlyyear = props.onlyyear;
    const monthandyaer = props.monthandyaer;

    const format = (val) => {
        if (val === '') return '';

        if (onlyyear) {
            let year = val.toString().substring(0, 4);
            const today = new Date();
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

            if (Number(year) > today.getFullYear()) {
                year = today.getFullYear();
            }

            if (year.length === 4 && (Number(year) === 0 || Number(year) < 1900)) {
                year = "1900"
            }

            return `${year}`;

        } else if (monthandyaer) {

            let month = val.substring(0, 2);
            let year = val.substring(2, 6);

            const today = new Date();
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

            if (month.length === 1 && month[0] > 1) {
                month = `0${month[0]}`;
            } else if (month.length === 2) {
                // set the lower and upper boundary
                if (Number(month) === 0) {
                    month = `01`;
                } else if (Number(month) > 12) {
                    month = '12';
                }
            }

            if (Number(year) > today.getFullYear()) {
                year = today.getFullYear();
            }

            if (year.length === 4 && (Number(year) === 0 || Number(year) < 1900)) {
                year = "1900"
            }

            return `${month}.${year}`;
        } else {
            let day = val.substring(0, 2);
            let month = val.substring(2, 4);
            let year = val.substring(4, 8);

            const today = new Date();
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            //console.log(day.length === 1, day[0], lastDayOfMonth.getDate()[0]);
            if (day.length === 1 && day[0] > Number(lastDayOfMonth.getDate().toString()[0])) {
                day = `0${day[0]}`;
            } else if (Number(day) > lastDayOfMonth.getDate()) {
                day = lastDayOfMonth.getDate();
            } else if (day.length === 2 && Number(day) === 0) {
                day = `01`;
            }

            if (month.length === 1 && month[0] > 1) {
                month = `0${month[0]}`;
            } else if (month.length === 2) {
                // set the lower and upper boundary
                if (Number(month) === 0) {
                    month = `01`;
                } else if (Number(month) > 12) {
                    month = '12';
                }
            }

            if (Number(year) > today.getFullYear()) {
                year = today.getFullYear();
            }

            if (year.length === 4 && (Number(year) === 0 || Number(year) < 1900)) {
                year = "1900"
            }

            return `${day}.${month}.${year}`;
        }
    };

    const formatYear = (val) => {
        if (onlyyear) {

            if (!props.autodate && val === '') {
                if (val === '') return '';
            }

            let _val = val.toString().split(".").join("");
            //console.log("_val", _val);
            let year = _val.substring(0, 4);

            const today = new Date();
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

            if (Number(year) > today.getFullYear()) {
                year = today.getFullYear();
            }

            if (year.length < 4) {
                year = (today.getFullYear()).toString().substring(0, 4 - year.length) + year;
                if (Number(year) > today.getFullYear()) {
                    year = today.getFullYear();
                }
            } else if (year.length === 4 && (Number(year) === 0 || Number(year) < 1900)) {
                year = "1900"
            }

            return `${year}`;

        } else if (monthandyaer) {

            let _val = val.toString().split(".").join("");
            //console.log("_val", _val, val);
            let month = _val.substring(0, 2);
            let year = _val.substring(2, 6);

            const today = new Date();
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

            //console.log(_val.length)
            if (!props.autodate) {
                if (val === '') return '';
                //Затычка если введено меньше 6 цифр то очищаем поле
                if (_val.length < 4) {
                    alert("Введена некорректная дата, необходимо ввести в формате ММ.ГГ(ГГ) (12.10 либо 12.2010)");
                    return "";
                }
            }

            //Затычка на автозаполнение при сходе текущая дата если ввели 0
            if (Number(_val) === 0 || val === '') {
                month = today.getMonth().toString();
                year = today.getFullYear().toString();
            }

            if (!month || month.length === 0) {
                month = today.getMonth().toString();
            }

            if (month.length === 1 && month[0] >= 1) {
                month = `0${month[0]}`;
            } else if (month.length === 2) {
                // set the lower and upper boundary
                if (Number(month) === 0) {
                    month = `01`;
                } else if (Number(month) > 12) {
                    month = '12';
                }
            }

            if (Number(year) > today.getFullYear()) {
                year = today.getFullYear();
            }


            if (year.length < 4) {
                year = (today.getFullYear()).toString().substring(0, 4 - year.length) + year;
                if (Number(year) > today.getFullYear()) {
                    year = today.getFullYear();
                }
            } else if (year.length === 4 && (Number(year) === 0 || Number(year) < 1900)) {
                year = "1900"
            }

            return `${month}.${year}`;

        } else {
            let _val = val.split(".").join("");
            //console.log("_val", _val);
            let day = _val.substring(0, 2);
            let month = _val.substring(2, 4);
            let year = _val.substring(4, 8);

            const today = new Date();
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

            //console.log(_val.length)
            if (!props.autodate) {
                if (val === '') return '';
                //Затычка если введено меньше 6 цифр то очищаем поле
                if (_val.length < 6) {
                    alert("Введена некорректная дата, необходимо ввести в формате ЧЧ.ММ.ГГ(ГГ) (01.12.10 либо 01.12.2010)");
                    return "";
                }
            }

            //Затычка на автозаполнение при сходе текущая дата если ввели 0
            if (Number(_val) === 0 || val === '') {
                //return "";
                day = today.getDate().toString();
                month = today.getMonth().toString();
                year = today.getFullYear().toString();
            }

            if (day.length === 1 && day[0] > Number(lastDayOfMonth.getDate().toString()[0])) {
                day = `0${day[0]}`;
            } else if (day.length === 1 && day[0] != 0) {
                day = `0${day[0]}`;
            } else if (Number(day) > lastDayOfMonth.getDate()) {
                day = lastDayOfMonth.getDate();
            } else if (day.length === 2 && Number(day) === 0) {
                day = `01`;
            }

            if (!month || month.length === 0) {
                month = today.getMonth().toString();
            }

            if (month.length === 1 && month[0] >= 1) {
                month = `0${month[0]}`;
            } else if (month.length === 2) {
                // set the lower and upper boundary
                if (Number(month) === 0) {
                    month = `01`;
                } else if (Number(month) > 12) {
                    month = '12';
                }
            }

            if (Number(year) > today.getFullYear()) {
                year = today.getFullYear();
            }


            if (year.length < 4) {
                year = (today.getFullYear()).toString().substring(0, 4 - year.length) + year;
                if (Number(year) > today.getFullYear()) {
                    year = today.getFullYear();
                }
            } else if (year.length === 4 && (Number(year) === 0 || Number(year) < 1900)) {
                year = "1900"
            }

            return `${day}.${month}.${year}`;
        }
    }

    return (
        <>
            {!props.nolabel &&
                <label className='label-input-tg'>{props.label ? props.label : "Дата"}</label>
            }
            <NumberFormatBase
                placeholder="Дата (01.02.1990)"
                className={'masked-input'}
                {...props}
                format={format}
                onBlur={() => props.onChange({ target: { value: formatYear(props.value) } })}
            />
        </>
    )
}

export default DateInput;