import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function AdminSignup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("id");

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

          if (currentUser.userstatus == "admin") {
            navigate("/admin");
            return;
          }

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

  const signup = async () => {
    if (
      !name.trim() ||
      !surname.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password1.trim() ||
      !password2.trim()
    ) {
      alert("Заполните все поля");
      return;
    }

    if (password1 != password2) {
      alert("Пароли не совпадают");
      return;
    }

    try {
      const response = await axios({
        method: "GET",
        url: "https://6ac221b73f4ae78f6944db9c.mockapi.io/data",
      });

      if (response.status === 200) {
        const checkEmail = response.data.some((item) => item.email == email);

        if (checkEmail == true) {
          alert("Такой email уже зарегистрирован");
          return;
        }

        const checkPhone = response.data.some(
          (item) => item.numberphone == phone,
        );

        if (checkPhone == true) {
          alert("Пользователь с таким номером уже зарегистрирован");
          return;
        }

        const newUser = await axios({
          method: "POST",
          url: "https://6ac221b73f4ae78f6944db9c.mockapi.io/data",
          data: {
            firstname: name,
            lastname: surname,
            email: email,
            numberphone: phone,
            password1: password1,
            password2: password2,
            userstatus: "admin",
            userstatusplus: "adminplus",
          },
        });

        console.log("ADMIN SIGNUP:", newUser);

        if (newUser.status === 201) {
          alert("Администратор зарегистрирован");
          navigate("/admin");
        }
      }
    } catch (error) {
      console.error(error);
      alert("Ошибка при регистрации");
    }
  };

  return (
    <div className="admin-signup-page">
      <div className="admin-signup-left">
        <div className="admin-signup-logo">
          <div className="admin-logo-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <span>FirstHotel</span>
        </div>

        <div className="admin-signup-left-content">
          <h1>Панель администратора</h1>

          <p>
            Создайте новый аккаунт администратора для управления системой
            FirstHotel.
          </p>
        </div>
      </div>

      <div className="admin-signup-right">
        <div className="admin-signup-form">
          <div className="admin-signup-header">
            <h2>Регистрация администратора</h2>

            <p>Заполните данные для создания аккаунта</p>
          </div>

          <div className="admin-signup-row">
            <div className="admin-signup-input">
              <label>Имя</label>

              <input
                type="text"
                placeholder="Введите имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="admin-signup-input">
              <label>Фамилия</label>

              <input
                type="text"
                placeholder="Введите фамилию"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-signup-row">
            <div className="admin-signup-input">
              <label>Email</label>

              <input
                type="email"
                placeholder="Введите email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="admin-signup-input">
              <label>Номер телефона</label>

              <input
                type="tel"
                placeholder="+996 000 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-signup-row">
            <div className="admin-signup-input">
              <label>Пароль</label>

              <input
                type="password"
                placeholder="Введите пароль"
                value={password1}
                onChange={(e) => setPassword1(e.target.value)}
              />
            </div>

            <div className="admin-signup-input">
              <label>Повторите пароль</label>

              <input
                type="password"
                placeholder="Повторите пароль"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
              />
            </div>
          </div>

          <button className="admin-signup-button" onClick={signup}>
            <i className="fa-solid fa-user-plus"></i>
            Зарегистрировать администратора
          </button>

          <Link to="/admin" className="admin-signup-back">
            <i className="fa-solid fa-arrow-left"></i>
            Вернуться в панель
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminSignup;
/*hotel*/
