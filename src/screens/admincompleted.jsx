import { useEffect, useState } from "react";
import Adminbottom from "../components/adminbottom";
import axios from "axios";

function Admincompleted() {
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [filterType, setFilterType] = useState("all"); // "all", "hotel", "hostel"

  const getUsers = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: "https://6ac221b73f4ae78f6944db9c.mockapi.io/data",
      });

      console.log("GET USERS:", response);

      if (response.status === 200) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("GET USERS ERROR:", error);
    }
  };

  const getHotels = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: "https://6ac221b73f4ae78f6944db9c.mockapi.io/hotels",
      });

      if (response.status === 200) {
        setHotels(response.data);
      }
    } catch (error) {
      console.error("GET HOTELS ERROR:", error);
    }
  };

  useEffect(() => {
    getUsers();
    getHotels();
  }, []);

  const getBookingType = (booking) => {
    if (booking.type) {
      return String(booking.type).toLowerCase();
    }
    if (booking.hotelType) {
      return String(booking.hotelType).toLowerCase();
    }
    const hotel = hotels.find((h) => String(h.id) === String(booking.hotelId));
    if (hotel && hotel.type) {
      return String(hotel.type).toLowerCase();
    }
    const name = String(booking.name || "").toLowerCase();
    if (name.includes("hostel") || name.includes("хостел")) {
      return "hostel";
    }
    return "hotel";
  };

  const allBookings = users.flatMap((user) =>
    Array.isArray(user.bookhotel)
      ? user.bookhotel.map((booking) => ({
          ...booking,
          userId: user.id,
        }))
      : [],
  );

  const completedBookings = allBookings.filter(
    (item) => item.status == "Завершено",
  );

  const filteredBookings = completedBookings.filter((item) => {
    if (filterType === "all") return true;
    return getBookingType(item) === filterType.toLowerCase();
  });

  const checkUser = async () => {
    try {
      const savedId = localStorage.getItem("id");

      if (!savedId) {
        window.location.href = "/signin";
        return;
      }

      const id = String(savedId).replaceAll('"', "");

      const response = await axios({
        method: "GET",
        url: `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${id}`,
      });

      if (response.status === 200) {
        const user = response.data;

        if (user.userstatus == "user") {
          window.location.href = "/home";
        }

        if (user.userstatus == "admin") {
          console.log("Это администратор");
        }
      }
    } catch (error) {
      console.error("CHECK USER ERROR:", error);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  return (
    <div className="admin-page">
      <Adminbottom />

      <main className="admin-main">
        <header className="admin-top">
          <div>
            <h1>Завершенные</h1>
            <p>Список завершенных бронирований</p>
          </div>

          <div className="admin-profile">
            <div className="admin-profile-icon">
              <i className="fa-solid fa-user"></i>
            </div>

            <div>
              <strong>Администратор</strong>
              <span>Панель управления</span>
            </div>
          </div>
        </header>

        <div className="admin-content">
          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <h2>Завершенные бронирования</h2>
                <p>Бронирования, которые уже завершились</p>
              </div>
            </div>

            {/* 3 кнопки фильтрации: ВСЕ, hotel, hostel */}
            <div className="admin-filter-bar">
              <button
                type="button"
                className={`admin-filter-btn ${filterType === "all" ? "active" : ""}`}
                onClick={() => setFilterType("all")}
              >
                ВСЕ
              </button>
              <button
                type="button"
                className={`admin-filter-btn ${filterType === "hotel" ? "active" : ""}`}
                onClick={() => setFilterType("hotel")}
              >
                hotel
              </button>
              <button
                type="button"
                className={`admin-filter-btn ${filterType === "hostel" ? "active" : ""}`}
                onClick={() => setFilterType("hostel")}
              >
                hostel
              </button>
            </div>

            <div className="admin-table">
              <div className="admin-table-head">
                <span>Отель / Хостел</span>
                <span>Номер тел.</span>
                <span>Email</span>
                <span>Имя-Фамилия</span>
                <span>Город</span>
                <span>Заезд</span>
                <span>Гости / Место</span>
                <span>Сумма</span>
                <span>Статус</span>
              </div>

              {filteredBookings.map((item, index) => (
                <div className="admin-table-row" key={index}>
                  <div className="admin-hotel-name">
                    <div className="admin-hotel-icon">
                      <i
                        className={
                          getBookingType(item) === "hostel"
                            ? "fa-solid fa-bed"
                            : "fa-solid fa-hotel"
                        }
                      ></i>
                    </div>

                    <div>
                      <strong>{item.name}</strong>
                      <div
                        style={{
                          display: "flex",
                          gap: "5px",
                          marginTop: "4px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          className={`admin-type-tag ${getBookingType(item)}`}
                        >
                          {getBookingType(item)}
                        </span>
                        {item.place ? (
                          <span className="admin-place-tag">
                            {getBookingType(item) === "hostel"
                              ? `Место ${item.place}`
                              : `Номер ${item.place}`}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <span>
                    <b>{item.numberphone}</b>
                  </span>

                  <span>
                    <b>{item.email}</b>
                  </span>

                  <span>
                    <b>
                      {item.firstname}-{item.lastname}
                    </b>
                  </span>

                  <span>{item.city}</span>

                  <span>{item.date1}</span>

                  <span>
                    {item.place
                      ? getBookingType(item) === "hostel"
                        ? `Место ${item.place}`
                        : `№ ${item.place}`
                      : `${item.guests} гостей`}
                  </span>

                  <strong>{item.allprice} сом</strong>

                  <span className="admin-status completed">{item.status}</span>
                </div>
              ))}

              {filteredBookings.length === 0 && (
                <div className="admin-table-row" style={{ padding: "20px 14px" }}>
                  <span>
                    {filterType === "all"
                      ? "Завершенных бронирований пока нет"
                      : `Завершенных бронирований в категории "${filterType.toUpperCase()}" пока нет`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Admincompleted;
