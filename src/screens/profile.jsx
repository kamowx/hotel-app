import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Bottomnav from "../components/bottomnav";

function Profile() {
  const navigate = useNavigate();
  const [darkTheme, setDarkTheme] = useState(
    localStorage.getItem("theme") === "dark",
  );
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const logout = () => {
    const adminId = localStorage.getItem("adminId");

    if (adminId) {
      localStorage.setItem("id", adminId);

      localStorage.removeItem("userId");

      alert("Вы вышли из аккаунта пользователя");

      navigate("/admin");
    } else {
      localStorage.removeItem("id");
      localStorage.removeItem("userId");

      alert("Вы вышли из аккаунта");

      navigate("/signin");
    }
  };
  useEffect(() => {
    const id = localStorage.getItem("id");

    if (!id) {
      navigate("/signin");
    }
  }, [navigate]);

  const allUser = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: "https://6ac221b73f4ae78f6944db9c.mockapi.io/data",
      });

      console.log("ВСЕ ДАННЫЕ:", response.data);

      if (response.status === 200) {
        setUsers(response.data);

        const id = localStorage.getItem("id");

        const currentUser = response.data.find(
          (item) => String(item.id) === String(id).replaceAll('"', ""),
        );

        console.log("НАЙДЕННЫЙ USER:", currentUser);

        if (currentUser) {
          setUser(currentUser);
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error("ОШИБКА ПОЛУЧЕНИЯ ПОЛЬЗОВАТЕЛЯ:", error);
    }
  };

  useEffect(() => {
    allUser();
  }, []);

  const returnToAdmin = () => {
    const adminId = localStorage.getItem("adminId");

    if (adminId) {
      localStorage.setItem("id", adminId);
      navigate("/admin");
    }
  };

  return (
    <div className={`app ${darkTheme ? "dark-theme" : ""}`}>
      <div className="onboarding home-onboarding">
        <div className="home-header">
          <Link to="/home" className="profile-back">
            <i className="fa-solid fa-arrow-left"></i>
          </Link>
        </div>

        <div className="profile-content">
          <div>
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

          <Link to="/adminsignin" className="i1">
            <p className="profile-subtitle">Управление вашим аккаунтом</p>
          </Link>

          <div className="profile-card">
            <div className="profile-row">
              <div className="profile-icon">
                <i className="fa-solid fa-user"></i>
              </div>

              <div>
                <span>Имя пользователя</span>

                <strong>
                  {user
                    ? `${user.firstname || ""} ${user.lastname || ""}`.trim()
                    : "Загрузка..."}
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
            <Link className="profile-action">
              <div className="profile-action-icon">
                <i className="fa-solid fa-dollar-sign"></i>
              </div>

              <div>
                <strong>
                  Счёт:
                  <i>
                    <h4 className="ii1">
                      <b>{user ? user.check : "Загрузка..."}сом</b>
                    </h4>
                  </i>{" "}
                </strong>
                <span>Мои денги</span>
              </div>
            </Link>
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

            <Link to="/support" className="profile-action">
              <div className="profile-action-icon">
                <i class="fa-solid fa-headset"></i>
              </div>

              <div>
                <strong>Служба поддержки</strong>
                <span>Помощь 24/7</span>
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

          {localStorage.getItem("adminId") && (
            <button className="profile-logout" onClick={returnToAdmin}>
              <i className="fa-solid fa-arrow-left"></i>
              Вернуться в админку
            </button>
          )}

          <button className="profile-logout" onClick={logout}>
            <i className="fa-solid fa-right-from-bracket"></i>
            Выйти из аккаунта
          </button>
        </div>

        <br />
        <br />

        <Bottomnav />
      </div>
    </div>
  );
}

export default Profile;
