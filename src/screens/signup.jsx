import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function Signup() {
  const navigate = useNavigate();


  const [showPassword, setShowPassword] = useState(false);

  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [numberphone, setNumberphone] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");

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
  const register = async () => {
    if (!email.trim() || !password1.trim() || !password2.trim()) {
      alert("Заполните все поля");
      return;
    }

    const checkPassword = password1 == password2;

    if (checkPassword == false) {
      alert("Пароли не одинаковые");
      return;
    }

    const checkEmail = users.some((item) => item.email == email);

    if (checkEmail == true) {
      alert("Такой пользователь уже существует");
      return;
    }

    const checkNumberphone = users.some(
      (item) => item.numberphone == numberphone,
    );

    if (checkNumberphone == true) {
      alert("Пользователь с таким номером уже зарегистрирован");
      return;
    }
    try {
      const responce = await axios({
        method: "POST",
        url: "https://6ac221b73f4ae78f6944db9c.mockapi.io/data",
        data: {
          email: email,
          firstname: firstname,
          lastname: lastname,
          numberphone: numberphone,
          password1: password1,
          password2: password2,
          userstatus: "user",
        },
      });

      console.log("POST", responce);

      if (responce.status === 201 || responce.status === 200) {
        alert("Учетная запись создана");

        setEmail("");
        setFirstname("");
        setLastname("");
        setNumberphone("");
        setPassword1("");
        setPassword2("");

        allUser();
        navigate("/signin");
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    const id = localStorage.getItem("id");

    if (id) {
      navigate("/home");
    }
  }, []);

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
          <h1>Регистарция</h1>

          <p>Зарегистриуйтесь в аккаунт FirstHotel</p>

          <div className="login-form">

            <div className="login-input-box">
              <label>Имя - Фамилия</label>

              <div className="name-surname">
                <input
                  type="text"
                  placeholder="Введите имя"
                  onChange={(e) => setFirstname(e.target.value)}
                  value={firstname}
                />

                <input
                  type="text"
                  placeholder="Введите фамилию"
                  onChange={(e) => setLastname(e.target.value)}
                  value={lastname}
                />
              </div>
            </div>

            <div className="login-input-box">
              <label>Email</label>

              <input
                type="email"
                placeholder="Введите email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>


            <div className="login-input-box">
              <label>Номер телефона</label>

              <input
                type="number"
                placeholder="+996 000 000 000"
                onChange={(e) => setNumberphone(e.target.value)}
                value={numberphone}
              />
            </div>


            <div className="login-input-box">
              <label>Пароль</label>

              <input
                onChange={(e) => setPassword1(e.target.value)}
                value={password1}
                type="password"
                placeholder="Придумайте пароль"
              />
            </div>

            <div className="login-input-box">
              <label>Пароль</label>

              <input
                onChange={(e) => setPassword2(e.target.value)}
                value={password2}
                type={showPassword ? "text" : "password"}
                placeholder="Повторите пароль"
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

            <button className="login-submit" onClick={register}>
              зарегистрироваться
            </button>
          </div>
        </div>

        <div className="login-register">
          <span>Есть аккаунта?</span>

          <a href="/signin">
            <button>Вход</button>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Signup;
