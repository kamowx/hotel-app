import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Adminsignin() {
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState([]);
  const [emailsigin, setEmailsigin] = useState("");
  const [password2signin, setPassword2signin] = useState("");

  const navigate = useNavigate();

  const allUser = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: "https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data",
      });

      console.log("GET", response);

      if (response.status === 200) {
        setUsers(response.data);

        const rawId = localStorage.getItem("id");
        if (rawId) {
          const id = String(rawId).replaceAll('"', "");
          const currentUser = response.data.find(
            (item) => String(item.id) === String(id),
          );

          if (currentUser) {
            if (currentUser.userstatus === "user") {
              navigate("/home");
            } else if (currentUser.userstatus === "admin") {
              navigate("/admin");
            } else if (currentUser.userstatus === "padmin") {
              navigate("/padmin");
            } else if (currentUser.userstatus === "cleaning") {
              navigate("/cleaning");
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    allUser();
  }, []);

  const signIn = async () => {
    if (!emailsigin.trim() || !password2signin.trim()) {
      alert("Заполните все поля");
      return;
    }

    try {
      const response = await axios({
        method: "GET",
        url: "https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data",
      });

      console.log("USERS ДЛЯ ВХОДА:", response.data);

      if (response.status === 200) {
        const currentUser = response.data.find(
          (item) =>
            item.email === emailsigin && item.password2 === password2signin,
        );

        if (!currentUser) {
          alert("Имя пользователя или пароль неправильные");
          return;
        }

        console.log("НАЙДЕННЫЙ ПОЛЬЗОВАТЕЛЬ:", currentUser);
        console.log("USERSTATUS:", currentUser.userstatus);

        if (currentUser.userstatus === "user") {
          localStorage.removeItem("adminId");
          localStorage.setItem("userId", JSON.stringify(currentUser.id));
          localStorage.setItem("id", JSON.stringify(currentUser.id));
          navigate("/home");
          return;
        }

        if (currentUser.userstatus === "admin") {
          localStorage.removeItem("userId");
          localStorage.setItem("adminId", JSON.stringify(currentUser.id));
          localStorage.setItem("id", JSON.stringify(currentUser.id));
          navigate("/admin");
          return;
        }

        if (currentUser.userstatus === "padmin") {
          localStorage.removeItem("userId");
          localStorage.setItem("adminId", JSON.stringify(currentUser.id));
          localStorage.setItem("id", JSON.stringify(currentUser.id));
          navigate("/padmin");
          return;
        }

        if (currentUser.userstatus === "cleaning") {
          localStorage.removeItem("userId");
          localStorage.setItem("adminId", JSON.stringify(currentUser.id));
          localStorage.setItem("id", JSON.stringify(currentUser.id));
          navigate("/cleaning");
          return;
        }

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
            управления
          </h1>

          <p>
            Вход для администрации, партнёров (padmin) и персонала клининга (cleaning).
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
            <span className="admin-signin-label">STAFF & ADMIN PANEL</span>

            <h2>Вход в систему</h2>

            <p>Введите свои данные для входа в панель управления</p>
          </div>

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

          <button
            type="button"
            className="admin-signin-button"
            onClick={signIn}
          >
            <i className="fa-solid fa-right-to-bracket"></i>
            Войти в панель
          </button>

          <a className="i1" href="/">
            <button type="button" className="admin-signin-back">
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
