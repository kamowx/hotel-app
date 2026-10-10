import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Bottomnav from "../components/bottomnav";

function Profile() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [password2signin, setPassword2signin] = useState("");

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
  }, [navigate]);

  const allUser = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: "https://6ac221b73f4ae78f6944db9c.mockapi.io/data",
      });

      if (response.status === 200) {
        setUsers(response.data);

        const id = localStorage.getItem("id");

        const currentUser = response.data.find(
          (item) => String(item.id) === String(id).replaceAll('"', ""),
        );

        if (currentUser) {
          setUser(currentUser);

          if (currentUser.userstatusplus === "adminplus") {
            setShowPasswordModal(true);
          }
        }
      }
    } catch (error) {
      console.error("ОШИБКА ПОЛЬЗОВАТЕЛЕЙ:", error);
    }
  };

  useEffect(() => {
    allUser();
  }, []);

  const plus = async (e) => {
    e.preventDefault();

    if (!password2signin.trim()) {
      setPasswordError("Введите пароль!");
      return;
    }

    try {
      const id = localStorage.getItem("id");

      if (!id) {
        navigate("/signin");
        return;
      }

      const userId = String(id).replaceAll('"', "");

      const response = await axios({
        method: "GET",
        url: `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${userId}`,
      });

      if (response.status === 200) {
        const currentUser = response.data;

        if (currentUser.userstatusplus !== "adminplus") {
          setPasswordError("Нет доступа!");
          return;
        }

        if (
          String(currentUser.password2 ?? "").trim() !== password2signin.trim()
        ) {
          setPasswordError("Неправильный пароль!");
          return;
        }

        const updateResponse = await axios({
          method: "PUT",
          url: `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${userId}`,
          data: {
            ...currentUser,
            userstatusplus: "useradminplus",
          },
        });

        if (updateResponse.status === 200) {
          setUser(updateResponse.data);

          setUsers((prevUsers) =>
            prevUsers.map((item) =>
              String(item.id) === userId ? updateResponse.data : item,
            ),
          );

          setShowPasswordModal(false);
          setPassword2signin("");
          setPasswordInput("");
          setPasswordError("");

          alert("Пароль подтверждён! Статус изменён на useradminplus.");
        }
      }
    } catch (error) {
      console.error("ОШИБКА ПРОВЕРКИ ПАРОЛЯ:", error);
      setPasswordError("Ошибка проверки. Попробуйте ещё раз.");
    }
  };

  return (
    <div className="app">
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

          <a className="i1" href="/adminsignin">
            <p className="profile-subtitle">Управление вашим аккаунтом</p>
          </a>

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

          <button className="profile-logout" onClick={logout}>
            <i className="fa-solid fa-right-from-bracket"></i>
            Выйти из аккаунта
          </button>
        </div>

        <br />
        <br />

        <Bottomnav />
      </div>

      {/* Модальное  */}
      {showPasswordModal && (
        <div className="admin-password-overlay">
          <div className="admin-password-modal">
            <div className="admin-password-icon">
              <i className="fa-solid fa-lock"></i>
            </div>

            <h2>Подтверждение доступа</h2>

            <p>Введите пароль для продолжения.</p>

            <form onSubmit={plus}>
              <input
                type="password"
                value={password2signin}
                onChange={(e) => {
                  setPassword2signin(e.target.value);
                  setPasswordError("");
                }}
                placeholder="Введите пароль"
                autoComplete="current-password"
                required
                autoFocus
              />

              {passwordError && (
                <p className="admin-password-error">{passwordError}</p>
              )}

              <button type="submit">Подтвердить</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
