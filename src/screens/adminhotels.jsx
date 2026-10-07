import { useEffect, useState } from "react";
import Adminbottom from "../components/adminbottom";
import axios from "axios";

function Adminhotels() {
  const [hotels, setHotels] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const [namehotels, setNamehotels] = useState("");
  const [location, setLocation] = useState("Бишкек");
  const [price, setPrice] = useState("");
  const [people, setPeople] = useState("");
  const [avatarhotels, setAvatarhotels] = useState("");

  const [editId, setEditId] = useState(null);


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
      console.error("GET ERROR:", error);
    }
  };

  useEffect(() => {
    getHotels();
  }, []);


  const addHotel = async () => {
    if (
      !namehotels.trim() ||
      !location.trim() ||
      !price.trim() ||
      !people.trim() ||
      !avatarhotels.trim()
    ) {
      alert("Заполните все поля");
      return;
    }

    try {
      const response = await axios({
        method: "POST",
        url: "https://6ac221b73f4ae78f6944db9c.mockapi.io/hotels",
        data: {
          namehotels: namehotels,
          location: location,
          price: price,
          people: people,
          avatarhotels: avatarhotels,
        },
      });

      console.log("POST HOTEL:", response);

      if (response.status === 201) {
        alert("Отель успешно добавлен");

        setShowModal(false);

        setNamehotels("");
        setLocation("Бишкек");
        setPrice("");
        setPeople("");
        setAvatarhotels("");

        setEditId(null);

        getHotels();
      }
    } catch (error) {
      console.error("POST ERROR:", error);
      alert("Ошибка при добавлении отеля");
    }
  };


  const openEdit = (item) => {
    setEditId(item.id);

    setNamehotels(item.namehotels);
    setLocation(item.location);
    setPrice(item.price);
    setPeople(item.people);
    setAvatarhotels(item.avatarhotels);

    setShowModal(true);
  };


  const editHotel = async () => {
    if (
      !namehotels.trim() ||
      !location.trim() ||
      !price.trim() ||
      !people.trim() ||
      !avatarhotels.trim()
    ) {
      alert("Заполните все поля");
      return;
    }

    try {
      const response = await axios({
        method: "PUT",
        url: `https://6ac221b73f4ae78f6944db9c.mockapi.io/hotels/${editId}`,
        data: {
          namehotels: namehotels,
          location: location,
          price: price,
          people: people,
          avatarhotels: avatarhotels,
        },
      });

      console.log("PUT HOTEL:", response);

      if (response.status === 200) {
        alert("Отель изменён");

        setShowModal(false);

        setNamehotels("");
        setLocation("Бишкек");
        setPrice("");
        setPeople("");
        setAvatarhotels("");

        setEditId(null);

        getHotels();
      }
    } catch (error) {
      console.error("PUT ERROR:", error);
      alert("Ошибка при изменении отеля");
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
      console.log("ID:", targetId);

      let response;
      try {
        response = await axios({
          method: "DELETE",
          url: `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${parentId}/hotels/${targetId}`,
        });
      } catch (nestedError) {
        response = await axios({
          method: "DELETE",
          url: `https://6ac221b73f4ae78f6944db9c.mockapi.io/hotels/${targetId}`,
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

      alert(`Ошибка при удалении. Status: ${error.response?.status || "нет"}`);
    }
  };


  const closeModal = () => {
    setShowModal(false);

    setNamehotels("");
    setLocation("Бишкек");
    setPrice("");
    setPeople("");
    setAvatarhotels("");

    setEditId(null);
  };
  const checkUser = async () => {
    try {
      const id = JSON.parse(localStorage.getItem("id"));

      const response = await axios({
        method: "GET",
        url: `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${id}`,
      });

      if (response.status === 200) {
        const user = response.data;

        if (user.userstatus == "user") {
          window.location.href = "/home";
        }

        if (user.userstatus == "admin") {
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

  return (
    <div className="admin-page">

      <Adminbottom />


      <main className="admin-main">

        <header className="admin-top">
          <div>
            <h1>Отели</h1>
            <p>Список Отелей</p>
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
                <h2>Все отели</h2>
                <p>Управление отелями FirstHotel</p>
              </div>

              <button
                className="admin-add-button"
                onClick={() => {
                  setEditId(null);

                  setNamehotels("");
                  setLocation("Бишкек");
                  setPrice("");
                  setPeople("");
                  setAvatarhotels("");

                  setShowModal(true);
                }}
              >
                <i className="fa-solid fa-plus"></i>
                Добавить отель
              </button>
            </div>


            <div className="admin-hotel-grid">
              {hotels.map((item) => (
                <div className="admin-hotel-card" key={item.id}>

                  <div className="admin-hotel-photo">
                    {item.avatarhotels ? (
                      <img src={item.avatarhotels} alt={item.namehotels} />
                    ) : (
                      <i className="fa-solid fa-hotel"></i>
                    )}
                  </div>


                  <div className="admin-hotel-card-content">
                    <h3>{item.namehotels}</h3>

                    <p>
                      <i className="fa-solid fa-location-dot"></i>{" "}
                      {item.location}
                    </p>

                    <div>
                      <strong>{item.price} сом</strong>

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
              ))}


              <button
                className="admin-add-hotel-card"
                onClick={() => {
                  setEditId(null);

                  setNamehotels("");
                  setLocation("Бишкек");
                  setPrice("");
                  setPeople("");
                  setAvatarhotels("");

                  setShowModal(true);
                }}
              >
                <i className="fa-solid fa-plus"></i>

                <strong>Добавить отель</strong>

                <span>Создать новый отель</span>
              </button>
            </div>
          </div>
        </div>
      </main>


      {showModal && (
        <div className="admin-hotel-modal">
          <div className="admin-hotel-modal-content">

            <div className="admin-hotel-modal-header">
              <div>
                <h2>{editId ? "Редактировать отель" : "Добавить отель"}</h2>

                <p>
                  {editId
                    ? "Измените данные отеля"
                    : "Введите данные нового отеля"}
                </p>
              </div>

              <button className="admin-hotel-modal-close" onClick={closeModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>


            <div className="admin-hotel-modal-input">
              <label>Название отеля</label>

              <input
                type="text"
                placeholder="Например: Grand Hotel"
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
              <label>Цена за ночь</label>

              <input
                type="number"
                placeholder="2500"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>


            <div className="admin-hotel-modal-input">
              <label>Количество людей</label>

              <input
                type="number"
                placeholder="Например: 3"
                min="1"
                value={people}
                onChange={(e) => setPeople(e.target.value)}
              />
            </div>


            <div className="admin-hotel-modal-input">
              <label>Фото отеля</label>

              <input
                type="text"
                placeholder="Ссылка на изображение"
                value={avatarhotels}
                onChange={(e) => setAvatarhotels(e.target.value)}
              />
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

                {editId ? "Сохранить изменения" : "Добавить отель"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Adminhotels;
