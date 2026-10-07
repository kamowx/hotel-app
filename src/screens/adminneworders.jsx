import { useEffect, useState } from "react";
import Adminbottom from "../components/adminbottom";
import axios from "axios";

function Adminneworders() {
  const [users, setUsers] = useState([]);


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


  const allBookings = users.flatMap((user) =>
    Array.isArray(user.bookhotel)
      ? user.bookhotel.map((booking) => ({
          ...booking,
          userId: user.id,
        }))
      : [],
  );


  const newBookings = allBookings.filter((item) => item.status == "Новый");


  const confirmBooking = async (booking) => {
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
            status: "Подтверждено",
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

      console.log("PUT CONFIRM BOOKING:", response);

      if (response.status === 200) {
        alert("Бронирование подтверждено!");

        getUsers();
      }
    } catch (error) {
      console.error("CONFIRM ERROR:", error);

      alert("Ошибка при подтверждении бронирования");
    }
  };


  const deleteBooking = async (booking) => {
    try {
      const user = users.find(
        (item) => String(item.id) === String(booking.userId),
      );

      if (!user) {
        alert("Пользователь не найден");
        return;
      }

      const oldBookings = Array.isArray(user.bookhotel) ? user.bookhotel : [];

      const newBookings = oldBookings.filter(
        (item) =>
          !(
            String(item.hotelId) === String(booking.hotelId) &&
            item.date1 === booking.date1 &&
            item.date2 === booking.date2
          ),
      );

      const response = await axios({
        method: "PUT",
        url: `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${booking.userId}`,
        data: {
          ...user,
          bookhotel: newBookings,
        },
      });

      console.log("PUT DELETE BOOKING:", response);

      if (response.status === 200) {
        alert("Бронирование удалено!");

        getUsers();
      }
    } catch (error) {
      console.error("DELETE BOOKING ERROR:", error);

      alert("Ошибка при удалении бронирования");
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

      <Adminbottom />


      <main className="admin-main">

        <header className="admin-top">
          <div>
            <h1>Новые заказы</h1>

            <p>Список новых бронирований</p>
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
                <h2>Новые заказы</h2>

                <p>Заказы, которые ожидают подтверждения</p>
              </div>
            </div>


            <div className="admin-table">
              <div className="admin-table-head">
                <span>Отель</span>

                <span>Город</span>

                <span>Заезд</span>

                <span>Гости</span>

                <span>Сумма</span>

                <span>Действие</span>
              </div>


              {newBookings.map((item, index) => (
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

                  <div className="admin-order-buttons">
                    <button
                      className="admin-confirm-button"
                      onClick={() => confirmBooking(item)}
                    >
                      <i className="fa-solid fa-check"></i>
                      Подтвердить
                    </button>

                    <button
                      className="admin-delete-button"
                      onClick={() => deleteBooking(item)}
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                </div>
              ))}


              {newBookings.length === 0 && (
                <div className="admin-table-row">
                  <span>Новых заказов пока нет</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Adminneworders;
