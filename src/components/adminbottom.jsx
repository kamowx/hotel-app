import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Adminbottom() {
  const [newOrders, setNewOrders] = useState(0);

  const getUsers = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: "https://6ac221b73f4ae78f6944db9c.mockapi.io/data",
      });

      console.log("GET USERS:", response);

      if (response.status === 200) {
        const allBookings = response.data.flatMap((user) =>
          Array.isArray(user.bookhotel) ? user.bookhotel : [],
        );

        const newBookings = allBookings.filter(
          (item) => item.status == "Новый",
        );

        setNewOrders(newBookings.length);
      }
    } catch (error) {
      console.error("GET USERS ERROR:", error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div>
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <span>FirstHotel</span>
        </div>

        <div className="admin-menu">
          <Link to="/admin" className="admin-menu-item">
            <i className="fa-solid fa-house"></i>
            <span>Главная</span>
          </Link>

          <Link to="/adminneworders" className="admin-menu-item">
            <i className="fa-solid fa-bell"></i>
            <span>Новые заказы</span>

            <b>{newOrders}</b>
          </Link>

          <Link to="/adminconfirmed" className="admin-menu-item">
            <i className="fa-solid fa-circle-check"></i>
            <span>Подтвержденные</span>
          </Link>

          <Link to="/adminactive" className="admin-menu-item">
            <i className="fa-solid fa-key"></i>
            <span>Активные</span>
          </Link>

          <Link to="/admincompleted" className="admin-menu-item">
            <i className="fa-solid fa-flag-checkered"></i>
            <span>Завершенные</span>
          </Link>

          <Link to="/adminhotels" className="admin-menu-item">
            <i className="fa-solid fa-hotel"></i>
            <span>Отели</span>
          </Link>
        </div>

        <div className="admin-sidebar-bottom">
          <button className="admin-menu-item">
            <span>Здравствуйте!</span>
          </button>
        </div>
      </aside>
    </div>
  );
}

export default Adminbottom;
