import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Adminbottom from "../components/adminbottom";
import axios from "axios";
import {
  enforceRole,
  getStoredCleaningRooms,
  saveStoredCleaningRooms,
  API_HOTELS_URL,
} from "../utils/authGuard";

function Admincleaning() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [selectedHotelId, setSelectedHotelId] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchHotels = async () => {
    try {
      const response = await axios.get(API_HOTELS_URL);
      if (response.status === 200) {
        setHotels(response.data);
      }
    } catch (error) {
      console.error("Ошибка загрузки отелей:", error);
    }
  };

  const loadRooms = () => {
    const stored = getStoredCleaningRooms();
    setRooms(stored);
  };

  // Проверка прав: только главный администратор
  useEffect(() => {
    const init = async () => {
      const user = await enforceRole(["admin"], navigate);
      if (user) {
        setCurrentUser(user);
        await fetchHotels();
        loadRooms();
      }
    };
    init();
  }, [navigate]);

  // Изменение статуса уборки главным админом (проверка/сброс)
  const handleToggleStatus = (room) => {
    const nextStatus = room.status === "Убрано" ? "Не убрано" : "Убрано";
    const timestamp = new Date().toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const updated = rooms.map((r) => {
      if (r.id === room.id) {
        return {
          ...r,
          status: nextStatus,
          cleanedBy: nextStatus === "Убрано" ? "Проверено Главным Админом" : "—",
          cleanedAt: nextStatus === "Убрано" ? timestamp : "—",
          comment:
            nextStatus === "Убрано"
              ? "Статус подтверждён администратором."
              : "Администратор запросил повторную уборку.",
        };
      }
      return r;
    });

    saveStoredCleaningRooms(updated);
    setRooms(updated);
  };

  // Удаление номера
  const handleDeleteRoom = (room) => {
    const confirmDelete = window.confirm(
      `Удалить запись о номере «${room.roomNumber}» (${room.hotelName})?`
    );
    if (!confirmDelete) return;

    const updated = rooms.filter((r) => r.id !== room.id);
    saveStoredCleaningRooms(updated);
    setRooms(updated);
  };

  const filteredRooms = rooms.filter((room) => {
    const matchHotel = selectedHotelId === "all" || String(room.hotelId) === String(selectedHotelId);
    const matchStatus = filterStatus === "all" || room.status === filterStatus;
    const matchSearch =
      !searchQuery.trim() ||
      room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.hotelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.comment && room.comment.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchHotel && matchStatus && matchSearch;
  });

  const countCleaned = rooms.filter((r) => r.status === "Убрано").length;
  const countNeedClean = rooms.filter((r) => r.status === "Не убрано").length;

  return (
    <div className="admin-page">
      <Adminbottom />

      <main className="admin-main">
        <header className="admin-top">
          <div>
            <h1>Контроль уборки и клининга</h1>
            <p>Мониторинг статуса номеров и спальных мест в режиме реального времени</p>
          </div>

          <div className="admin-profile">
            <div className="admin-profile-icon">
              <i className="fa-solid fa-user-shield"></i>
            </div>
            <div>
              <strong>{currentUser?.firstname || "Главный Админ"}</strong>
              <span>Главная панель (admin)</span>
            </div>
          </div>
        </header>

        <div className="admin-content">
          {/* Статистика для главного админа */}
          <div className="admin-stat-grid" style={{ marginBottom: "25px" }}>
            <div className="admin-stat-card">
              <div className="admin-stat-icon">
                <i className="fa-solid fa-building"></i>
              </div>
              <div>
                <span>Всего номеров/мест</span>
                <h3>{rooms.length}</h3>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon" style={{ background: "#dcfce7", color: "#16a34a" }}>
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <div>
                <span>Убрано (Чисто)</span>
                <h3>{countCleaned}</h3>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon" style={{ background: "#fee2e2", color: "#dc2626" }}>
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div>
                <span>Требует уборки</span>
                <h3>{countNeedClean}</h3>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}>
                <i className="fa-solid fa-percent"></i>
              </div>
              <div>
                <span>Чистота фонда</span>
                <h3>{rooms.length > 0 ? Math.round((countCleaned / rooms.length) * 100) : 0}%</h3>
              </div>
            </div>
          </div>

          {/* Секция таблицы номеров */}
          <div className="admin-section">
            <div
              className="admin-section-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "15px",
              }}
            >
              <div>
                <h2>Журнал клининга</h2>
                <p>Данные вносятся сотрудниками службы уборки (cleaning)</p>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                {/* Фильтр по отелю */}
                <select
                  className="form-select form-select-sm"
                  style={{ width: "auto" }}
                  value={selectedHotelId}
                  onChange={(e) => setSelectedHotelId(e.target.value)}
                >
                  <option value="all">Все отели и хостелы</option>
                  {hotels.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.namehotels} ({h.type === "hostel" ? "Хостел" : "Отель"})
                    </option>
                  ))}
                </select>

                {/* Фильтр по статусу */}
                <select
                  className="form-select form-select-sm"
                  style={{ width: "auto" }}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Все статусы</option>
                  <option value="Убрано">Только Убранные</option>
                  <option value="Не убрано">Требуют уборки</option>
                </select>

                {/* Поиск */}
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Поиск по номеру..."
                  style={{ width: "160px" }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={loadRooms}
                  title="Обновить данные клининга"
                >
                  <i className="fa-solid fa-arrows-rotate"></i>
                </button>
              </div>
            </div>

            {/* Таблица номеров */}
            <div className="admin-table">
              <div className="admin-table-head">
                <span>Номер / Место</span>
                <span>Отель / Хостел</span>
                <span>Статус уборки</span>
                <span>Кто убрал</span>
                <span>Время уборки</span>
                <span>Отчёт / Комментарий</span>
                <span>Действие</span>
              </div>

              {filteredRooms.map((room) => {
                const isCleaned = room.status === "Убрано";

                return (
                  <div className="admin-table-row" key={room.id}>
                    <div>
                      <strong style={{ fontSize: "16px" }}>{room.roomNumber}</strong>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        {room.placeType || "Стандарт"}
                      </div>
                    </div>

                    <div>
                      <strong>{room.hotelName}</strong>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        {room.hotelType === "hostel" ? "Хостел" : "Отель"}
                      </div>
                    </div>

                    <div>
                      <span
                        className="badge"
                        style={{
                          background: isCleaned ? "#dcfce7" : "#fee2e2",
                          color: isCleaned ? "#15803d" : "#b91c1c",
                          fontSize: "13px",
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontWeight: "700",
                        }}
                      >
                        <i
                          className={`fa-solid ${
                            isCleaned ? "fa-circle-check" : "fa-triangle-exclamation"
                          }`}
                          style={{ marginRight: "6px" }}
                        ></i>
                        {room.status}
                      </span>
                    </div>

                    <span>{room.cleanedBy || "—"}</span>

                    <span>{room.cleanedAt || "—"}</span>

                    <span style={{ fontSize: "13px", color: "#374151", maxWidth: "240px" }}>
                      {room.comment || "—"}
                    </span>

                    <div className="admin-order-buttons">
                      <button
                        className="btn btn-sm btn-outline-dark"
                        style={{ fontSize: "12px" }}
                        title="Изменить статус (Убрано / Не убрано)"
                        onClick={() => handleToggleStatus(room)}
                      >
                        <i className="fa-solid fa-repeat" style={{ marginRight: "4px" }}></i>
                        {isCleaned ? "На уборку" : "Подтвердить"}
                      </button>

                      <button
                        className="admin-delete-button"
                        title="Удалить номер"
                        onClick={() => handleDeleteRoom(room)}
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredRooms.length === 0 && (
                <div className="admin-table-row" style={{ justifyContent: "center", padding: "40px" }}>
                  <div style={{ textAlign: "center", color: "#6b7280" }}>
                    <i className="fa-solid fa-broom" style={{ fontSize: "36px", marginBottom: "10px" }}></i>
                    <p style={{ margin: 0, fontSize: "16px" }}>
                      Записей клининга по выбранным критериям не найдено.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Admincleaning;
