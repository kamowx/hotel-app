import { useEffect, useState } from "react";
import Adminbottom from "../components/adminbottom";
import axios from "axios";

function Admincompleted() {
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

  const completedBookings = allBookings.filter(
    (item) => item.status == "Завершено",
  );
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

            <div className="admin-table">
              <div className="admin-table-head">
                <span>Отель</span>
                <span>Город</span>
                <span>Заезд</span>
                <span>Гости</span>
                <span>Сумма</span>
                <span>Статус</span>
              </div>

              {completedBookings.map((item, index) => (
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

                  <span className="admin-status completed">{item.status}</span>
                </div>
              ))}

              {completedBookings.length === 0 && (
                <div className="admin-table-row">
                  <span>Завершенных бронирований пока нет</span>
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
/*hotel*/
