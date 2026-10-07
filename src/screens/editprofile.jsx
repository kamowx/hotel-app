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

  // Состояние модального окна
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Ссылка на фото
  const [photo, setPhoto] = useState("");

  // Временная ссылка на фото в модальном окне
  const [newPhoto, setNewPhoto] = useState("");

  /* ================= ID ================= */

  const id = JSON.parse(localStorage.getItem("id"));

  /* ================= GET USER ======================= */

  const allUser = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: "https://6ac221b73f4ae78f6944db9c.mockapi.io/data",
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

  /* ================= PHOTO MODAL ================= */

  const openPhotoModal = () => {
    setNewPhoto(photo);
    setShowPhotoModal(true);
  };

  const savePhoto = () => {
    setPhoto(newPhoto);
    setShowPhotoModal(false);
  };

  const cancelPhoto = () => {
    setNewPhoto(photo);
    setShowPhotoModal(false);
  };

  /* ================= SAVE PROFILE =================== */

  const saveProfile = async () => {
    if (!name.trim() || !surname.trim() || !phone.trim() || !email.trim()) {
      alert("Заполните все поля");
      return;
    }

    const checkEmail = users.some(
      (item) => item.email == email && item.id != id,
    );

    if (checkEmail == true) {
      alert("Такой пользователь уже существует");
      return;
    }

    const checkNumberphone = users.some(
      (item) => item.numberphone == phone && item.id != id,
    );

    if (checkNumberphone == true) {
      alert("Пользователь с таким номером уже зарегистрирован");
      return;
    }

    try {
      const response = await axios({
        method: "PUT",
        url: `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${id}`,
        data: {
          firstname: name,
          lastname: surname,
          numberphone: phone,
          email: email,
          avatar: photo,
        },
      });

      console.log("PUT", response);

      if (response.status === 200) {
        alert("Данные сохранены");
        navigate("/profile");
      }
    } catch (error) {
      console.error(error);

      alert("Ошибка при сохранении");
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

          {/* ================= PHOTO ================= */}

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
            <div className="edit-input-box">
              <label>Имя</label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите имя"
              />
            </div>

            <div className="edit-input-box">
              <label>Фамилия</label>

              <input
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder="Введите фамилию"
              />
            </div>

            <div className="edit-input-box">
              <label>Номер телефона</label>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+996 000 000 000"
              />
            </div>

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
          </div>
        </div>

        {/* ================= PHOTO MODAL ================= */}

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
