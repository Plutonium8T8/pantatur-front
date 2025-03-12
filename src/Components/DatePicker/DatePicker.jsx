import BaseDatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import "./DatePicker.css"

export const DatePicker = ({ value, placeholder, clear, ...props }) => {
  return (
    <div className="date-picker-wrapper">
      <BaseDatePicker
        placeholderText={placeholder}
        selected={value}
        isClearable={!!clear}
        {...props}
      />
    </div>
  )
}
