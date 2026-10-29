import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Adminuplususer() {
  const [showPassword, setShowPassword] = useState(false);
  const [emailsigin, setEmailsigin] = useState("");
  const [password2signin, setPassword2signin] = useState("");

  const navigate = useNavigate();

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

      const user = response.data.find(
        (item) =>
          item.email === emailsigin &&
          item.password2 === password2signin &&
          item.userstatus === "user",
      );

      if (!user) {
        alert("Имя пользователя или пароль неправильные");
        return;
      }

      localStorage.setItem("userId", JSON.stringify(user.id));

      localStorage.setItem("id", JSON.stringify(user.id));

      alert("Вы успешно вошли");

      navigate("/home");
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
            для входа
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
            <span className="admin-signin-label">USER PANEL</span>

            <h2>Вход пользователя</h2>

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

          <button className="admin-signin-button" onClick={signIn}>
            <i className="fa-solid fa-right-to-bracket"></i>
            Войти в панель
          </button>
        </div>
      </div>
    </div>
  );
}

export default Adminuplususer;
