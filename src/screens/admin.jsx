import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Adminbottom from "../components/adminbottom";
import axios from "axios";

function Admin() {
  const navigate = useNavigate();

  const [page, setPage] = useState("Главная");

  const [hotels, setHotels] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterType, setFilterType] = useState("all"); // "all", "hotel", "hostel"

  const [showModal, setShowModal] = useState(false);

  const [adminData, setAdminData] = useState({
    id: "",
    lastname: "",
    email: "",
    numberphone: "",
    password2: "",
  });

  const getHotels = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: "https://6ac221b73f4ae78f6944db9c.mockapi.io/hotels",
      });

      console.log("GET HOTELS:", response);

      if (response.status === 200) {
        setHotels(response.data);
      }
    } catch (error) {
      console.error("GET HOTELS ERROR:", error);
    }
  };

  const getUsers = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: "https://6ac221b73f4ae78f6944db9c.mockapi.io/data",
      });

      console.log("GET USERS:", response);

      if (response.status === 200) {
        setUsers(response.data);

        const savedAdminId = localStorage.getItem("adminId");
        const adminId = savedAdminId
          ? String(savedAdminId).replaceAll('"', "")
          : "";

        const admin =
          response.data.find((item) => String(item.id) === adminId) ||
          response.data.find((item) => item.userstatus === "admin");

        if (admin) {
          setAdminData({
            id: admin.id,
            lastname: admin.lastname || "",
            email: admin.email || "",
            numberphone: admin.numberphone || "",
            password2: admin.password2 || "",
          });
        }
      }
    } catch (error) {
      console.error("GET USERS ERROR:", error);
    }
  };

  const checkUser = async () => {
    const savedId = localStorage.getItem("id");

    if (!savedId) {
      navigate("/signin", { replace: true });
      return;
    }

    const id = String(savedId).replaceAll('"', "");

    try {
      const response = await axios({
        method: "GET",
        url: `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${id}`,
      });

      if (response.status === 200) {
        const currentUser = response.data;

        if (currentUser.userstatus === "user") {
          localStorage.setItem("userId", JSON.stringify(currentUser.id));
          localStorage.setItem("id", JSON.stringify(currentUser.id));
          navigate("/home", { replace: true });
          return;
        }

        if (currentUser.userstatus === "admin") {
          getHotels();
          getUsers();
          return;
        }

        localStorage.removeItem("id");
        navigate("/signin", { replace: true });
      }
    } catch (error) {
      console.error("CHECK USER ERROR:", error);
      localStorage.removeItem("id");
      navigate("/signin", { replace: true });
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const getBookingType = (booking) => {
    if (booking.type) {
      return String(booking.type).toLowerCase();
    }
    if (booking.hotelType) {
      return String(booking.hotelType).toLowerCase();
    }
    const hotel = hotels.find((h) => String(h.id) === String(booking.hotelId));
    if (hotel && hotel.type) {
      return String(hotel.type).toLowerCase();
    }
    const name = String(booking.name || "").toLowerCase();
    if (name.includes("hostel") || name.includes("хостел")) {
      return "hostel";
    }
    return "hotel";
  };

  const allBookings = users.flatMap((user) =>
    Array.isArray(user.bookhotel) ? user.bookhotel : [],
  );

  const activeBookings = allBookings.filter(
    (item) => item.status === "Активно",
  );

  const completedBookings = allBookings.filter(
    (item) => item.status === "Завершено",
  );

  const totalIncome = allBookings.reduce(
    (total, item) => total + Number(item.allprice || 0),
    0,
  );

  const filteredAllBookings = allBookings.filter((item) => {
    if (filterType === "all") return true;
    return getBookingType(item) === filterType.toLowerCase();
  });

  const handleAdminChange = (e) => {
    setAdminData({
      ...adminData,
      [e.target.name]: e.target.value,
    });
  };

  const saveAdminData = async () => {
    try {
      if (
        !adminData.lastname.trim() ||
        !adminData.email.trim() ||
        !adminData.numberphone.trim() ||
        !adminData.password2.trim()
      ) {
        alert("Заполните все поля");
        return;
      }

      const response = await axios({
        method: "PUT",
        url: `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${adminData.id}`,
        data: {
          ...users.find((item) => String(item.id) === String(adminData.id)),
          lastname: adminData.lastname,
          email: adminData.email,
          numberphone: adminData.numberphone,
          password2: adminData.password2,
        },
      });

      console.log("UPDATE ADMIN:", response);

      if (response.status === 200) {
        alert("Данные администратора изменены!");
        await getUsers();
        setShowModal(false);
      }
    } catch (error) {
      console.error("UPDATE ADMIN ERROR:", error);
      alert("Ошибка при изменении данных");
    }
  };

  return (
    <div className="admin-page">
      <Adminbottom />

      <main className="admin-main">
        <header className="admin-top">
          <div>
            <h1>{page}</h1>
            <p>Панель управления FirstHotel</p>
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

        <button
          className="account-option"
          onClick={() => {
            const userId = localStorage.getItem("userId");

            if (userId) {
              localStorage.setItem("id", userId);
              window.location.href = "/home";
            } else {
              window.location.href = "/adminuplususer";
            }
          }}
        >
          <i className="fa-solid fa-user"></i>

          <span>
            <strong>Пользователь</strong>
            <small>Перейти в пользовательский аккаунт</small>
          </span>

          <i className="fa-solid fa-arrow-right"></i>
        </button>

        <div className="admin-content">
          <div className="admin-stat-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-icon">
                <i className="fa-solid fa-hotel"></i>
              </div>

              <div>
                <span>Всего объектов</span>
                <strong>{hotels.length}</strong>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon">
                <i className="fa-solid fa-calendar-check"></i>
              </div>

              <div>
                <span>Всего заказов</span>
                <strong>{allBookings.length}</strong>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon">
                <i className="fa-solid fa-bed"></i>
              </div>

              <div>
                <span>Активные</span>
                <strong>{activeBookings.length}</strong>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon">
                <i className="fa-solid fa-circle-check"></i>
              </div>

              <div>
                <span>Завершенные</span>
                <strong>{completedBookings.length}</strong>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon">
                <i className="fa-solid fa-money-bill-wave"></i>
              </div>

              <div>
                <span>Общий доход</span>
                <strong>{totalIncome} сом</strong>
              </div>
            </div>
          </div>

          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <h2>Заказы</h2>
                <p>Все бронирования системы</p>
              </div>

              <button
                className="admin-view-button"
                onClick={() => navigate("/adminneworders")}
              >
                Смотреть новые
              </button>
            </div>

            {/* 3 кнопки фильтрации: ВСЕ, hotel, hostel */}
            <div className="admin-filter-bar">
              <button
                type="button"
                className={`admin-filter-btn ${filterType === "all" ? "active" : ""}`}
                onClick={() => setFilterType("all")}
              >
                ВСЕ
              </button>
              <button
                type="button"
                className={`admin-filter-btn ${filterType === "hotel" ? "active" : ""}`}
                onClick={() => setFilterType("hotel")}
              >
                hotel
              </button>
              <button
                type="button"
                className={`admin-filter-btn ${filterType === "hostel" ? "active" : ""}`}
                onClick={() => setFilterType("hostel")}
              >
                hostel
              </button>
            </div>

            <div className="admin-table">
              <div className="admin-table-head">
                <span>Отель / Хостел</span>
                <span>Номер тел.</span>
                <span>Email</span>
                <span>Имя-Фамилия</span>
                <span>Город</span>
                <span>Дата</span>
                <span>Гости / Место</span>
                <span>Сумма</span>
                <span>Статус</span>
              </div>

              {filteredAllBookings.map((item, index) => (
                <div className="admin-table-row" key={index}>
                  <div className="admin-hotel-name">
                    <div className="admin-hotel-icon">
                      <i
                        className={
                          getBookingType(item) === "hostel"
                            ? "fa-solid fa-bed"
                            : "fa-solid fa-hotel"
                        }
                      ></i>
                    </div>

                    <div>
                      <strong>{item.name}</strong>
                      <div
                        style={{
                          display: "flex",
                          gap: "5px",
                          marginTop: "4px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          className={`admin-type-tag ${getBookingType(item)}`}
                        >
                          {getBookingType(item)}
                        </span>
                        {item.place ? (
                          <span className="admin-place-tag">
                            {getBookingType(item) === "hostel"
                              ? `Место ${item.place}`
                              : `Номер ${item.place}`}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <span>
                    <b>{item ? `${item.numberphone || ""}`.trim() : "—"}</b>
                  </span>

                  <span>
                    <b>{item ? `${item.email || ""}`.trim() : "—"}</b>
                  </span>

                  <span>
                    <b>
                      {item.firstname}-{item.lastname}
                    </b>
                  </span>

                  <span>{item.city}</span>

                  <span>
                    {item.date1} — {item.date2}
                  </span>

                  <span>
                    {item.place
                      ? getBookingType(item) === "hostel"
                        ? `Место ${item.place}`
                        : `№ ${item.place}`
                      : `${item.guests} гостей`}
                  </span>

                  <span>{item.allprice} сом</span>

                  <span className={`admin-status ${item.status}`}>
                    {item.status}
                  </span>
                </div>
              ))}

              {filteredAllBookings.length === 0 && (
                <div className="admin-table-row" style={{ padding: "20px 14px" }}>
                  <span>
                    {filterType === "all"
                      ? "Заказов пока нет"
                      : `Заказов в категории "${filterType.toUpperCase()}" пока нет`}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <h2>Отели</h2>
                <p>Управление отелями</p>
              </div>

              <a className="i1" href="/adminhotels">
                <button className="admin-add-button">
                  <i className="fa-solid fa-plus"></i>
                  Добавить отель
                </button>
              </a>
            </div>

            <div className="admin-hotel-grid">
              {hotels.map((item) => (
                <div className="admin-hotel-card" key={item.id}>
                  <div className="admin-hotel-card-image">
                    {item.avatarhotels ? (
                      <img src={item.avatarhotels} alt={item.namehotels} />
                    ) : (
                      <i className="fa-solid fa-hotel"></i>
                    )}
                  </div>

                  <div className="admin-hotel-card-info">
                    <h3>{item.namehotels}</h3>

                    <p>
                      <i className="fa-solid fa-location-dot"></i>
                      {item.location}
                    </p>

                    <div>
                      <strong>{item.price} сом</strong>

                      <span>
                        <i className="fa-solid fa-user"></i>
                        {item.people}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <h2>Настройки</h2>
                <p>Управление данными администратора</p>
              </div>
            </div>

            <div className="admin-settings">
              <div className="admin-settings-icon">
                <i className="fa-solid fa-user-gear"></i>
              </div>

              <div className="admin-settings-info">
                <h3>Данные администратора</h3>
                <p>Редактирование имени, email, телефона и пароля</p>
              </div>

              <button
                className="admin-add-button"
                onClick={() => setShowModal(true)}
              >
                <i className="fa-solid fa-pen"></i>
                Редактировать данные
              </button>
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <div>
                <h2>Редактирование данных</h2>
                <p>Измените данные администратора</p>
              </div>

              <button
                className="admin-modal-close"
                onClick={() => setShowModal(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label>Имя</label>

                <input
                  type="text"
                  name="lastname"
                  value={adminData.lastname}
                  onChange={handleAdminChange}
                  placeholder="Введите имя"
                />
              </div>

              <div className="admin-form-group">
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={adminData.email}
                  onChange={handleAdminChange}
                  placeholder="Введите email"
                />
              </div>

              <div className="admin-form-group">
                <label>Телефон</label>

                <input
                  type="text"
                  name="numberphone"
                  value={adminData.numberphone}
                  onChange={handleAdminChange}
                  placeholder="Введите телефон"
                />
              </div>

              <div className="admin-form-group">
                <label>Пароль</label>

                <input
                  type="password"
                  name="password2"
                  value={adminData.password2}
                  onChange={handleAdminChange}
                  placeholder="Введите пароль"
                />
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                className="admin-modal-cancel"
                onClick={() => setShowModal(false)}
              >
                Отмена
              </button>

              <button className="admin-modal-save" onClick={saveAdminData}>
                <i className="fa-solid fa-check"></i>
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
