import { useEffect, useState } from "react";
import Adminbottom from "../components/adminbottom";
import axios from "axios";

function Adminactive() {
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

    const interval = setInterval(() => {
      getUsers();
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const allBookings = users.flatMap((user) =>
    Array.isArray(user.bookhotel)
      ? user.bookhotel.map((booking) => ({
          ...booking,
          userId: user.id,
        }))
      : [],
  );

  const activeBookings = allBookings.filter((item) => item.status == "Активно");

  useEffect(() => {
    const checkBookings = async () => {
      const now = new Date();

      for (const user of users) {
        if (!Array.isArray(user.bookhotel)) {
          continue;
        }

        let changed = false;

        const newBookings = user.bookhotel.map((booking) => {
          if (booking.status != "Активно") {
            return booking;
          }

          if (!booking.date2) {
            return booking;
          }

          const checkoutDate = new Date(booking.date2);

          checkoutDate.setHours(23, 59, 59, 999);

          if (now > checkoutDate) {
            changed = true;

            return {
              ...booking,
              status: "Завершено",
            };
          }

          return booking;
        });

        if (changed) {
          try {
            const response = await axios({
              method: "PUT",
              url: `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${user.id}`,
              data: {
                ...user,
                bookhotel: newBookings,
              },
            });

            console.log("PUT FINISHED BOOKING:", response);
          } catch (error) {
            console.error("PUT FINISHED ERROR:", error);
          }
        }
      }

      getUsers();
    };

    if (users.length > 0) {
      checkBookings();
    }
  }, [users]);

  const getCheckoutText = (date2) => {
    if (!date2) {
      return "";
    }

    const now = new Date();

    const checkoutDate = new Date(date2);
    checkoutDate.setHours(23, 59, 59, 999);

    const difference = checkoutDate - now;

    if (difference <= 0) {
      return "Выезд сегодня";
    }

    const days = Math.ceil(difference / (1000 * 60 * 60 * 24));

    if (days === 1) {
      return "Остался 1 день до выезда";
    }

    return `Осталось ${days} дней до выезда`;
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
            <h1>Активные</h1>

            <p>Список активных бронирований</p>
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
                <h2>Активные бронирования</h2>

                <p>Гости, которые сейчас проживают в отеле</p>
              </div>
            </div>


            <div className="admin-table">
              <div className="admin-table-head">
                <span>Отель</span>
                <span>Город</span>
                <span>Заезд</span>
                <span>Гости</span>
                <span>Сумма</span>
                <span>Статус</span>
              </div>


              {activeBookings.map((item, index) => (
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

                  <span className="admin-status active">{item.status}</span>


                  <small>
                    <i className="fa-solid fa-calendar-days"></i>{" "}
                    {getCheckoutText(item.date2)}
                  </small>
                </div>
              ))}


              {activeBookings.length === 0 && (
                <div className="admin-table-row">
                  <span>Активных бронирований пока нет</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Adminactive;
