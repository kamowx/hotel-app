import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Bottomnav from "../components/bottomnav";

function Profile() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);

  const logout = () => {
    localStorage.removeItem("id");
    alert("Вы вышли из аккаунта");
    navigate("/signin");
  };

  useEffect(() => {
    const id = localStorage.getItem("id");

    if (!id) {
      navigate("/signin");
    }
  }, []);

  // Получения getItem
  const allUser = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: "https://6ac221b73f4ae78f6944db9c.mockapi.io/data",
      });

      console.log("ВСЕ ДАННЫЕ:", response.data);

      if (response.status === 200) {
        const id = localStorage.getItem("id");

        response.data.forEach((item) => {
          console.log("ID пользователя:", item.id);
          console.log("Email пользователя:", item.email);
        });

        const currentUser = response.data.find(
          (item) => String(item.id) === String(id).replaceAll('"', ""),
        );

        console.log("НАЙДЕННЫЙ USER:", currentUser);

        if (currentUser) {
          setUser(currentUser);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    allUser();
  }, []);

  return (
    <div className="app">
      <div className="onboarding profile-page">
        {/* HEADER */}
        <div className="profile-header">
          <Link to="/home" className="profile-back">
            <i className="fa-solid fa-arrow-left"></i>
          </Link>

          <div className="logo-text">FirstHotel</div>
        </div>

        <div className="profile-content">
          <div className="">
            {user && user.avatar ? (
              <img
                src={user.avatar}
                alt="Фото пользователя"
                className="profile-avatar"
              />
            ) : (
              <i className="fa-solid fa-user"></i>
            )}
          </div>

          <h1>Мой профиль</h1>

          <p className="profile-subtitle">Управление вашим аккаунтом</p>

          <div className="profile-card">
            <div className="profile-row">
              <div className="profile-icon">
                <i className="fa-solid fa-user"></i>
              </div>

              <div>
                <span>Имя пользователя</span>

                <strong>
                  {user ? `${user.firstname} ${user.lastname}` : "Загрузка..."}
                </strong>
              </div>
            </div>

            <div className="profile-row">
              <div className="profile-icon">
                <i className="fa-solid fa-envelope"></i>
              </div>

              <div>
                <span>Email</span>

                <strong>{user ? user.email : "Загрузка..."}</strong>
              </div>
            </div>

            <div className="profile-row">
              <div className="profile-icon">
                <i className="fa-solid fa-phone"></i>
              </div>

              <div>
                <span>Телефон</span>

                <strong>{user ? user.numberphone : "Загрузка..."}</strong>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <Link to="/armored" className="profile-action">
              <div className="profile-action-icon">
                <i className="fa-solid fa-calendar-check"></i>
              </div>

              <div>
                <strong>Мои бронирования</strong>
                <span>Посмотреть забронированные отели</span>
              </div>

              <i className="fa-solid fa-chevron-right"></i>
            </Link>

            <Link to="/favorites" className="profile-action">
              <div className="profile-action-icon">
                <i className="fa-solid fa-heart"></i>
              </div>

              <div>
                <strong>Избранное</strong>
                <span>Сохранённые отели</span>
              </div>

              <i className="fa-solid fa-chevron-right"></i>
            </Link>
          </div>

          <Link to="/editprofile" className="text-decoration-none">
            <button className="profile-logout">
              <i className="fa-solid fa-pen"></i>
              Редактировать
            </button>
          </Link>

          {/* ВЫХОД */}
          <button className="profile-logout" onClick={logout}>
            <i className="fa-solid fa-right-from-bracket"></i>
            Выйти из аккаунта
          </button>
        </div>

        {/* НИЖНЯЯ НАВИГАЦИЯ */}
        <Bottomnav />
      </div>
    </div>
  );
}

export default Profile;
