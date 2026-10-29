import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const USERS_URL = "https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data";
const HOTELS_URL = "https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/hotels";

function Cleaning() {
  const [employee, setEmployee] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getData = async () => {
    try {
      const savedId = localStorage.getItem("id");

      if (!savedId) {
        navigate("/staffsignin", { replace: true });
        return;
      }

      const id = String(savedId).replaceAll('"', "");
      const userResponse = await axios.get(`${USERS_URL}/${id}`);
      const currentEmployee = userResponse.data;

      if (currentEmployee.userstatus !== "cleaning") {
        if (currentEmployee.userstatus === "padmin") {
          navigate("/padmin", { replace: true });
        } else {
          navigate("/staffsignin", { replace: true });
        }
        return;
      }

      const hotelResponse = await axios.get(HOTELS_URL);
      const assignedIds = Array.isArray(currentEmployee.cleaningHotelIds)
        ? currentEmployee.cleaningHotelIds.map(String)
        : [];

      setEmployee(currentEmployee);
      setHotels(
        hotelResponse.data.filter((hotel) =>
          assignedIds.includes(String(hotel.id)),
        ),
      );
    } catch (error) {
      console.error(error);
      alert("Не удалось загрузить отели");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const changeStatus = async (hotel, status) => {
    try {
      const updatedHotel = {
        ...hotel,
        cleaningStatus: status,
        cleaningUpdatedAt: new Date().toLocaleString("ru-RU"),
        cleaningEmployeeId: employee.id,
      };

      await axios.put(`${HOTELS_URL}/${hotel.id}`, updatedHotel);

      setHotels((previous) =>
        previous.map((item) =>
          String(item.id) === String(hotel.id) ? updatedHotel : item,
        ),
      );
    } catch (error) {
      console.error(error);
      alert("Не удалось сохранить статус уборки");
    }
  };

  const logout = () => {
    localStorage.removeItem("id");
    navigate("/staffsignin", { replace: true });
  };

  return (
    <div className="staff-admin-page">
      <aside className="staff-sidebar">
        <div className="staff-sidebar-logo">
          <span className="staff-logo-icon">
            <span></span>
            <span></span>
            <span></span>
          </span>
          FirstHotel
        </div>

        <div className="staff-sidebar-label">РАБОЧЕЕ МЕНЮ</div>

        <button className="staff-sidebar-link active">
          <i className="fa-solid fa-broom"></i>
          Уборка
        </button>

        <button className="staff-sidebar-link" onClick={logout}>
          <i className="fa-solid fa-right-from-bracket"></i>
          Выйти
        </button>
      </aside>

      <main className="staff-admin-main">
        <header className="staff-admin-header">
          <div>
            <p>FirstHotel / Персонал</p>
            <h1>Назначенные отели</h1>
          </div>

          <div className="staff-admin-user">
            <span className="staff-admin-avatar">
              <i className="fa-solid fa-broom"></i>
            </span>
            <div>
              <b>
                {employee?.name ||
                  employee?.namesigin ||
                  employee?.nameuser ||
                  "Сотрудник"}
              </b>
              <span>Уборщик</span>
            </div>
          </div>
        </header>

        <section className="staff-admin-content">
          <div className="staff-panel-heading staff-cleaning-heading">
            <div>
              <h2>Список отелей</h2>
              <p>Отмечайте состояние уборки назначенных объектов</p>
            </div>

            <span className="staff-cleaning-count">Всего: {hotels.length}</span>
          </div>

          {loading ? (
            <p className="staff-table-empty">Загрузка...</p>
          ) : hotels.length === 0 ? (
            <div className="staff-admin-panel staff-table-empty">
              Вам пока не назначили отели
            </div>
          ) : (
            <div className="staff-cleaning-grid">
              {hotels.map((hotel) => (
                <div className="staff-cleaning-card" key={hotel.id}>
                  {hotel.avatarhotels ? (
                    <img
                      src={hotel.avatarhotels}
                      alt={hotel.namehotels || "Отель"}
                    />
                  ) : (
                    <div className="staff-cleaning-placeholder">
                      <i className="fa-solid fa-hotel"></i>
                    </div>
                  )}

                  <div className="staff-cleaning-card-content">
                    <div className="staff-cleaning-title">
                      <div>
                        <h3>{hotel.namehotels || "Отель / хостел"}</h3>
                        <p>{hotel.location || "Город не указан"}</p>
                      </div>

                      <span
                        className={
                          hotel.cleaningStatus === "Убрано"
                            ? "staff-clean-status done"
                            : "staff-clean-status"
                        }
                      >
                        {hotel.cleaningStatus || "Не убрано"}
                      </span>
                    </div>

                    <p className="staff-cleaning-room">
                      <i className="fa-solid fa-door-open"></i>
                      Номер / место:{" "}
                      {hotel.room ||
                        hotel.roomNumber ||
                        hotel.bed ||
                        "Не указано"}
                    </p>

                    <p className="staff-cleaning-updated">
                      Последнее обновление: {hotel.cleaningUpdatedAt || "—"}
                    </p>

                    <div className="staff-cleaning-buttons">
                      <button
                        className="staff-table-action"
                        onClick={() => changeStatus(hotel, "Убрано")}
                      >
                        <i className="fa-solid fa-check"></i> Убрано
                      </button>

                      <button
                        className="staff-cleaning-not-done"
                        onClick={() => changeStatus(hotel, "Не убрано")}
                      >
                        Не убрано
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Cleaning;
