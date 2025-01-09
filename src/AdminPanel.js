import React, { useState, useEffect } from "react";
import { startOfWeek, addDays, format } from "date-fns";
import Cookies from 'js-cookie';
import './AdminPanel.css';

const ScheduleComponent = () => {
  const [schedule, setSchedule] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [shortStartTime, setShortStartTime] = useState("");
  const [shortEndTime, setShortEndTime] = useState("");
  const [isShortTimeEnabled, setIsShortTimeEnabled] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const getWeekDays = () => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  };

  useEffect(() => {
    fetch("https://pandatur-api.com/users-technician")
      .then((response) => response.json())
      .then((data) => {
        const formattedSchedule = data.map((technician) => ({
          id: technician.id.id.id,
          name: `${technician.id.name} ${technician.id.surname}`,
          shifts: ["", "", "", "", "", "", ""], // пустые смены по умолчанию
        }));
        setSchedule(formattedSchedule);
      })
      .catch((error) => console.error("Ошибка загрузки данных:", error));
  }, []);

  const handleShiftChange = (employeeIndex, dayIndex) => {
    setSelectedEmployee(employeeIndex);
    setSelectedDay(dayIndex);

    const currentShifts = schedule[employeeIndex].shifts[dayIndex];
    if (currentShifts && currentShifts !== "-") {
      const intervals = currentShifts.split(", ").map((interval) => {
        const [start, end] = interval.split(" - ");
        return { start, end };
      });

      setStartTime(intervals[0]?.start || "");
      setEndTime(intervals[0]?.end || "");
      if (intervals[1]) {
        setShortStartTime(intervals[1]?.start || "");
        setShortEndTime(intervals[1]?.end || "");
        setIsShortTimeEnabled(true);
      } else {
        setShortStartTime("");
        setShortEndTime("");
        setIsShortTimeEnabled(false);
      }
    } else {
      setStartTime("");
      setEndTime("");
      setShortStartTime("");
      setShortEndTime("");
      setIsShortTimeEnabled(false);
    }
  };

  const saveShift = () => {
    const updatedSchedule = [...schedule];
    const shift = isShortTimeEnabled
      ? `${startTime} - ${endTime} - ${shortStartTime} - ${shortEndTime}`
      : `${startTime} - ${endTime}`;
    updatedSchedule[selectedEmployee].shifts[selectedDay] = shift;
    setSchedule(updatedSchedule);
    setSelectedEmployee(null);
    setSelectedDay(null);
    setStartTime("");
    setEndTime("");
    setShortStartTime("");
    setShortEndTime("");
    setIsShortTimeEnabled(false);
  };

  const calculateWorkedHours = (shift) => {
    if (!shift) return 0;
    const [start, end, shortStart, shortEnd] = shift.split(" - ");
    const startTime = parseTime(start);
    const endTime = parseTime(end);
    const shortStartTime = shortStart ? parseTime(shortStart) : null;
    const shortEndTime = shortEnd ? parseTime(shortEnd) : null;

    let totalHours = endTime - startTime;

    if (shortStartTime && shortEndTime) {
      totalHours -= shortEndTime - shortStartTime;
    }

    return totalHours > 0 ? totalHours : 0;
  };

  const parseTime = (time) => {
    if (!time) return 0;
    const [hours, minutes] = time.split(":").map(Number);
    return hours + minutes / 60;
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  const goToPreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("jwt");

        // Fetch users-technician
        const usersResponse = await fetch("https://pandatur-api.com/users-technician", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const usersData = await usersResponse.json();

        // Fetch technicians' schedule
        const scheduleResponse = await fetch("https://pandatur-api.com/technicians/schedules", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const scheduleData = await scheduleResponse.json();

        // Combine data
        const combinedSchedule = usersData.map((user) => {
          const userSchedule = scheduleData.find(
            (schedule) => schedule.technician_id === user.id.id.id
          );

          const weeklySchedule = userSchedule?.weekly_schedule || {};

          const shifts = [
            formatDaySchedule(weeklySchedule.monday),
            formatDaySchedule(weeklySchedule.tuesday),
            formatDaySchedule(weeklySchedule.wednesday),
            formatDaySchedule(weeklySchedule.thursday),
            formatDaySchedule(weeklySchedule.friday),
            formatDaySchedule(weeklySchedule.saturday),
            formatDaySchedule(weeklySchedule.sunday),
          ];

          return {
            id: user.id.id.id,
            name: `${user.id.name} ${user.id.surname}`,
            shifts,
          };
        });

        setSchedule(combinedSchedule);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      }
    };

    fetchData();
  }, []);

  const formatDaySchedule = (daySchedule) => {
    if (!daySchedule || daySchedule.length === 0) return "-";
    return daySchedule
      .map((interval) => `${interval.start} - ${interval.end}`) // Только время
      .join(", ");
  };

  return (
    <div className="schedule-container">
      <div className="header-component">Grafic de lucru</div>
      <div className="week-navigation">
        <button onClick={goToPreviousWeek}>Saptamana Trecuta</button>
        <span>
          Saptamana {format(currentWeekStart, "dd.MM.yyyy")} - {format(addDays(currentWeekStart, 6), "dd.MM.yyyy")}
        </span>
        <button onClick={goToNextWeek}>Saptamana viitoare</button>
      </div>
      <table className="schedule-table">
        <thead>
          <tr>
            <th>Angajat</th>
            {getWeekDays().map((day, index) => (
              <th key={index}>{format(day, "EEEE, dd.MM")}</th>
            ))}
            <th>Ore de lucru</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((employee, employeeIndex) => (
            <tr key={employeeIndex}>
              <td>
                {employee.name} ({employee.id})
              </td>
              {employee.shifts.map((shift, dayIndex) => (
                <td
                  key={dayIndex}
                  className="shift-cell"
                  onClick={() => handleShiftChange(employeeIndex, dayIndex)}
                >
                  {shift || "-"}
                </td>
              ))}
              <td>{employee.shifts.reduce((total, shift) => total + calculateWorkedHours(shift), 0).toFixed(2)} ч.</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedEmployee !== null && selectedDay !== null && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Schimba orar</h3>
              <button
                className="close-button"
                onClick={() => {
                  setSelectedEmployee(null);
                  setSelectedDay(null);
                  setStartTime("");
                  setEndTime("");
                  setShortStartTime("");
                  setShortEndTime("");
                  setIsShortTimeEnabled(false);
                }}
              >
                ×
              </button>
            </div>
            <p>
              {schedule[selectedEmployee].name},{" "}
              {format(getWeekDays()[selectedDay], "EEEE, dd.MM")}
            </p>
            <div className="time-inputs">
              <div className="time-work">
                <label>
                  Interval 1 Start
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </label>
                <label>
                  Interval 1 End
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </label>
              </div>
              {isShortTimeEnabled && (
                <div className="short-time">
                  <label>
                    Interval 2 Start
                    <input
                      type="time"
                      value={shortStartTime}
                      onChange={(e) => setShortStartTime(e.target.value)}
                    />
                  </label>
                  <label>
                    Interval 2 End
                    <input
                      type="time"
                      value={shortEndTime}
                      onChange={(e) => setShortEndTime(e.target.value)}
                    />
                  </label>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="save-button" onClick={saveShift}>
                Save
              </button>
              <button
                className="cancel-button"
                onClick={() => {
                  setSelectedEmployee(null);
                  setSelectedDay(null);
                  setStartTime("");
                  setEndTime("");
                  setShortStartTime("");
                  setShortEndTime("");
                  setIsShortTimeEnabled(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleComponent;