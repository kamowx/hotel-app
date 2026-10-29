import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const USERS_URL = "https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data";
const HOTELS_URL = "https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/hotels";

function Adminstaff() {
  const [staff, setStaff] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [editId, setEditId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("padmin");
  const [assignedHotels, setAssignedHotels] = useState([]);

  const navigate = useNavigate();

  const getData = async () => {
    try {
      const savedId = localStorage.getItem("id");

      if (!savedId) {
        navigate("/adminsignin", { replace: true });
        return;
      }

      const id = String(savedId).replaceAll('"', "");
      const current = await axios.get(`${USERS_URL}/${id}`);

      if (current.data.userstatus !== "admin") {
        if (current.data.userstatus === "padmin") {
          navigate("/padmin", { replace: true });
        } else if (current.data.userstatus === "cleaning") {
          navigate("/cleaning", { replace: true });
        } else {
          navigate("/home", { replace: true });
        }
        return;
      }

      const [usersResponse, hotelsResponse] = await Promise.all([
        axios.get(USERS_URL),
        axios.get(HOTELS_URL),
      ]);

      setStaff(
        usersResponse.data.filter(
          (item) =>
            item.userstatus === "padmin" || item.userstatus === "cleaning",
        ),
      );
      setHotels(hotelsResponse.data);
    } catch (error) {
      console.error(error);
      alert("Не удалось загрузить данные");
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const resetForm = () => {
    setEditId("");
    setName("");
    setEmail("");
    setPassword("");
    setRole("padmin");
    setAssignedHotels([]);
  };

  const editStaff = (item) => {
    setEditId(item.id);
    setName(
      item.name || item.namesigin || item.nameuser || item.username || "",
    );
    setEmail(item.email || item.emailsigin || item.emailuser || "");
    setPassword(
      item.password ||
        item.password2signin ||
        item.passwordsignup ||
        item.password2 ||
        "",
    );
    setRole(item.userstatus);
    setAssignedHotels(
      Array.isArray(item.cleaningHotelIds)
        ? item.cleaningHotelIds.map(String)
        : [],
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleHotel = (hotelId) => {
    const id = String(hotelId);

    setAssignedHotels((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  };

  const saveStaff = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || (!editId && !password.trim())) {
      alert("Заполните имя, email и пароль");
      return;
    }

    if (role === "cleaning" && assignedHotels.length === 0) {
      alert("Назначьте уборщику хотя бы один отель");
      return;
    }

    try {
      const allUsers = (await axios.get(USERS_URL)).data;

      const duplicate = allUsers.find((item) => {
        const itemEmail = item.email || item.emailsigin || item.emailuser || "";

        return (
          String(itemEmail).trim().toLowerCase() ===
            email.trim().toLowerCase() && String(item.id) !== String(editId)
        );
      });

      if (duplicate) {
        alert("Пользователь с таким email уже существует");
        return;
      }

      const oldStaff = editId
        ? allUsers.find((item) => String(item.id) === String(editId))
        : null;

      const staffData = {
        ...(oldStaff || {}),
        name: name.trim(),
        email: email.trim(),
        userstatus: role,
        cleaningHotelIds: role === "cleaning" ? assignedHotels : [],
      };

      if (password.trim()) {
        staffData.password = password;
      }

      if (editId) {
        await axios.put(`${USERS_URL}/${editId}`, staffData);
        alert("Сотрудник изменён");
      } else {
        await axios.post(USERS_URL, staffData);
        alert("Сотрудник добавлен");
      }

      resetForm();
      await getData();
    } catch (error) {
      console.error(error);
      alert("Не удалось сохранить сотрудника");
    }
  };

  const deleteStaff = async (id) => {
    if (!window.confirm("Удалить сотрудника?")) return;

    try {
      await axios.delete(`${USERS_URL}/${id}`);
      setStaff((previous) =>
        previous.filter((item) => String(item.id) !== String(id)),
      );

      if (String(editId) === String(id)) resetForm();

      alert("Сотрудник удалён");
    } catch (error) {
      console.error(error);
      alert("Не удалось удалить сотрудника");
    }
  };

  const logout = () => {
    localStorage.removeItem("id");
    navigate("/adminsignin", { replace: true });
  };

  const getName = (item) =>
    item.name ||
    item.namesigin ||
    item.nameuser ||
    item.username ||
    "Без имени";

  const getEmail = (item) =>
    item.email || item.emailsigin || item.emailuser || "—";

  return (
    <div className="staff-admin-page">
      <aside className="staff-sidebar">
        <div className="staff-sidebar-logo">
          <span className="staff-logo-icon">
            <span></span>
            <span></span>
            <span></span>
          </span>
          FirstHotel
        </div>

        <div className="staff-sidebar-label">УПРАВЛЕНИЕ</div>

        <button className="staff-sidebar-link active">
          <i className="fa-solid fa-users"></i>
          Персонал
        </button>

        <a href="/admin" className="i1">
          {" "}
          <button className="staff-sidebar-link">
            <i className="fa-solid fa-right-from-bracket"></i>
            Выйти
          </button>
        </a>
      </aside>

      <main className="staff-admin-main">
        <header className="staff-admin-header">
          <div>
            <p>FirstHotel / Администратор</p>
            <h1>Управление персоналом</h1>
          </div>

          <div className="staff-admin-user">
            <span className="staff-admin-avatar">A</span>
            <div>
              <b>Администратор</b>
              <span>Главный администратор</span>
            </div>
          </div>
        </header>

        <section className="staff-admin-content">
          <div className="staff-admin-panel staff-staff-form-panel">
            <div className="staff-panel-heading">
              <div>
                <h2>
                  {editId ? "Редактировать сотрудника" : "Новый сотрудник"}
                </h2>
                <p>Добавляйте сотрудников и назначайте им роли</p>
              </div>
            </div>

            <form className="staff-form-grid" onSubmit={saveStaff}>
              <div className="staff-input-box">
                <label>Имя сотрудника</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Введите имя"
                  required
                />
              </div>

              <div className="staff-input-box">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Введите email"
                  required
                />
              </div>

              <div className="staff-input-box">
                <label>Пароль</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    editId ? "Новый пароль (необязательно)" : "Введите пароль"
                  }
                  required={!editId}
                />
              </div>

              <div className="staff-input-box">
                <label>Роль сотрудника</label>
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    if (e.target.value !== "cleaning") setAssignedHotels([]);
                  }}
                >
                  <option value="padmin">Padmin — бронирования</option>
                  <option value="cleaning">Уборщик</option>
                </select>
              </div>

              {role === "cleaning" && (
                <div className="staff-assignment-box">
                  <h3>Назначить отели</h3>

                  {hotels.map((hotel) => (
                    <label key={hotel.id} className="staff-assignment-option">
                      <input
                        type="checkbox"
                        checked={assignedHotels.includes(String(hotel.id))}
                        onChange={() => toggleHotel(hotel.id)}
                      />
                      <span>
                        {hotel.namehotels || "Отель"} — {hotel.location || "—"}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              <div className="staff-form-grid-actions">
                <button type="submit" className="staff-table-action">
                  {editId ? "Сохранить изменения" : "Добавить сотрудника"}
                </button>

                {editId && (
                  <button
                    type="button"
                    className="staff-cleaning-not-done"
                    onClick={resetForm}
                  >
                    Отмена
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="staff-admin-panel">
            <div className="staff-panel-heading">
              <div>
                <h2>Список сотрудников</h2>
                <p>Всего сотрудников: {staff.length}</p>
              </div>
            </div>

            <div className="staff-table-scroll">
              <table className="staff-admin-table">
                <thead>
                  <tr>
                    <th>СОТРУДНИК</th>
                    <th>EMAIL</th>
                    <th>РОЛЬ</th>
                    <th>ОТЕЛИ</th>
                    <th>ДЕЙСТВИЯ</th>
                  </tr>
                </thead>

                <tbody>
                  {staff.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <b>{getName(item)}</b>
                      </td>
                      <td>{getEmail(item)}</td>
                      <td>
                        <span className="staff-table-status">
                          {item.userstatus === "padmin" ? "Padmin" : "Уборщик"}
                        </span>
                      </td>
                      <td>
                        {item.userstatus === "cleaning"
                          ? item.cleaningHotelIds?.length || 0
                          : "—"}
                      </td>
                      <td>
                        <div className="staff-table-buttons">
                          <button
                            className="staff-table-action"
                            onClick={() => editStaff(item)}
                          >
                            Изменить
                          </button>
                          <button
                            className="staff-table-delete"
                            onClick={() => deleteStaff(item.id)}
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {staff.length === 0 && (
                    <tr>
                      <td colSpan="5" className="staff-table-empty">
                        Сотрудников пока нет
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Adminstaff;
