import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const USERS_URL = "https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data";
const HOTELS_URL = "https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/hotels";

function Padmin() {
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [filterType, setFilterType] = useState("all");
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
      const currentResponse = await axios.get(`${USERS_URL}/${id}`);

      if (currentResponse.data.userstatus !== "padmin") {
        if (currentResponse.data.userstatus === "cleaning") {
          navigate("/cleaning", { replace: true });
        } else {
          navigate("/staffsignin", { replace: true });
        }
        return;
      }

      const [usersResponse, hotelsResponse] = await Promise.all([
        axios.get(USERS_URL),
        axios.get(HOTELS_URL),
      ]);

      setUsers(usersResponse.data);
      setHotels(hotelsResponse.data);
    } catch (error) {
      console.error(error);
      alert("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const getHotel = (booking) =>
    hotels.find((hotel) => String(hotel.id) === String(booking.hotelId));

  const getBookingType = (booking) => {
    const hotel = getHotel(booking);

    const type = String(
      booking.type ||
        booking.hotelType ||
        hotel?.type ||
        hotel?.hotelType ||
        "",
    ).toLowerCase();

    if (type.includes("hostel") || type.includes("хостел")) return "hostel";
    if (type.includes("hotel") || type.includes("отель")) return "hotel";

    const name = String(
      booking.namehotels || booking.hotelName || hotel?.namehotels || "",
    ).toLowerCase();

    return name.includes("хостел") || name.includes("hostel")
      ? "hostel"
      : "hotel";
  };

  const allBookings = users.flatMap((user) =>
    Array.isArray(user.bookhotel)
      ? user.bookhotel.map((booking, bookingIndex) => ({
          ...booking,
          userId: user.id,
          userName:
            user.name ||
            user.namesigin ||
            user.nameuser ||
            user.username ||
            "—",
          userEmail: user.email || user.emailsigin || user.emailuser || "—",
          userPhone: user.phone || user.phoneuser || "—",
          bookingIndex,
        }))
      : [],
  );

  const filteredBookings = allBookings.filter(
    (booking) => filterType === "all" || getBookingType(booking) === filterType,
  );

  const changeStatus = async (booking, status) => {
    try {
      const response = await axios.get(`${USERS_URL}/${booking.userId}`);
      const user = response.data;
      const updatedBookings = [...(user.bookhotel || [])];

      if (!updatedBookings[booking.bookingIndex]) {
        alert("Бронирование не найдено");
        return;
      }

      updatedBookings[booking.bookingIndex] = {
        ...updatedBookings[booking.bookingIndex],
        status,
      };

      await axios.put(`${USERS_URL}/${booking.userId}`, {
        ...user,
        bookhotel: updatedBookings,
      });

      await getData();
    } catch (error) {
      console.error(error);
      alert("Не удалось изменить статус");
    }
  };

  const logout = () => {
    localStorage.removeItem("id");
    navigate("/staffsignin", { replace: true });
  };

  const getAction = (booking) => {
    if (booking.status === "Новый") {
      return (
        <button
          className="staff-table-action"
          onClick={() => changeStatus(booking, "Подтверждено")}
        >
          Подтвердить
        </button>
      );
    }

    if (booking.status === "Подтверждено") {
      return (
        <button
          className="staff-table-action"
          onClick={() => changeStatus(booking, "Активно")}
        >
          Активировать
        </button>
      );
    }

    if (booking.status === "Активно") {
      return (
        <button
          className="staff-table-action"
          onClick={() => changeStatus(booking, "Завершено")}
        >
          Завершить
        </button>
      );
    }

    return "—";
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
          <i className="fa-solid fa-calendar-check"></i>
          Бронирования
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
            <h1>Управление бронированиями</h1>
          </div>

          <div className="staff-admin-user">
            <span className="staff-admin-avatar">P</span>
            <div>
              <b>Сотрудник</b>
              <span>Padmin</span>
            </div>
          </div>
        </header>

        <section className="staff-admin-content">
          <div className="staff-stat-row">
            <div className="staff-stat-card">
              <span>Всего бронирований</span>
              <h2>{allBookings.length}</h2>
            </div>
            <div className="staff-stat-card">
              <span>Новые</span>
              <h2>{allBookings.filter((b) => b.status === "Новый").length}</h2>
            </div>
            <div className="staff-stat-card">
              <span>Активные</span>
              <h2>
                {allBookings.filter((b) => b.status === "Активно").length}
              </h2>
            </div>
            <div className="staff-stat-card">
              <span>Завершённые</span>
              <h2>
                {allBookings.filter((b) => b.status === "Завершено").length}
              </h2>
            </div>
          </div>

          <div className="staff-admin-panel">
            <div className="staff-panel-heading">
              <div>
                <h2>Список бронирований</h2>
                <p>Проверяйте заявки и обновляйте их статус</p>
              </div>

              <div className="staff-panel-filters">
                <button
                  className={filterType === "all" ? "active" : ""}
                  onClick={() => setFilterType("all")}
                >
                  Все
                </button>
                <button
                  className={filterType === "hotel" ? "active" : ""}
                  onClick={() => setFilterType("hotel")}
                >
                  Отели
                </button>
                <button
                  className={filterType === "hostel" ? "active" : ""}
                  onClick={() => setFilterType("hostel")}
                >
                  Хостелы
                </button>
              </div>
            </div>

            {loading ? (
              <p className="staff-table-empty">Загрузка...</p>
            ) : filteredBookings.length === 0 ? (
              <p className="staff-table-empty">Бронирований пока нет</p>
            ) : (
              <div className="staff-table-scroll">
                <table className="staff-admin-table">
                  <thead>
                    <tr>
                      <th>ОТЕЛЬ</th>
                      <th>КЛИЕНТ</th>
                      <th>КОНТАКТЫ</th>
                      <th>ДАТЫ</th>
                      <th>СУММА</th>
                      <th>СТАТУС</th>
                      <th>ДЕЙСТВИЕ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking, index) => {
                      const hotel = getHotel(booking);

                      return (
                        <tr
                          key={`${booking.userId}-${booking.bookingIndex}-${index}`}
                        >
                          <td>
                            <b>
                              {booking.namehotels ||
                                booking.hotelName ||
                                hotel?.namehotels ||
                                "Отель"}
                            </b>
                            <span className="staff-table-subtext">
                              {booking.location || hotel?.location || "—"}
                            </span>
                          </td>
                          <td>{booking.userName}</td>
                          <td>
                            {booking.userEmail}
                            <span className="staff-table-subtext">
                              {booking.userPhone}
                            </span>
                          </td>
                          <td>
                            {booking.date1 || "—"}
                            <span className="staff-table-subtext">
                              {booking.date2 || "—"}
                            </span>
                          </td>
                          <td>
                            {booking.allprice ??
                              booking.totalPrice ??
                              booking.price ??
                              "—"}{" "}
                            сом
                          </td>
                          <td>
                            <span className="staff-table-status">
                              {booking.status || "Новый"}
                            </span>
                          </td>
                          <td>{getAction(booking)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Padmin;
