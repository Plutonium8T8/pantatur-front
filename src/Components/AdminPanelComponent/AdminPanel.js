import React, { useState, useEffect } from "react";
import { startOfWeek, addDays, format } from "date-fns";
import Cookies from 'js-cookie';
import ModalWithToggles from "./ModalWithToggles"; // Импортируем компонент модалки
import './AdminPanel.css';
import { FaMinus, FaPlus, FaTrash } from "react-icons/fa";
import { translations } from "../utils/translations";

const ScheduleComponent = () => {
  const [schedule, setSchedule] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [intervals, setIntervals] = useState([]); // Для хранения интервалов выбранного дня
  const [isModalOpen, setIsModalOpen] = useState(false); // Состояние модалки
  const [selectedUser, setSelectedUser] = useState(null); // Хранит выбранного пользователя
  const [error, setError] = useState(null);

  const language = localStorage.getItem('language') || 'RO';

  // Закрытие модалки
  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleShiftChange = (employeeIndex, dayIndex) => {
    setSelectedEmployee(employeeIndex);
    setSelectedDay(dayIndex);

    const currentShifts = schedule[employeeIndex].shifts[dayIndex];
    if (currentShifts && currentShifts !== "-") {
      const parsedIntervals = currentShifts.split(", ").map((interval) => {
        const [start, end] = interval.split(" - ");
        return { start, end };
      });
      setIntervals(parsedIntervals);
    } else {
      setIntervals([]);
    }
  };

  const removeInterval = async (index) => {
    try {
      // Получаем данные о текущем сотруднике и выбранном дне
      const technicianId = schedule[selectedEmployee]?.id;
      const dayOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"][selectedDay];

      // Интервал, который нужно удалить
      const intervalToDelete = intervals[index];

      // Отправляем DELETE-запрос на сервер
      const token = Cookies.get("jwt");
      const response = await fetch(`https://pandatur-api.com/technicians/${technicianId}/schedule/${dayOfWeek}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start: intervalToDelete.start,
          end: intervalToDelete.end,
          timezone: "EST", // Используйте временной пояс, подходящий вашему приложению
        }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
      }

      console.log(`Интервал ${intervalToDelete.start} - ${intervalToDelete.end} для ${dayOfWeek} удалён успешно.`);

      // Удаляем интервал из локального состояния
      const updatedIntervals = intervals.filter((_, i) => i !== index);
      setIntervals(updatedIntervals);
      fetchData();
    } catch (error) {
      console.error("Ошибка при удалении интервала:", error);
    }
  };

  const saveShift = () => {
    const updatedSchedule = [...schedule];
    const formattedIntervals = intervals
      .map((interval) => `${interval.start} - ${interval.end}`)
      .join(", ");
    updatedSchedule[selectedEmployee].shifts[selectedDay] = formattedIntervals || "-";
    setSchedule(updatedSchedule);
    setSelectedEmployee(null);
    setSelectedDay(null);
    setIntervals([]);
  };

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
        const userId = user.id.id; // Извлекаем вложенное id
        const userSchedule = scheduleData.find(
          (schedule) => schedule.technician_id === userId
        );

        const weeklySchedule = userSchedule?.weekly_schedule || {};

        const shifts = Array(7).fill("-"); // Пустой массив для дней недели

        if (Array.isArray(weeklySchedule)) {
          // Если weekly_schedule - это массив интервалов
          weeklySchedule.forEach((daySchedule) => {
            const dayIndex = mapDayToIndex(daySchedule.day);
            shifts[dayIndex] = formatDaySchedule(daySchedule.intervals);
          });
        } else {
          // Если weekly_schedule - это объект с ключами дней недели
          shifts[0] = formatDaySchedule(weeklySchedule.monday); // Monday
          shifts[1] = formatDaySchedule(weeklySchedule.tuesday); // Tuesday
          shifts[2] = formatDaySchedule(weeklySchedule.wednesday); // Wednesday
          shifts[3] = formatDaySchedule(weeklySchedule.thursday); // Thursday
          shifts[4] = formatDaySchedule(weeklySchedule.friday); // Friday
          shifts[5] = formatDaySchedule(weeklySchedule.saturday); // Saturday
          shifts[6] = formatDaySchedule(weeklySchedule.sunday); // Sunday
        }

        return {
          id: userId, // Извлекаем ID из вложенного объекта
          name: `${user.id.name} ${user.id.surname}`, // Используем имя и фамилию
          email: user.id.user.email, // Email из вложенного user
          username: user.id.user.username, // Имя пользователя
          roles: user.id.user.roles, // Имя пользователя
          shifts,
        };
      });

      setSchedule(combinedSchedule);
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const mapDayToIndex = (day) => {
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    return days.indexOf(day.toLowerCase());
  };

  const formatDaySchedule = (daySchedule) => {
    if (Array.isArray(daySchedule) && daySchedule.length > 0) {
      return daySchedule
        .filter((interval) => interval.start && interval.end) // Убираем пустые интервалы
        .map((interval) => `${interval.start} - ${interval.end}`)
        .join(", ");
    }
    return "-"; // Если интервалов нет, возвращаем "-"
  };

  const cutInterval = async () => {
    try {
      // Получаем данные о текущем сотруднике и выбранном дне
      const technicianId = schedule[selectedEmployee]?.id;
      const dayOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"][selectedDay];

      // Формируем новый интервал
      const newInterval = {
        start: startTime || "", // Если поле пустое, отправляем пустую строку
        end: endTime || "", // Если поле пустое, отправляем пустую строку
        timezone: "EST", // Указываем временную зону
      };

      // Логируем данные перед отправкой
      console.log("Отправляем данные на сервер:", newInterval);

      // Отправляем POST-запрос на сервер
      const token = Cookies.get("jwt");
      const response = await fetch(`https://pandatur-api.com/technicians/${technicianId}/schedule/${dayOfWeek}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newInterval), // Отправляем сам объект напрямую
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
      }

      console.log(`Новый интервал ${newInterval.start} - ${newInterval.end} для ${dayOfWeek} добавлен успешно.`);

      // Обновляем локальное состояние
      setIntervals((prev) => [...prev, newInterval]);
      setStartTime("");
      setEndTime("");
      fetchData();
    } catch (error) {
      console.error("Ошибка при добавлении интервала:", error);
    }
  };

  const AddInterval = async () => {
    try {
      // Получаем данные о текущем сотруднике и выбранном дне
      const technicianId = schedule[selectedEmployee]?.id;
      const dayOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"][selectedDay];

      // Формируем новый интервал
      const newInterval = {
        start: startTime || "", // Если поле пустое, отправляем пустую строку
        end: endTime || "", // Если поле пустое, отправляем пустую строку
        timezone: "EST", // Указываем временную зону
      };

      // Логируем данные перед отправкой
      console.log("Отправляем данные на сервер:", newInterval);
      console.log("Текущий сотрудник:", technicianId);
      console.log("Текущий день недели:", dayOfWeek);
      console.log("Отправляемый интервал:", newInterval);
      // Отправляем POST-запрос на сервер
      const token = Cookies.get("jwt");
      const response = await fetch(`https://pandatur-api.com/technicians/${technicianId}/schedule/${dayOfWeek}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newInterval), // Отправляем сам объект напрямую
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Ошибка ответа сервера:", errorData);
        throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
      }

      console.log(`Новый интервал ${newInterval.start} - ${newInterval.end} для ${dayOfWeek} добавлен успешно.`);

      // Обновляем локальное состояние
      setIntervals((prev) => [...prev, newInterval]);
      setStartTime("");
      setEndTime("");
      fetchData();
    } catch (error) {
      console.error("Ошибка при добавлении интервала:", error);

    }
  };

  return (
    <div className="schedule-container">
      <div className="header-component">{translations['Grafic de lucru'][language]}</div>
      <div className="week-navigation">
        <button onClick={goToPreviousWeek}>{translations['săptămâna'][language]} {translations['trecută'][language]}</button>
        <span>
          {translations['săptămâna'][language]} {format(currentWeekStart, "dd.MM.yyyy")} - {format(addDays(currentWeekStart, 6), "dd.MM.yyyy")}
        </span>
        <button onClick={goToNextWeek}>{translations['săptămâna'][language]} {translations['viitoare'][language]}</button>
      </div>
      <div className="schedule-table-container">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>{translations['Angajat'][language]}</th>
              {getWeekDays().map((day, index) => (
                <th key={index}>{translations[format(day, "EEEE")][language]}, {format(day, "dd.MM")}</th>
              ))}
              <th>{translations['Ore de lucru'][language]}</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((employee, employeeIndex) => (
              <tr
                key={employeeIndex}
                onClick={() => {
                  setSelectedUser(employee); // Открываем модалку с данными пользователя
                  setIsModalOpen(true);
                }}
              >
                <td>
                  {employee.name} ({employee.id})
                </td>
                {employee.shifts.map((shift, dayIndex) => (
                  <td
                    // key={translations[dayIndex][language]}
                    key={dayIndex}
                    className="shift-cell"
                    onClick={(e) => {
                      e.stopPropagation(); // Предотвращаем открытие модалки при клике на shift
                      handleShiftChange(employeeIndex, dayIndex);
                    }}
                  >
                    {shift || "-"}
                  </td>
                ))}
                <td>{employee.shifts.reduce((total, shift) => total + calculateWorkedHours(shift), 0).toFixed(2)} h.</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Модалка с переключателями */}
      {isModalOpen && selectedUser && (
        <ModalWithToggles
          employee={selectedUser}
          isOpen={isModalOpen}// Передаём выбранного пользователя
          closeModal={closeModal} // Передаём функцию закрытия
        />
      )}

      {selectedEmployee !== null && selectedDay !== null && (
        <div className="modal-overlay" onClick={() => {
          setSelectedEmployee(null);
          setSelectedDay(null);
          setIntervals([]);
        }}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="modal-header">
              <h2>
                {schedule[selectedEmployee].name} ({schedule[selectedEmployee].id}),{" "}
                {translations[format(getWeekDays()[selectedDay], "EEEE")][language]} , {format(getWeekDays()[selectedDay], "dd.MM")}

              </h2>
            </header>
            {error && <div className="error-message">{error}</div>}
            <form
              className="notification-form"
              onSubmit={(e) => {
                e.preventDefault(); // Предотвращаем действие по умолчанию
                // Ваш код сохранения данных
              }}
            >
              <div className="input-group">
                <div className="time-inputs">
                  {intervals.map((interval, index) => (
                    <div key={index} className="time-interval">
                      <label>
                        Start
                        <input
                          type="time"
                          value={interval.start}
                          onChange={(e) => {
                            const updatedIntervals = [...intervals];
                            updatedIntervals[index].start = e.target.value;
                            setIntervals(updatedIntervals);
                          }}
                        />
                      </label>
                      <label>
                        End
                        <input
                          type="time"
                          value={interval.end}
                          onChange={(e) => {
                            const updatedIntervals = [...intervals];
                            updatedIntervals[index].end = e.target.value;
                            setIntervals(updatedIntervals);
                          }}
                        />
                      </label>
                      <button
                        type="button" // Предотвращаем отправку формы
                        className="delete-button"
                        onClick={() => removeInterval(index)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                  <div className="add-interval">
                    <label>
                      Start
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </label>
                    <label>
                      End
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </label>
                    <button
                      type="button" // Добавлено, чтобы предотвратить отправку формы
                      className="add-button-plus"
                      onClick={AddInterval}
                    >
                      <FaPlus />
                    </button>
                    <button
                      type="button" // Добавлено, чтобы предотвратить отправку формы
                      className="add-button-minus"
                      onClick={cutInterval}
                    >
                      <FaMinus />
                    </button>
                  </div>
                </div>
                <div className="button-container">
                  <button
                    type="submit" // Если нужно отправить форму
                    className="submit-button"
                    onClick={saveShift}
                  >
                    {translations['Salvează'][language]}
                  </button>
                  <button
                    type="button" // Добавлено, чтобы избежать отправки формы
                    className="clear-button"
                    onClick={() => {
                      setSelectedEmployee(null);
                      setSelectedDay(null);
                      setIntervals([]);
                    }}
                  >
                    {translations['Închide'][language]}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleComponent;