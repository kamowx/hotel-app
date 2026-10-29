import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firabase/firebase-config";
import axios from "axios";

const USER_URL = "https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data";

function Signin() {
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState([]);
  const [emailsigin, setEmailsigin] = useState("");
  const [password2signin, setPassword2signin] = useState("");

  const navigate = useNavigate();

  const allUser = async () => {
    try {
      const response = await axios.get(USER_URL);
      setUsers(response.data);
    } catch (error) {
      console.error("Ошибка загрузки пользователей:", error);
    }
  };

  // Ищем пользователя в MockAPI по UID Google
  const getUserByUid = async (uid) => {
    const response = await axios.get(USER_URL);

    return response.data.find((item) => item.uid === uid);
  };

  // Создаём пользователя в MockAPI
  const createUser = async (userData) => {
    const response = await axios.post(USER_URL, userData);

    return response.data;
  };

  // Вход через Google
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      // Сохраняем UID Google
      localStorage.setItem("uid", googleUser.uid);

      // Проверяем, есть ли пользователь в MockAPI
      let existingUser = await getUserByUid(googleUser.uid);

      if (!existingUser) {
        const nameParts = (googleUser.displayName || "").split(" ");

        existingUser = await createUser({
          uid: googleUser.uid,
          firstname: nameParts[0] || "",
          lastname: nameParts.slice(1).join(" "),
          email: googleUser.email || "",
          avatar: googleUser.photoURL || "",
          numberphone: googleUser.phoneNumber || "",
          userstatus: "user",
          createdAt: new Date().toISOString(),
        });
      }

      // Сохраняем ID именно записи MockAPI
      localStorage.setItem("uid", JSON.stringify(existingUser.uid));

      alert("Вы успешно вошли через Google");

      // Открываем профиль
      navigate("/profile");
    } catch (error) {
      console.error("Ошибка входа через Google:", error);
      alert("Не удалось войти через Google");
    }
  };

  useEffect(() => {
    allUser();
  }, []);

  useEffect(() => {
    const uid = localStorage.getItem("uid");

    if (uid) {
      navigate("/home");
    }
  }, [navigate]);

  // Обычный вход
  const signIn = async () => {
    if (!emailsigin.trim() || !password2signin.trim()) {
      alert("Заполните все поля");
      return;
    }

    const user = users.find(
      (item) =>
        item.email === emailsigin &&
        item.password2 === password2signin &&
        item.userstatus === "user",
    );

    if (!user) {
      alert("Имя пользователя или пароль неправильные");
      return;
    }

    alert("Вы успешно вошли");

    localStorage.setItem("uid", JSON.stringify(user.uid));

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

            <br />

            <button className="login-submit" onClick={loginWithGoogle}>
              Вход через Google
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
