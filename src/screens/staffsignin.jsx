import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const USERS_URL = "https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data";

function Staffsignin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Автоматический вход/перенаправление, если сотрудник уже авторизован
  useEffect(() => {
    const rawId = localStorage.getItem("id");
    if (!rawId) return;

    const checkExistingStaff = async () => {
      try {
        const id = String(rawId).replaceAll('"', "");
        const response = await axios.get(`${USERS_URL}/${id}`);
        const user = response.data;
        const status = String(user.userstatus || user.role || "")
          .trim()
          .toLowerCase();

        if (status === "padmin") {
          navigate("/padmin", { replace: true });
        } else if (status === "cleaning") {
          navigate("/cleaning", { replace: true });
        } else if (status === "chef") {
          navigate("/cook", { replace: true });
        } else if (status === "admin") {
          navigate("/admin", { replace: true });
        }
      } catch (error) {
        console.error("Ошибка проверки сохранённой сессии:", error);
      }
    };

    checkExistingStaff();
  }, [navigate]);

  const login = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      alert("Заполните email и пароль");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(USERS_URL);

      const employee = response.data.find((item) => {
        const userEmail = String(
          item.email ||
            item.emailsigin ||
            item.emailuser ||
            item.emailSignup ||
            item.username ||
            "",
        )
          .trim()
          .toLowerCase();

        const passOptions = [
          item.password,
          item.password2signin,
          item.passwordsignup,
          item.password2,
          item.password1,
        ]
          .filter(Boolean)
          .map((p) => String(p).trim());

        const isEmailMatch = userEmail === trimmedEmail;
        const isPasswordMatch = passOptions.includes(trimmedPassword);

        return isEmailMatch && isPasswordMatch;
      });

      if (!employee) {
        alert("Неправильный email или пароль");
        return;
      }

      const role = String(employee.userstatus || employee.role || "")
        .trim()
        .toLowerCase();

      if (
        role !== "padmin" &&
        role !== "cleaning" &&
        role !== "chef" &&
        role !== "admin"
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

      const employeeId = String(employee.id);
      const employeeUid = String(employee.uid || employee.id);

      // Очищаем старую сессию обычного клиента
      localStorage.removeItem("userId");

      // Сохраняем сессию сотрудника
      localStorage.setItem("id", JSON.stringify(employeeId));
      localStorage.setItem("adminId", JSON.stringify(employeeId));
      localStorage.setItem("uid", JSON.stringify(employeeUid));
      localStorage.setItem("accountType", JSON.stringify(role));
      localStorage.setItem("userstatus", JSON.stringify(role));
      localStorage.setItem("currentUser", JSON.stringify(employee));

      // Проверяем сохранение в консоли
      console.log("Успешное сохранение в localStorage:", {
        id: localStorage.getItem("id"),
        adminId: localStorage.getItem("adminId"),
        uid: localStorage.getItem("uid"),
        accountType: localStorage.getItem("accountType"),
      });

      if (role === "padmin") {
        navigate("/padmin", { replace: true });
      } else if (role === "cleaning") {
        navigate("/cleaning", { replace: true });
      } else if (role === "chef") {
        navigate("/cook", { replace: true });
      } else if (role === "admin") {
        navigate("/admin", { replace: true });
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
