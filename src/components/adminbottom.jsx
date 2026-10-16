import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Adminbottom() {
  const navigate = useNavigate();

  const [newOrders, setNewOrders] = useState(0);

  // GET Users
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
          (item) => item.status === "Новый",
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

  const logout1 = () => {
    const userId = localStorage.getItem("userId");

    if (userId) {
      localStorage.setItem("id", userId);

      localStorage.removeItem("adminId");

      alert("Вы вышли из аккаунта пользователя");

      navigate("/profile");
    } else {
      localStorage.removeItem("id");
      localStorage.removeItem("adminId");

      alert("Вы вышли из аккаунта");

      navigate("/signin");
    }
  };

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
          <Link to="/adminuser" className="admin-menu-item">
            <i class="fa-solid fa-person"></i>
            <span>Пользователи</span>
          </Link>
        </div>

        <div className="admin-sidebar-bottom">
          <button className="admin-menu-item">
            <span>Здравствуйте!</span>
            <br />

            <span onClick={logout1}>
              <b>Выйти</b>
            </span>
          </button>
        </div>
      </aside>
    </div>
  );
}

export default Adminbottom;
