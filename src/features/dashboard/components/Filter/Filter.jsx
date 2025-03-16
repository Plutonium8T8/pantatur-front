import { useEffect, useState } from "react"
import CustomMultiSelect from "../../../../Components/MultipleSelect/MultipleSelect"
import { ISO_DATE } from "../../../../app-constants"
import { getLanguageByKey } from "../../../../Components/utils"
import { DatePicker } from "../../../../Components/DatePicker"
import { api } from "../../../../api"
import { Button } from "../../../../Components/Button"
import "./Filter.css"

const getStartEndDateRange = (date) => {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  return {
    start: startOfDay,
    end: endOfDay
  }
}

const getYesterdayDate = () => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  return getStartEndDateRange(yesterday)
}

const date = {
  today: "today",
  yesterday: "yesterday"
}

export const Filter = ({
  onSelectedTechnicians,
  onSelectDataRange,
  selectedTechnicians,
  dateRange
}) => {
  const [technicianList, setTechnicianList] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentDate, setCurrentDate] = useState()

  useEffect(() => {
    const getTechnicianList = async () => {
      try {
        setLoading(true)
        const technicians = await api.users.getTechnicianList()
        const techniciansFullNameId = technicians.map(
          ({ id }) => `${id.id}: ${id.name} ${id.surname}`
        )

        setTechnicianList(techniciansFullNameId)
      } catch (error) {
      } finally {
        setLoading(false)
      }
    }

    getTechnicianList()
  }, [])

  return (
    <div className="d-flex gap-8 justify-content-center align-items-center mb-16">
      <div className="dashboard-filter-multi-select">
        <CustomMultiSelect
          options={technicianList}
          onChange={(technician) => {
            onSelectedTechnicians(technician)
          }}
          selectedValues={selectedTechnicians}
          placeholder={getLanguageByKey("Selectează operator")}
          loading={loading}
        />
      </div>

      <div className="d-flex | dashboard-filter-time">
        <Button
          className={`${currentDate === date.today ? "dashboard-filter-time-active" : ""}`}
          onClick={() => {
            onSelectDataRange(getStartEndDateRange(new Date()))
            setCurrentDate(date.today)
          }}
        >
          {getLanguageByKey("azi")}
        </Button>
        <Button
          className={`${currentDate === date.yesterday ? "dashboard-filter-time-active" : ""}`}
          onClick={() => {
            onSelectDataRange(getYesterdayDate())
            setCurrentDate(date.yesterday)
          }}
        >
          {getLanguageByKey("ieri")}
        </Button>
        <DatePicker
          selectsRange
          startDate={currentDate ? null : dateRange.start}
          endDate={currentDate ? null : dateRange.end}
          dateFormat={ISO_DATE}
          placeholder={getLanguageByKey("Selectează o dată")}
          clear
          onChange={(date) => {
            const [start, end] = date
            setCurrentDate()

            onSelectDataRange({
              start,
              end
            })
          }}
        />
      </div>
    </div>
  )
}
