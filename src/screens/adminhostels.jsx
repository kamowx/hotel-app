import { useEffect, useState } from "react";
import Adminbottom from "../components/adminbottom";
import axios from "axios";

const HOTELS_URL = "https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/hotels";

const USERS_URL = "https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data";

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function Adminhostels() {
  const [hotels, setHotels] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);

  const [namehotels, setNamehotels] = useState("");
  const [location, setLocation] = useState("Бишкек");
  const [price, setPrice] = useState("");
  const [people, setPeople] = useState("");
  const [avatarhotels, setAvatarhotels] = useState("");
  const [discount, setDiscount] = useState("0");
  const [discountEndDate, setDiscountEndDate] = useState("");
  const [hotelType, setHotelType] = useState("hostel");

  const [editId, setEditId] = useState(null);

  const discountPrice = Number(price) * (1 - Number(discount || 0) / 100);

  // Получение списка хостелов и проверка скидок
  const getHotels = async () => {
    try {
      const response = await axios.get(HOTELS_URL);

      console.log("GET HOSTELS:", response);

      if (response.status === 200) {
        const todayDate = getTodayDate();

        const updatedHotels = await Promise.all(
          response.data.map(async (item) => {
            if (
              Number(item.discount) > 0 &&
              item.discountEndDate &&
              item.discountEndDate < todayDate
            ) {
              try {
                const updateResponse = await axios.put(
                  `${HOTELS_URL}/${item.id}`,
                  {
                    ...item,
                    discount: "0",
                  },
                );

                return updateResponse.data;
              } catch (error) {
                console.error("Ошибка сброса скидки:", error);
                return item;
              }
            }

            return item;
          }),
        );

        setHotels(updatedHotels);
      }
    } catch (error) {
      console.error("GET HOSTELS ERROR:", error);
    }
  };

  useEffect(() => {
    getHotels();

    const interval = setInterval(() => {
      getHotels();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Проверка пользователя
  const checkUser = async () => {
    try {
      const savedId = localStorage.getItem("id");

      if (!savedId) {
        window.location.href = "/signin";
        return;
      }

      const id = String(savedId).replaceAll('"', "");

      const response = await axios.get(`${USERS_URL}/${id}`);

      if (response.status === 200) {
        const user = response.data;

        if (user.userstatus === "padmin") {
          window.location.href = "/padmin";
          return;
        }

        if (user.userstatus === "cleaning") {
          window.location.href = "/cleaning";
          return;
        }

        if (user.userstatus === "user") {
          window.location.href = "/home";
          return;
        }

        if (user.userstatus === "admin") {
          console.log("Это администратор");
        }
      }
    } catch (error) {
      console.error("CHECK USER ERROR:", error);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  // Очистка формы
  const resetForm = () => {
    setNamehotels("");
    setLocation("Бишкек");
    setPrice("");
    setPeople("");
    setAvatarhotels("");
    setDiscount("0");
    setDiscountEndDate("");
    setHotelType("hostel");
    setEditId(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowModal2(false);
    resetForm();
  };

  const validateForm = () => {
    if (
      !namehotels.trim() ||
      !location.trim() ||
      !price.trim() ||
      !people.trim() ||
      !avatarhotels.trim()
    ) {
      alert("Заполните все поля");
      return false;
    }

    if (
      Number(price) <= 0 ||
      Number(people) <= 0 ||
      Number(discount) < 0 ||
      Number(discount) > 100
    ) {
      alert("Проверьте цену, количество людей и скидку от 0 до 100%");
      return false;
    }

    if (Number(discount) > 0 && !discountEndDate) {
      alert("Укажите дату окончания скидки");
      return false;
    }

    if (Number(discount) > 0 && discountEndDate < getTodayDate()) {
      alert("Дата окончания скидки не может быть в прошлом");
      return false;
    }

    return true;
  };

  // Добавление хостела
  const addHotel = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post(HOTELS_URL, {
        namehotels: namehotels,
        location: location,
        price: price,
        people: people,
        avatarhotels: avatarhotels,
        discount: discount,
        discountEndDate: Number(discount) > 0 ? discountEndDate : "",
        type: "hostel",
      });

      console.log("POST HOSTEL:", response);

      if (response.status === 201) {
        alert("Хостел успешно добавлен");

        setShowModal(false);
        setShowModal2(false);
        resetForm();
        getHotels();
      }
    } catch (error) {
      console.error("POST HOSTEL ERROR:", error);
      alert("Ошибка при добавлении хостела");
    }
  };

  const openEdit = (item) => {
    setEditId(item.id);

    setNamehotels(item.namehotels || "");
    setLocation(item.location || "Бишкек");
    setPrice(String(item.price ?? ""));
    setPeople(String(item.people ?? ""));
    setAvatarhotels(item.avatarhotels || "");
    setDiscount(String(item.discount ?? "0"));
    setDiscountEndDate(item.discountEndDate || "");
    setHotelType("hostel");

    setShowModal(false);
    setShowModal2(true);
  };

  const editHotel = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.put(`${HOTELS_URL}/${editId}`, {
        namehotels: namehotels,
        location: location,
        price: price,
        people: people,
        avatarhotels: avatarhotels,
        discount: discount,
        discountEndDate: Number(discount) > 0 ? discountEndDate : "",
        type: "hostel",
      });

      console.log("PUT HOSTEL:", response);

      if (response.status === 200) {
        alert("Хостел изменён");

        setShowModal(false);
        setShowModal2(false);
        resetForm();
        getHotels();
      }
    } catch (error) {
      console.error("PUT HOSTEL ERROR:", error);
      alert("Ошибка при изменении хостела");
    }
  };
  const deleteHotel = async (id) => {
    const confirmDelete = window.confirm(
      "Вы действительно хотите удалить этот отель?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const hotel = hotels.find((item) => String(item.id) === String(id));

      const targetId = hotel ? hotel.id : id;
      const parentId = hotel?.dataId || 1;

      console.log("Выбранный отель:", hotel);
      console.log("ID отеля:", targetId);

      let response;

      try {
        response = await axios({
          method: "DELETE",
          url: `https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data/${parentId}/hotels/${targetId}`,
        });
      } catch (nestedError) {
        console.log("Первый запрос не сработал:", nestedError);

        response = await axios({
          method: "DELETE",
          url: `https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/hotels/${targetId}`,
        });
      }

      console.log("DELETE RESPONSE:", response);

      if (response.status === 200 || response.status === 204) {
        alert("Отель удалён");

        setHotels((prevHotels) =>
          prevHotels.filter((item) => String(item.id) !== String(targetId)),
        );
      }
    } catch (error) {
      console.error("DELETE ERROR:", error);
      console.error("DELETE STATUS:", error.response?.status);
      console.error("DELETE DATA:", error.response?.data);

      alert(
        `Ошибка при удалении. Status: ${
          error.response?.status || "нет ответа от сервера"
        }`,
      );
    }
  };

  return (
    <div className="admin-page">
      <Adminbottom />

      <main className="admin-main">
        <header className="admin-top">
          <div>
            <h1>Хостелы</h1>
            <p>Управление хостелами</p>
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
                <h2>Все хостелы</h2>
                <p>Список добавленных хостелов</p>
              </div>

              <button
                className="admin-add-button"
                onClick={() => {
                  resetForm();
                  setShowModal(false);
                  setShowModal2(true);
                }}
              >
                <i className="fa-solid fa-plus"></i>
                Добавить хостел
              </button>
            </div>

            <div className="admin-hotel-grid">
              {hotels
                .filter((item) => item.type === "hostel")
                .map((item) => {
                  const hostelPrice = Number(item.price) || 0;

                  const hostelDiscount = Math.min(
                    100,
                    Math.max(0, Number(item.discount) || 0),
                  );

                  const finalPrice = hostelPrice * (1 - hostelDiscount / 100);

                  return (
                    <div className="admin-hotel-card" key={item.id}>
                      <div className="admin-hotel-photo">
                        {item.avatarhotels ? (
                          <img src={item.avatarhotels} alt={item.namehotels} />
                        ) : (
                          <i className="fa-solid fa-bed"></i>
                        )}
                      </div>

                      <div className="admin-hotel-card-content">
                        <h3>{item.namehotels}</h3>

                        <p>
                          <i className="fa-solid fa-location-dot"></i>{" "}
                          {item.location}
                        </p>

                        <div>
                          {hostelDiscount > 0 ? (
                            <>
                              <strong>
                                {finalPrice.toLocaleString("ru-RU")} сом
                              </strong>

                              <span
                                style={{
                                  textDecoration: "line-through",
                                  marginLeft: "8px",
                                  color: "#888",
                                }}
                              >
                                {hostelPrice.toLocaleString("ru-RU")} сом
                              </span>

                              <span
                                style={{
                                  marginLeft: "8px",
                                  color: "#e53935",
                                  fontWeight: "bold",
                                }}
                              >
                                -{hostelDiscount}%
                              </span>

                              {item.discountEndDate && (
                                <p>Скидка до: {item.discountEndDate}</p>
                              )}
                            </>
                          ) : (
                            <strong>
                              {hostelPrice.toLocaleString("ru-RU")} сом
                            </strong>
                          )}

                          <span> / ночь</span>
                        </div>

                        <p>
                          <i className="fa-solid fa-users"></i> До {item.people}{" "}
                          человек
                        </p>

                        <div className="admin-hotel-card-buttons">
                          <button
                            className="admin-hotel-edit-button"
                            onClick={() => openEdit(item)}
                          >
                            <i className="fa-solid fa-pen"></i>
                            Изменить
                          </button>

                          <button
                            className="admin-hotel-delete-button"
                            onClick={() => deleteHotel(item.id)}
                          >
                            <i className="fa-solid fa-trash"></i>
                            Удалить
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

              <button
                className="admin-add-hotel-card"
                onClick={() => {
                  resetForm();
                  setShowModal(false);
                  setShowModal2(true);
                }}
              >
                <i className="fa-solid fa-plus"></i>
                <strong>Добавить хостел</strong>
                <span>Создать новый хостел</span>
              </button>
            </div>

            {hotels.filter((item) => item.type === "hostel").length === 0 && (
              <p style={{ textAlign: "center", padding: "20px" }}>
                Хостелов пока нет. Добавьте первый хостел.
              </p>
            )}
          </div>
        </div>
      </main>

      {showModal2 && (
        <div className="admin-hotel-modal">
          <div className="admin-hotel-modal-content">
            <div className="admin-hotel-modal-header">
              <div>
                <h2>{editId ? "Редактировать хостел" : "Добавить хостел"}</h2>

                <p>
                  {editId
                    ? "Измените данные хостела"
                    : "Введите данные нового хостела"}
                </p>
              </div>

              <button className="admin-hotel-modal-close" onClick={closeModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="admin-hotel-modal-input">
              <label>Название хостела</label>

              <input
                type="text"
                placeholder="Например: City Hostel"
                value={namehotels}
                onChange={(e) => setNamehotels(e.target.value)}
              />
            </div>

            <div className="admin-hotel-modal-input">
              <label>Место</label>

              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="Бишкек">Бишкек</option>
                <option value="Ош">Ош</option>
              </select>
            </div>

            <div className="admin-hotel-modal-input">
              <label>Цена за ночь (сом)</label>

              <input
                type="number"
                placeholder="1000"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="admin-hotel-modal-input">
              <label>Количество людей</label>

              <input
                type="number"
                placeholder="Например: 4"
                min="1"
                value={people}
                onChange={(e) => setPeople(e.target.value)}
              />
            </div>

            <div className="admin-hotel-modal-input">
              <label>Фото хостела</label>

              <input
                type="text"
                placeholder="Ссылка на изображение"
                value={avatarhotels}
                onChange={(e) => setAvatarhotels(e.target.value)}
              />
            </div>

            <div className="admin-hotel-modal-input">
              <label>Скидка (%)</label>

              <input
                type="number"
                placeholder="Например: 20"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => {
                  const value = e.target.value;

                  if (
                    value === "" ||
                    (Number(value) >= 0 && Number(value) <= 100)
                  ) {
                    setDiscount(value);
                  }
                }}
              />
            </div>

            <div className="admin-hotel-modal-input">
              <label>Дата окончания скидки</label>

              <input
                type="date"
                min={getTodayDate()}
                value={discountEndDate}
                onChange={(e) => setDiscountEndDate(e.target.value)}
              />

              <small>Скидка действует до указанного дня включительно.</small>
            </div>

            <div
              className="admin-hotel-modal-input"
              style={{
                padding: "15px",
                background: "#f5f8f2",
                borderRadius: "8px",
              }}
            >
              <label>Цена со скидкой</label>

              {Number(price) > 0 ? (
                <>
                  <p style={{ margin: "8px 0", color: "#666" }}>
                    Цена: {Number(price).toLocaleString("ru-RU")} сом
                  </p>

                  <h3 style={{ margin: "8px 0", color: "#2e7d32" }}>
                    {discountPrice.toLocaleString("ru-RU")} сом / ночь
                  </h3>

                  <p style={{ margin: 0, color: "#666" }}>
                    Экономия:{" "}
                    {(Number(price) - discountPrice).toLocaleString("ru-RU")}{" "}
                    сом
                  </p>
                </>
              ) : (
                <p>Введите цену хостела</p>
              )}
            </div>

            <div className="admin-hotel-modal-buttons">
              <button className="admin-hotel-modal-cancel" onClick={closeModal}>
                Отмена
              </button>

              <button
                className="admin-hotel-modal-save"
                onClick={editId ? editHotel : addHotel}
              >
                <i
                  className={editId ? "fa-solid fa-pen" : "fa-solid fa-plus"}
                ></i>

                {editId ? "Сохранить изменения" : "Добавить хостел"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Adminhostels;
