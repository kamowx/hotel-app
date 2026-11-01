import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Bottomnav from "../components/bottomnav";

const USERS_URL = "https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data";

function Armored() {
  const navigate = useNavigate();

  const [darkTheme, setDarkTheme] = useState(
    localStorage.getItem("theme") === "dark",
  );

  const [bookings, setBookings] = useState([]);

  const getBookings = async () => {
    try {
      const uid = String(localStorage.getItem("uid") || "").replaceAll('"', "");

      if (!uid) {
        navigate("/signin");
        return;
      }

      // Получаем всех пользователей
      const response = await axios.get(USERS_URL);

      // Находим пользователя по Firebase uid
      const currentUser = response.data.find(
        (item) => String(item.uid) === uid,
      );

      if (!currentUser) {
        console.log("Пользователь не найден. Firebase uid:", uid);
        setBookings([]);
        return;
      }

      console.log("Найденный пользователь:", currentUser);
      console.log("Бронирования:", currentUser.bookhotel);

      if (Array.isArray(currentUser.bookhotel)) {
        setBookings(currentUser.bookhotel);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Ошибка при получении бронирований:", error);
    }
  };

  useEffect(() => {
    const uid = localStorage.getItem("uid");

    if (!uid) {
      navigate("/signin");
      return;
    }

    getBookings();
  }, []);

  const removeBooking = async (hotelId) => {
    try {
      const uid = String(localStorage.getItem("uid") || "").replaceAll('"', "");

      if (!uid) {
        navigate("/signin");
        return;
      }

      // Получаем всех пользователей
      const userResponse = await axios.get(USERS_URL);

      // Ищем пользователя по Firebase uid
      const currentUser = userResponse.data.find(
        (item) => String(item.uid) === uid,
      );

      if (!currentUser) {
        alert("Пользователь не найден!");
        return;
      }

      const oldBookings = Array.isArray(currentUser.bookhotel)
        ? currentUser.bookhotel
        : [];

      const newBookings = oldBookings.filter(
        (item) => String(item.hotelId) !== String(hotelId),
      );

      // Обновляем по настоящему ID записи MockAPI
      const response = await axios.put(`${USERS_URL}/${currentUser.id}`, {
        ...currentUser,
        bookhotel: newBookings,
      });

      if (response.status === 200) {
        setBookings(newBookings);
        alert("Бронирование отменено!");
      }
    } catch (error) {
      console.error("Ошибка при отмене бронирования:", error);
    }
  };

  return (
    <div className={`app ${darkTheme ? "dark-theme" : ""}`}>
      <div className="hotel-page">
        <div className="mobile-app">
          <div className="page-content">
            <div className="mb-4">
              <h2 className="mb-1">Мои бронирования</h2>

              <p className="text-secondary mb-0">
                Список забронированных отелей и хостелов
              </p>
            </div>

            {bookings.length === 0 ? (
              <p className="text-secondary">Пока нет бронирований</p>
            ) : (
              bookings.map((item, index) => (
                <div
                  className="hotel-card mb-3"
                  key={item.id || `${item.hotelId}-${index}`}
                >
                  <div className="hotel-card-image">
                    {item.avatarhotels ? (
                      <img src={item.avatarhotels} alt={item.name} />
                    ) : (
                      <i className="fa-solid fa-hotel"></i>
                    )}
                  </div>

                  <div className="p-3">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "8px",
                      }}
                    >
                      <h5>{item.name}</h5>

                      <span
                        className={`admin-type-tag ${item.type || "hotel"}`}
                      >
                        {item.type === "hostel" ? "Хостел" : "Отель"}
                      </span>
                    </div>

                    <p className="text-secondary mb-2">
                      <i className="fa-solid fa-location-dot me-1"></i>
                      {item.city}
                    </p>

                    {item.place ? (
                      <p
                        className="mb-1"
                        style={{ color: "#2e7d32", fontWeight: 700 }}
                      >
                        <i
                          className={
                            item.type === "hostel"
                              ? "fa-solid fa-bed me-1"
                              : "fa-solid fa-door-closed me-1"
                          }
                        ></i>

                        {item.type === "hostel"
                          ? `Место ${item.place}`
                          : `Номер комнаты: ${item.place}`}
                      </p>
                    ) : null}

                    <p className="mb-1">
                      <b>Цена:</b> {item.price} сом / ночь
                    </p>

                    {item.forpriceday ? (
                      <p className="mb-1">
                        <b>Дней:</b> {item.forpriceday}
                      </p>
                    ) : null}

                    {item.allprice != null ? (
                      <p className="mb-1">
                        <b>Общая сумма:</b> {item.allprice} сом
                      </p>
                    ) : null}

                    <p className="mb-1">
                      <b>Заезд:</b> {item.date1}
                    </p>

                    <p className="mb-1">
                      <b>Выезд:</b> {item.date2}
                    </p>

                    <p className="mb-3">
                      <b>Статус:</b> {item.status}
                    </p>

                    <div className="hotel-card-buttons">
                      <Link
                        className="hotel-details-button"
                        to={`/armhotels/${index}`}
                      >
                        Подробнее
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Bottomnav />
        </div>
      </div>
    </div>
  );
}

export default Armored;
