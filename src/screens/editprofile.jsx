import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function EditProfile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photo, setPhoto] = useState("");
  const [newPhoto, setNewPhoto] = useState("");

  // Смена пароля
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const id = JSON.parse(localStorage.getItem("id"));

  const allUser = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: "https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data",
      });

      console.log("GET", response);

      if (response.status === 200) {
        setUsers(response.data);

        const currentUser = response.data.find((item) => item.id == id);

        setUser(currentUser);

        setName(currentUser?.firstname || "");
        setSurname(currentUser?.lastname || "");
        setPhone(currentUser?.numberphone || "");
        setEmail(currentUser?.email || "");
        setPhoto(currentUser?.avatar || "");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    allUser();
  }, []);

  // Открыть изменение фото
  const openPhotoModal = () => {
    setNewPhoto(photo);
    setShowPhotoModal(true);
  };

  // Сохранить фото
  const savePhoto = () => {
    setPhoto(newPhoto);
    setShowPhotoModal(false);
  };

  // Отменить изменение фото
  const cancelPhoto = () => {
    setNewPhoto(photo);
    setShowPhotoModal(false);
  };

  // Сохранить данные профиля
  const saveProfile = async () => {
    if (!name.trim() || !surname.trim() || !phone.trim() || !email.trim()) {
      alert("Заполните все поля");
      return;
    }

    const checkEmail = users.some(
      (item) => item.email == email && item.id != id,
    );

    if (checkEmail) {
      alert("Такой пользователь уже существует");
      return;
    }

    const checkNumberphone = users.some(
      (item) => item.numberphone == phone && item.id != id,
    );

    if (checkNumberphone) {
      alert("Пользователь с таким номером уже зарегистрирован");
      return;
    }

    try {
      const response = await axios({
        method: "PUT",
        url: `https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data/${id}`,
        data: {
          ...user,
          firstname: name,
          lastname: surname,
          numberphone: phone,
          email: email,
          avatar: photo,
        },
      });

      console.log("PUT", response);

      if (response.status === 200) {
        setUser(response.data);
        alert("Данные сохранены");
        navigate("/profile");
      }
    } catch (error) {
      console.error(error);
      alert("Ошибка при сохранении");
    }
  };

  // Изменить пароль
  const changePassword = async () => {
    if (!oldPassword || !newPassword || !repeatPassword) {
      alert("Заполните все поля пароля");
      return;
    }

    // Проверяем старый пароль
    if (oldPassword !== user?.password1 && oldPassword !== user?.password2) {
      alert("Старый пароль неправильный");
      return;
    }

    // Проверяем совпадение новых паролей
    if (newPassword !== repeatPassword) {
      alert("Новые пароли не совпадают");
      return;
    }

    if (newPassword.length < 6) {
      alert("Новый пароль должен содержать минимум 6 символов");
      return;
    }

    try {
      const response = await axios({
        method: "PUT",
        url: `https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data/${id}`,
        data: {
          ...user,
          password1: newPassword,
          password2: newPassword,
        },
      });

      console.log("PUT PASSWORD", response);

      if (response.status === 200) {
        setUser(response.data);

        setOldPassword("");
        setNewPassword("");
        setRepeatPassword("");

        alert("Пароль успешно изменён");
      }
    } catch (error) {
      console.error(error);
      alert("Ошибка при смене пароля");
    }
  };

  return (
    <div className="app">
      <div className="onboarding edit-profile-page">
        <button className="back-button" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>

        <div className="onboarding-header">
          <div className="logo-text">FirstHotels</div>
        </div>

        <div className="edit-profile-content">
          <div className="edit-profile-title">
            <h1>Редактирование</h1>
            <p>Измените свои личные данные</p>
          </div>

          {/* Фото пользователя */}
          <div className="edit-photo-box">
            <div className="edit-profile-photo">
              {photo ? (
                <img src={photo} alt="Фото пользователя" />
              ) : (
                <i className="fa-solid fa-user"></i>
              )}
            </div>

            <button className="change-photo-button" onClick={openPhotoModal}>
              <i className="fa-solid fa-camera"></i>
              Изменить фото
            </button>
          </div>

          <div className="edit-profile-form">
            {/* Имя */}
            <div className="edit-input-box">
              <label>Имя</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите имя"
              />
            </div>

            {/* Фамилия */}
            <div className="edit-input-box">
              <label>Фамилия</label>
              <input
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder="Введите фамилию"
              />
            </div>

            {/* Телефон */}
            <div className="edit-input-box">
              <label>Номер телефона</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+996 000 000 000"
              />
            </div>

            {/* Email */}
            <div className="edit-input-box">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите email"
              />
            </div>

            <button className="edit-save-button" onClick={saveProfile}>
              <i className="fa-solid fa-check"></i>
              Сохранить
            </button>

            <button
              className="edit-save-button dark"
              onClick={() => navigate(-1)}
            >
              Отмена
            </button>

            {/* Смена пароля */}
            <div className="edit-profile-title">
              <h1>Смена пароля</h1>
              <p>Введите старый пароль и придумайте новый</p>
            </div>

            <div className="edit-input-box">
              <label>Старый пароль</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Введите старый пароль"
              />
            </div>

            <div className="edit-input-box">
              <label>Новый пароль</label>
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Введите новый пароль"
              />
            </div>

            <div className="edit-input-box">
              <label>Повторите новый пароль</label>
              <input
                type={showNewPassword ? "text" : "password"}
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                placeholder="Повторите новый пароль"
              />
            </div>

            <button
              type="button"
              className="edit-save-button"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              <i
                className={
                  showNewPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"
                }
              ></i>
              {showNewPassword ? "Скрыть пароль" : "Показать пароль"}
            </button>

            <button
              type="button"
              className="edit-save-button"
              onClick={changePassword}
            >
              <i className="fa-solid fa-lock"></i>
              Изменить пароль
            </button>
          </div>
        </div>

        {/* Модальное окно изменения фото */}
        {showPhotoModal && (
          <div className="photo-modal-overlay">
            <div className="photo-modal">
              <div className="photo-modal-header">
                <h2>Изменить фото</h2>

                <button className="photo-modal-close" onClick={cancelPhoto}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="photo-modal-body">
                <label>Ссылка на фото</label>

                <input
                  type="text"
                  value={newPhoto}
                  onChange={(e) => setNewPhoto(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div className="photo-modal-actions">
                <button className="photo-modal-cancel" onClick={cancelPhoto}>
                  Отмена
                </button>

                <button className="photo-modal-save" onClick={savePhoto}>
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditProfile;
