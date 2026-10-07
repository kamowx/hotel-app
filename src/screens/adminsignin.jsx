import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Adminsignin() {
  const [showPassword, setShowPassword] = useState(false);

  const [users, setUsers] = useState([]);

  const [emailsigin, setEmailsigin] = useState("");

  const [password2signin, setPassword2signin] = useState("");

  /* NAVIGATE */

  const navigate = useNavigate();

  /* ================= ПОЛУЧАЕМ USERS ================= */

  // Получения getItem
  const allUser = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: "https://6ac221b73f4ae78f6944db9c.mockapi.io/data",
      });

      console.log("GET", response);

      if (response.status === 200) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    allUser();
  }, []);

  /* ================= ПРОВЕРКА ID ================= */

  useEffect(() => {
    const id = localStorage.getItem("id");

    // Если ID нет — остаёмся на странице входа
    if (!id) {
      return;
    }

    const checkUser = async () => {
      try {
        const response = await axios({
          method: "GET",
          url: "https://6ac221b73f4ae78f6944db9c.mockapi.io/data",
        });

        if (response.status === 200) {
          const currentUser = response.data.find(
            (item) => String(item.id) === String(id).replaceAll('"', ""),
          );

          if (!currentUser) {
            return;
          }

          /* ЕСЛИ ADMIN */

          if (currentUser.userstatus == "admin") {
            navigate("/admin");
            return;
          }

          /* ЕСЛИ USER */

          if (currentUser.userstatus == "user") {
            navigate("/home");
            return;
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    checkUser();
  }, []);

  /* ================= SIGN IN ================= */

  // Save и setItem
  const signIn = async () => {
    if (!emailsigin.trim() || !password2signin.trim()) {
      alert("Заполните все поля");
      return;
    }

    try {
      const response = await axios({
        method: "GET",
        url: "https://6ac221b73f4ae78f6944db9c.mockapi.io/data",
      });

      console.log("USERS ДЛЯ ВХОДА:", response.data);

      if (response.status === 200) {
        /* ИЩЕМ ПОЛЬЗОВАТЕЛЯ */

        const currentUser = response.data.find(
          (item) =>
            item.email == emailsigin && item.password2 == password2signin,
        );

        /* ЕСЛИ ПОЛЬЗОВАТЕЛЬ НЕ НАЙДЕН */

        if (!currentUser) {
          alert("Имя пользователя или пароль неправильные");
          return;
        }

        console.log("НАЙДЕННЫЙ ПОЛЬЗОВАТЕЛЬ:", currentUser);

        console.log("USERSTATUS:", currentUser.userstatus);

        /* СОХРАНЯЕМ ID */

        localStorage.setItem("id", JSON.stringify(currentUser.id));

        /* ПРОВЕРЯЕМ USERSTATUS */

        if (currentUser.userstatus == "user") {
          navigate("/home");
          return;
        }

        if (currentUser.userstatus == "admin") {
          navigate("/admin");
          return;
        }

        /* ЕСЛИ USERSTATUS НЕПРАВИЛЬНЫЙ */

        alert("У пользователя не указан правильный статус");
      }
    } catch (error) {
      console.error(error);
      alert("Ошибка при входе");
    }
  };

  return (
    <div className="admin-signin-page">
      <div className="admin-signin-left">
        <div className="admin-signin-logo">
          <div className="admin-logo-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <span>FirstHotel</span>
        </div>

        <div className="admin-signin-info">
          <div className="admin-signin-info-icon">
            <i className="fa-solid fa-shield-halved"></i>
          </div>

          <h1>
            Панель
            <br />
            администратора
          </h1>

          <p>
            Управляйте бронированиями, отелями и пользователями в одном месте.
          </p>
        </div>

        <div className="admin-signin-left-bottom">
          <span>
            <i className="fa-solid fa-lock"></i>
            Безопасный вход
          </span>
        </div>
      </div>

      <div className="admin-signin-right">
        <div className="admin-signin-form">
          <div className="admin-signin-header">
            <span className="admin-signin-label">ADMIN PANEL</span>

            <h2>Вход администратора</h2>

            <p>Введите свои данные для входа в панель управления</p>
          </div>

          {/* EMAIL */}

          <div className="admin-signin-input-box">
            <label>Email</label>

            <div className="admin-signin-input-wrapper">
              <i className="fa-solid fa-envelope"></i>

              <input
                type="email"
                placeholder="Введите email"
                onChange={(e) => setEmailsigin(e.target.value)}
                value={emailsigin}
              />
            </div>
          </div>

          {/* PASSWORD */}

          <div className="admin-signin-input-box">
            <label>Пароль</label>

            <div className="admin-signin-input-wrapper">
              <i className="fa-solid fa-lock"></i>

              <input
                onChange={(e) => setPassword2signin(e.target.value)}
                value={password2signin}
                type={showPassword ? "text" : "password"}
                placeholder="Введите пароль"
              />

              <button
                type="button"
                className="admin-password-button"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i
                  className={
                    showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"
                  }
                ></i>
              </button>
            </div>
          </div>

          {/* BUTTON */}

          <button className="admin-signin-button" onClick={signIn}>
            <i className="fa-solid fa-right-to-bracket"></i>
            Войти в панель
          </button>

          {/* BACK */}

          <a className="i1" href="/">
            <button className="admin-signin-back">
              <i className="fa-solid fa-arrow-left"></i>
              Вернуться назад
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Adminsignin;
