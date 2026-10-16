import { useEffect, useState } from "react";
import Adminbottom from "../components/adminbottom";
import axios from "axios";

function Adminuser() {
  const [allUser, setAllUser] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  // Получить всех users
  const getAllUser = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: "https://6ac221b73f4ae78f6944db9c.mockapi.io/data",
      });

      console.log("ВСЕ ПОЛЬЗОВАТЕЛИ:", response.data);

      if (response.status === 200) {
        const users = response.data.filter(
          (item) => item.userstatus === "user",
        );

        setAllUser(users);
      }
    } catch (error) {
      console.error("ОШИБКА ПОЛУЧЕНИЯ ПОЛЬЗОВАТЕЛЕЙ:", error);
    }
  };

  useEffect(() => {
    getAllUser();
  }, []);

  // Удалить пользователя
  const deleteBooking = async (item) => {
    const confirmDelete = window.confirm(
      "Ты действительно хочешь удалить этого пользователя?",
    );

    if (!confirmDelete) return;

    try {
      await axios({
        method: "DELETE",
        url: `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${item.id}`,
      });

      setAllUser((prev) =>
        prev.filter((user) => String(user.id) !== String(item.id)),
      );

      alert("Пользователь удалён!");
    } catch (error) {
      console.error("ОШИБКА УДАЛЕНИЯ:", error);
      alert("Не удалось удалить пользователя");
    }
  };

  // Открыть модальное окно редактирования
  const confirmBooking = (item) => {
    setEditUser({
      ...item,
      firstname: item.firstname || "",
      lastname: item.lastname || "",
      numberphone: item.numberphone || "",
      email: item.email || "",
      check: item.check ?? 0,
      userstatus: item.userstatus || "user",
    });

    setShowModal(true);
  };

  // Изменить данные в модальном окне
  const handleChange = (e) => {
    const { name, value } = e.target;

    setEditUser((prev) => ({
      ...prev,
      [name]: name === "check" ? Number(value) : value,
    }));
  };

  // Сохранить изменения в MockAPI
  const updateUser = async () => {
    if (!editUser) return;

    try {
      const response = await axios({
        method: "PUT",
        url: `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${editUser.id}`,
        data: {
          ...editUser,
          check: Number(editUser.check) || 0,
        },
      });

      if (response.status === 200) {
        if (response.data.userstatus === "user") {
          setAllUser((prev) =>
            prev.map((user) =>
              String(user.id) === String(editUser.id) ? response.data : user,
            ),
          );
        } else {
          setAllUser((prev) =>
            prev.filter((user) => String(user.id) !== String(editUser.id)),
          );
        }

        setShowModal(false);
        setEditUser(null);

        alert("Пользователь обновлён!");
      }
    } catch (error) {
      console.error("ОШИБКА ИЗМЕНЕНИЯ ПОЛЬЗОВАТЕЛЯ:", error);
      alert("Не удалось изменить пользователя");
    }
  };

  return (
    <div className="admin-page">
      <Adminbottom />

      <main className="admin-main">
        <header className="admin-top">
          <div>
            <h1>Пользователи</h1>
            <p>Список зарегистрированных пользователей</p>
          </div>

          <div className="admin-profile">
            <div className="admin-profile-icon">
              <i className="fa-solid fa-user"></i>
            </div>

            <div>
              <strong>Администратор</strong>
              <span>Панель управления</span>
            </div>
          </div>
        </header>

        <div className="admin-content">
          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <h2>Все пользователи</h2>
                <p>Пользователи со статусом user</p>
              </div>
            </div>

            <div className="admin-table">
              <div className="admin-table-head">
                <span>Имя</span>
                <span>Фамилия</span>
                <span>Телефон</span>
                <span>Email</span>
                <span>Счёт</span>
                <span>Действие</span>
              </div>

              {allUser.map((item) => (
                <div className="admin-table-row" key={item.id}>
                  <div className="admin-hotel-name">
                    <div className="admin-hotel-icon">
                      <img
                        src={
                          item.avatar || <i className="fa-solid fa-user"></i>
                        }
                        alt=""
                        className="admin-hotel-icon"
                      />
                    </div>

                    <strong>{item.firstname || "—"}</strong>
                  </div>

                  <span>{item.lastname || "—"}</span>
                  <span>{item.numberphone || "—"}</span>
                  <span>{item.email || "—"}</span>
                  <strong>{item.check ?? 0} сом</strong>

                  <div className="admin-order-buttons">
                    <button
                      className="admin-confirm-button"
                      onClick={() => confirmBooking(item)}
                    >
                      <i className="fa-solid fa-pen"></i>
                      Изменить
                    </button>

                    <button
                      className="admin-delete-button"
                      onClick={() => deleteBooking(item)}
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                </div>
              ))}

              {allUser.length === 0 && (
                <div className="admin-table-row">
                  <span>Пользователей пока что нет</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Модальное окно редактирования пользователя */}
      {showModal && editUser && (
        <div
          className="admin-user-modal-backdrop"
          onClick={() => setShowModal(false)}
        >
          <div
            className="admin-user-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-user-modal-header">
              <div>
                <h2>Редактировать пользователя</h2>
                <p>Измените данные пользователя</p>
              </div>

              <button
                type="button"
                className="admin-user-modal-close"
                onClick={() => setShowModal(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="admin-user-modal-body">
              <label>Имя</label>
              <input
                type="text"
                name="firstname"
                className="form-control"
                value={editUser.firstname}
                onChange={handleChange}
              />

              <label>Фамилия</label>
              <input
                type="text"
                name="lastname"
                className="form-control"
                value={editUser.lastname}
                onChange={handleChange}
              />

              <label>Телефон</label>
              <input
                type="text"
                name="numberphone"
                className="form-control"
                value={editUser.numberphone}
                onChange={handleChange}
              />

              <label>Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={editUser.email}
                onChange={handleChange}
              />

              <label>Счёт (сом)</label>
              <input
                type="number"
                name="check"
                min="0"
                className="form-control"
                value={editUser.check}
                onChange={handleChange}
              />

              {/* <label>Статус пользователя</label>
              <select
                name="userstatus"
                className="form-select"
                value={editUser.userstatus}
                onChange={handleChange}
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
               */}
            </div>

            <div className="admin-user-modal-footer">
              <button
                type="button"
                className="admin-user-cancel-button"
                onClick={() => setShowModal(false)}
              >
                Отмена
              </button>

              <button
                type="button"
                className="admin-user-save-button"
                onClick={updateUser}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Adminuser;
