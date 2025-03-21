import { getLanguageByKey } from "../../utils"
import "./Filter.css"
import { Select, Button } from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { DD_MM_YYYY } from "../../../app-constants"
import { useGetTechniciansList } from "../../../hooks"
import dayjs from "dayjs"

const getStartEndDateRange = (date) => {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  return [startOfDay, endOfDay]
}

const getYesterdayDate = () => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  return getStartEndDateRange(yesterday)
}

export const Filter = ({
  onSelectedTechnicians,
  onSelectDataRange,
  selectedTechnicians,
  dateRange
}) => {
  const { technicians } = useGetTechniciansList()

  return (
    <div className="d-flex gap-8 justify-content-center align-items-center mb-16">
      <div className="dashboard-filter-multi-select">
        <Select
          clearable
          value={selectedTechnicians}
          searchable
          onChange={(technician) => {
            onSelectedTechnicians(technician ?? [])
          }}
          placeholder={getLanguageByKey("Selectează operator")}
          data={technicians}
        />
      </div>

      <div className="d-flex">
        <Button
          variant={
            dayjs(dateRange[0]).isSame(dayjs(), "day") &&
            dayjs(dateRange[1]).isSame(dayjs(), "day")
              ? "filled"
              : "default"
          }
          onClick={() => {
            onSelectDataRange(getStartEndDateRange(new Date()))
          }}
        >
          {getLanguageByKey("azi")}
        </Button>
        <Button
          variant={
            dayjs(dateRange[0]).isSame(dayjs().subtract(1, "day"), "day") &&
            dayjs(dateRange[1]).isSame(dayjs().subtract(1, "day"), "day")
              ? "filled"
              : "default"
          }
          onClick={() => {
            onSelectDataRange(getYesterdayDate())
          }}
        >
          {getLanguageByKey("ieri")}
        </Button>

        <DatePickerInput
          className="dashboard-filter-date-input"
          clearable
          valueFormat={DD_MM_YYYY}
          type="range"
          placeholder={getLanguageByKey("Selectează o dată")}
          value={dateRange}
          onChange={(date) => {
            onSelectDataRange(date)
          }}
        />
      </div>
    </div>
  )
}
