import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function Hotels() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedHotel, setSelectedHotel] = useState(null);

  const [showPayModal, setShowPayModal] = useState(false);
  const [guests, setGuests] = useState("1");
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [photoIndex, setPhotoIndex] = useState(0);

  // =========================
  // GET — получить отель
  // =========================

  const getHotel = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: `https://6ac221b73f4ae78f6944db9c.mockapi.io/hotels/${id}`,
      });

      console.log("GET HOTEL:", response);

      if (response.status === 200) {
        setSelectedHotel(response.data);
      }
    } catch (error) {
      console.error("GET HOTEL ERROR:", error);
    }
  };

  // =========================
  // Проверка пользователя
  // =========================

  useEffect(() => {
    const userId = localStorage.getItem("id");

    if (!userId) {
      navigate("/signin");
      return;
    }

    getHotel();
  }, [id]);

  // =========================
  // Фотографии
  // =========================

  const photos =
    selectedHotel?.images?.length > 0
      ? selectedHotel.images
      : selectedHotel?.avatarhotels
        ? [selectedHotel.avatarhotels]
        : [];

  // =========================
  // Расчёт количества ночей
  // =========================

  const forpriceday =
    date1 && date2
      ? Math.max(
          1,
          Math.round(
            (new Date(date2) - new Date(date1)) / (1000 * 60 * 60 * 24),
          ),
        )
      : 0;

  // =========================
  // Итоговая сумма
  // =========================

  const allprice = selectedHotel
    ? forpriceday * Number(selectedHotel.price)
    : 0;

  // =========================
  // Сегодняшняя дата
  // =========================

  const getToday = () => {
    return new Date().toISOString().split("T")[0];
  };

  // =========================
  // Предыдущее фото
  // =========================

  const prevPhoto = () => {
    setPhotoIndex((index) => (index === 0 ? photos.length - 1 : index - 1));
  };

  // =========================
  // Следующее фото
  // =========================

  const nextPhoto = () => {
    setPhotoIndex((index) => (index === photos.length - 1 ? 0 : index + 1));
  };

  // =========================
  // Сохранение бронирования
  // =========================

  const SaveBooking = async () => {
    // Получаем ID пользователя
    const id = localStorage.getItem("id");

    if (!id) {
      navigate("/signin");
      return;
    }

    // Убираем кавычки
    const userId = String(id).replaceAll('"', "");

    // Проверка даты заезда
    if (!date1) {
      alert("Выберите дату заезда");
      return;
    }

    // Проверка даты выезда
    if (!date2) {
      alert("Выберите дату выезда");
      return;
    }

    // Проверка дат
    if (date2 <= date1) {
      alert("Дата выезда должна быть позже даты заезда");
      return;
    }

    // Проверка количества гостей
    if (Number(guests) > Number(selectedHotel.people)) {
      alert("В отеле недостаточно мест для выбранного количества гостей");
      return;
    }

    // =========================
    // Данные бронирования
    // =========================

    const newBooking = {
      userId: userId,

      hotelId: selectedHotel.id,

      name: selectedHotel.namehotels,

      city: selectedHotel.location,

      price: selectedHotel.price,

      date1: date1,

      date2: date2,

      forpriceday: forpriceday,

      allprice: allprice,

      guests: guests,

      status: "Новый",
    };

    console.log("Новое бронирование:", newBooking);

    try {
      // =========================
      // GET — получаем пользователя
      // =========================

      const userResponse = await axios({
        method: "GET",
        url: `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${userId}`,
      });

      console.log("GET USER:", userResponse);

      if (userResponse.status === 200) {
        const currentUser = userResponse.data;

        // =========================
        // Получаем старые бронирования
        // =========================

        const oldBookings = Array.isArray(currentUser.bookhotel)
          ? currentUser.bookhotel
          : [];

        // =========================
        // Добавляем новое бронирование
        // =========================

        const newBookings = [...oldBookings, newBooking];

        // =========================
        // PUT — сохраняем пользователя
        // =========================

        const response = await axios({
          method: "PUT",
          url: `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${userId}`,
          data: {
            ...currentUser,

            bookhotel: newBookings,
          },
        });

        console.log("PUT BOOKING:", response);

        if (response.status === 200) {
          setShowPayModal(false);

          alert("Отель успешно забронирован!");

          setDate1("");
          setDate2("");
          setGuests("1");
        }
      }
    } catch (error) {
      console.error("Ошибка при бронировании:", error);

      alert("Ошибка при сохранении на сервере");
    }
  };

  // =========================
  // Если отель загружается
  // =========================

  if (!selectedHotel) {
    return (
      <div className="app">
        <div className="onboarding hotel-details-page">
          <h2>Загрузка отеля...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="onboarding hotel-details-page">
        {/* ================= HEADER ================= */}

        <div className="details-header">
          <Link to="/home" className="details-back">
            <i className="fa-solid fa-arrow-left"></i>
          </Link>

          <div className="logo-text">FirstHotel</div>
        </div>

        {/* ================= ФОТО ОТЕЛЯ ================= */}

        <div className="details-gallery">
          {photos.length > 0 ? (
            <img
              src={photos[photoIndex]}
              alt={selectedHotel.namehotels}
              className="details-photo"
            />
          ) : (
            <div className="details-photo-placeholder">
              <i className="fa-solid fa-hotel"></i>

              <span>Фото отеля</span>
            </div>
          )}

          {photos.length > 1 && (
            <>
              <button className="details-photo-arrow prev" onClick={prevPhoto}>
                <i className="fa-solid fa-chevron-left"></i>
              </button>

              <button className="details-photo-arrow next" onClick={nextPhoto}>
                <i className="fa-solid fa-chevron-right"></i>
              </button>

              <div className="details-photo-count">
                {photoIndex + 1} / {photos.length}
              </div>
            </>
          )}
        </div>

        {/* ================= ИНФОРМАЦИЯ ================= */}

        <div className="details-content">
          <div className="details-city">
            <i className="fa-solid fa-location-dot"></i>

            {selectedHotel.location}
          </div>

          <h1>{selectedHotel.namehotels}</h1>

          <div className="details-price">
            {selectedHotel.price} сом
            <span>/ ночь</span>
          </div>

          <div className="details-divider"></div>

          <h2>Об отеле</h2>

          <p className="details-description">
            {selectedHotel.description ||
              `Отель ${selectedHotel.namehotels} находится в городе ${selectedHotel.location}. Здесь вы можете выбрать даты проживания и забронировать номер.`}
          </p>

          {/* ================= КОЛИЧЕСТВО МЕСТ ================= */}

          <div className="details-info-row">
            <div className="details-info-icon">
              <i className="fa-solid fa-users"></i>
            </div>

            <div>
              <strong>Количество мест</strong>

              <p>{selectedHotel.people} гостей</p>
            </div>
          </div>

          {/* ================= БРОНИРОВАНИЕ ================= */}

          <div className="details-info-row">
            <div className="details-info-icon">
              <i className="fa-solid fa-calendar-check"></i>
            </div>

            <div>
              <strong>Бронирование</strong>

              <p>Выберите даты вашего проживания</p>
            </div>
          </div>

          {/* ================= КНОПКА ================= */}

          <button
            className="details-book-button"
            onClick={() => {
              setShowPayModal(true);

              setDate1("");

              setDate2("");

              setGuests("1");
            }}
          >
            Забронировать
          </button>
        </div>

        {/* ================= МОДАЛЬНОЕ ОКНО ================= */}

        {showPayModal && (
          <>
            <div
              className="details-modal-backdrop"
              onClick={() => setShowPayModal(false)}
            ></div>

            <div className="details-modal-wrapper">
              <div
                className="details-modal"
                onClick={(e) => e.stopPropagation()}
              >
                {/* HEADER */}

                <div className="details-modal-header">
                  <div>
                    <h2>Бронирование</h2>

                    <p>{selectedHotel.namehotels}</p>
                  </div>

                  <button
                    className="details-modal-close"
                    onClick={() => setShowPayModal(false)}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>

                {/* BODY */}

                <div className="details-modal-body">
                  {/* ДАТА ЗАЕЗДА */}

                  <label>Дата заезда</label>

                  <input
                    type="date"
                    min={getToday()}
                    value={date1}
                    onChange={(e) => {
                      setDate1(e.target.value);

                      setDate2("");
                    }}
                  />

                  {/* ДАТА ВЫЕЗДА */}

                  <label>Дата выезда</label>

                  <input
                    type="date"
                    min={date1 || getToday()}
                    value={date2}
                    disabled={!date1}
                    onChange={(e) => setDate2(e.target.value)}
                  />

                  {/* ГОСТИ */}

                  <label>Количество гостей</label>

                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                  >
                    {Array.from(
                      {
                        length: Math.max(
                          1,
                          Math.min(4, Number(selectedHotel.people) || 1),
                        ),
                      },
                      (_, index) => index + 1,
                    ).map((number) => (
                      <option key={number} value={number}>
                        {number} {number === 1 ? "гость" : "гостя"}
                      </option>
                    ))}
                  </select>

                  {/* ИТОГ */}

                  {forpriceday > 0 && date2 > date1 && (
                    <div className="details-total">
                      <div>
                        <span>Количество ночей</span>

                        <strong>{forpriceday}</strong>
                      </div>

                      <div>
                        <span>Итого к оплате</span>

                        <strong>{allprice} сом</strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* FOOTER */}

                <div className="details-modal-footer">
                  <button
                    className="details-cancel-button"
                    onClick={() => setShowPayModal(false)}
                  >
                    Отмена
                  </button>

                  <button
                    className="details-confirm-button"
                    onClick={SaveBooking}
                  >
                    Подтвердить бронь
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Hotels;
