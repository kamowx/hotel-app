import { useEffect, useState } from "react";
import Adminbottom from "../components/adminbottom";
import axios from "axios";

function Adminconfirmed() {
  const [users, setUsers] = useState([]);

  // GET пользователей
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

  useEffect(() => {
    getUsers();
  }, []);

  // Получаем все бронирования пользователей
  const allBookings = users.flatMap((user) =>
    Array.isArray(user.bookhotel)
      ? user.bookhotel.map((booking) => ({
          ...booking,
          userId: user.id,
        }))
      : [],
  );

  // Берём только подтверждённые
  const confirmedBookings = allBookings.filter(
    (item) => item.status == "Подтверждено",
  );

  // Перевести Подтверждено -> Активно
  const activateBooking = async (booking) => {
    try {
      const user = users.find(
        (item) => String(item.id) === String(booking.userId),
      );

      if (!user) {
        alert("Пользователь не найден");
        return;
      }

      const oldBookings = Array.isArray(user.bookhotel) ? user.bookhotel : [];

      const newBookings = oldBookings.map((item) => {
        if (
          String(item.hotelId) === String(booking.hotelId) &&
          item.date1 === booking.date1 &&
          item.date2 === booking.date2
        ) {
          return {
            ...item,
            status: "Активно",
          };
        }

        return item;
      });

      const response = await axios({
        method: "PUT",
        url: `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${booking.userId}`,
        data: {
          ...user,
          bookhotel: newBookings,
        },
      });

      console.log("PUT ACTIVATE BOOKING:", response);

      if (response.status === 200) {
        alert("Бронирование переведено в активные!");
        getUsers();
      }
    } catch (error) {
      console.error("ACTIVATE ERROR:", error);
      alert("Ошибка при изменении статуса");
    }
  };
  const checkUser = async () => {
    try {
      const id = JSON.parse(localStorage.getItem("id"));

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
      {/* SIDEBAR */}

      <Adminbottom />

      {/* MAIN */}

      <main className="admin-main">
        {/* TOP HEADER */}

        <header className="admin-top">
          <div>
            <h1>Подтвержденные</h1>

            <p>Список подтвержденных бронирований</p>
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

        {/* CONTENT */}

        <div className="admin-content">
          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <h2>Подтвержденные заказы</h2>

                <p>Бронирования, которые были подтверждены</p>
              </div>
            </div>

            {/* TABLE */}

            <div className="admin-table">
              <div className="admin-table-head">
                <span>Отель</span>
                <span>Город</span>
                <span>Заезд</span>
                <span>Гости</span>
                <span>Сумма</span>
                <span>Статус</span>
              </div>

              {/* ПОДТВЕРЖДЕННЫЕ ЗАКАЗЫ */}

              {confirmedBookings.map((item, index) => (
                <div className="admin-table-row" key={index}>
                  <div className="admin-hotel-name">
                    <div className="admin-hotel-icon">
                      <i className="fa-solid fa-hotel"></i>
                    </div>

                    <strong>{item.name}</strong>
                  </div>

                  <span>{item.city}</span>

                  <span>{item.date1}</span>

                  <span>{item.guests}</span>

                  <strong>{item.allprice} сом</strong>

                  <span className="admin-status confirmed">{item.status}</span>

                  <button
                    className="admin-confirm-button"
                    onClick={() => activateBooking(item)}
                  >
                    <i className="fa-solid fa-check"></i>
                    Активировать
                  </button>
                </div>
              ))}

              {/* ЕСЛИ НЕТ ЗАКАЗОВ */}

              {confirmedBookings.length === 0 && (
                <div className="admin-table-row">
                  <span>Подтвержденных заказов пока нет</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Adminconfirmed;
