import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const USERS_URL = "https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data";

function Staffsignin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Заполните email и пароль");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(USERS_URL);

      const employee = response.data.find((item) => {
        const userEmail =
          item.email ||
          item.emailsigin ||
          item.emailuser ||
          item.emailSignup ||
          "";

        const userPassword =
          item.password ||
          item.password2signin ||
          item.passwordsignup ||
          item.password2 ||
          "";

        return (
          String(userEmail).trim().toLowerCase() ===
            email.trim().toLowerCase() && String(userPassword) === password
        );
      });

      if (!employee) {
        alert("Неправильный email или пароль");
        return;
      }

      if (
        employee.userstatus !== "padmin" &&
        employee.userstatus !== "cleaning" &&
        employee.userstatus !== "chef"
      ) {
        alert("У вас нет доступа к входу персонала");
        return;
      }

      // Проверяем наличие ID
      if (!employee.id) {
        alert("У сотрудника отсутствует ID в базе данных");
        console.log("Данные сотрудника:", employee);
        return;
      }

      // Сохраняем данные сотрудника
      localStorage.setItem("id", JSON.stringify(employee.id));
      localStorage.setItem("uid", JSON.stringify(employee.uid || ""));
      localStorage.setItem("accountType", JSON.stringify(employee.userstatus));

      // Проверяем сохранение
      console.log("ID:", localStorage.getItem("id"));
      console.log("UID:", localStorage.getItem("uid"));
      console.log("Статус:", localStorage.getItem("accountType"));

      if (employee.userstatus === "padmin") {
        navigate("/padmin", { replace: true });
      } else if (employee.userstatus === "cleaning") {
        navigate("/cleaning", { replace: true });
      } else if (employee.userstatus === "chef") {
        navigate("/cook", { replace: true });
      }
    } catch (error) {
      console.error(error);
      alert("Ошибка входа. Попробуйте ещё раз");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-login-page">
      <div className="staff-login-card">
        <div className="staff-logo">
          <span className="staff-logo-icon">
            <span></span>
            <span></span>
            <span></span>
          </span>
          <span>FirstHotel</span>
        </div>

        <div className="staff-login-content">
          <h1>Вход персонала</h1>
          <p>Войдите в свой рабочий аккаунт</p>

          <form onSubmit={login} className="staff-login-form">
            <div className="staff-input-box">
              <label>Email</label>
              <input
                type="email"
                placeholder="Введите email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="staff-input-box">
              <label>Пароль</label>

              <div className="staff-password-box">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
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
              type="submit"
              className="staff-login-submit"
              disabled={loading}
            >
              {loading ? "Вход..." : "Войти"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Staffsignin;
