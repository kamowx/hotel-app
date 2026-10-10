import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Signin() {
  const [showPassword, setShowPassword] = useState(false);

  const [users, setUsers] = useState([]);

  const [emailsigin, setEmailsigin] = useState("");

  const [password2signin, setPassword2signin] = useState("");

  const navigate = useNavigate();

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

  useEffect(() => {
    const id = localStorage.getItem("id");

    if (id) {
      navigate("/home");
    }
  }, []);

  const signIn = async () => {
    if (!emailsigin.trim() || !password2signin.trim()) {
      alert("Заполните все поля");
      return;
    }

    const user = users.find(
      (item) =>
        item.email == emailsigin &&
        item.password2 == password2signin &&
        item.userstatus == "user",
      item.userstatusplus == "userp",
    );
    if (!user) {
      alert("Имя пользователя или пароль неправильные");
      return;
    }

    alert("Вы успешно вошли");

    localStorage.setItem("id", JSON.stringify(user.id));

    navigate("/home");
  };

  return (
    <div className="app">
      <div className="onboarding">
        <div className="onboarding-header">
          <div className="logo-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className="logo-text">FirstHotel</div>
        </div>

        <div className="login-content">
          <h1>Вход</h1>

          <p>Войдите в свой аккаунт EasyPay</p>

          <div className="login-form">
            <div className="login-input-box">
              <label>Email</label>

              <input
                type="email"
                placeholder="Введите email"
                onChange={(e) => setEmailsigin(e.target.value)}
                value={emailsigin}
              />
            </div>

            <div className="login-input-box">
              <label>Пароль</label>

              <input
                onChange={(e) => setPassword2signin(e.target.value)}
                value={password2signin}
                type={showPassword ? "text" : "password"}
                placeholder="Введите пароль"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="btn position-absolute top-50 end-0 translate-middle-y pt-4"
              >
                <i
                  className={
                    showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"
                  }
                ></i>
              </button>
            </div>

            <button className="login-submit" onClick={signIn}>
              Вход
            </button>
          </div>
        </div>

        <div className="login-register">
          <span>Нет аккаунта?</span>

          <a href="/signup">
            <button>Регистрация</button>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Signin;
/*hotel*/
