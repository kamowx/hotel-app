import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function Armhotels() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);

  // =========================
  // Получаем одно бронирование
  // =========================

  const getBooking = async () => {
    try {
      const userId = localStorage.getItem("id");

      if (!userId) {
        navigate("/signin");
        return;
      }

      // Убираем кавычки
      const cleanUserId = String(userId).replaceAll('"', "");

      // Получаем пользователя
      const response = await axios.get(
        `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${cleanUserId}`,
      );

      console.log("GET USER:", response);

      if (response.status === 200) {
        const currentUser = response.data;

        // Получаем bookhotel
        const bookings = Array.isArray(currentUser.bookhotel)
          ? currentUser.bookhotel
          : [];

        // Получаем бронирование по индексу
        const selectedBooking = bookings[Number(id)];

        if (selectedBooking) {
          setBooking(selectedBooking);
        } else {
          alert("Бронирование не найдено");
          navigate("/armored");
        }
      }
    } catch (error) {
      console.error("Ошибка при получении бронирования:", error);
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

    getBooking();
  }, [id]);

  // =========================
  // Отмена бронирования
  // =========================

  const removeBooking = async () => {
    try {
      const userId = localStorage.getItem("id");

      if (!userId) {
        navigate("/signin");
        return;
      }

      // Убираем кавычки
      const cleanUserId = String(userId).replaceAll('"', "");

      // Получаем пользователя
      const userResponse = await axios.get(
        `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${cleanUserId}`,
      );

      if (userResponse.status === 200) {
        const currentUser = userResponse.data;

        // Получаем старые бронирования
        const oldBookings = Array.isArray(currentUser.bookhotel)
          ? currentUser.bookhotel
          : [];

        // Удаляем бронирование по индексу
        const newBookings = oldBookings.filter(
          (_, index) => index !== Number(id),
        );

        // Обновляем пользователя
        const response = await axios.put(
          `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${cleanUserId}`,
          {
            ...currentUser,
            bookhotel: newBookings,
          },
        );

        console.log("PUT BOOKING:", response);

        if (response.status === 200) {
          alert("Бронирование отменено!");

          navigate("/armored");
        }
      }
    } catch (error) {
      console.error("Ошибка при отмене бронирования:", error);

      alert("Не удалось отменить бронирование");
    }
  };

  // =========================
  // Вызов уборки
  // =========================

  const callCleaning = () => {
    alert("Ожидайте!");
  };

  // =========================
  // Если бронирование загружается
  // =========================

  if (!booking) {
    return (
      <div className="app">
        <div className="onboarding armhotel-page">
          <div className="armhotel-loading">
            <p>Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="onboarding armhotel-page">
        {/* HEADER */}

        <div className="armhotel-header">
          <Link to="/armored" className="armhotel-back">
            <i className="fa-solid fa-arrow-left"></i>
          </Link>

          <div className="logo-text">FirstHotel</div>
        </div>

        {/* ФОТО */}

        <div className="armhotel-image">
          {booking.avatarhotels ? (
            <img src={booking.avatarhotels} alt={booking.name} />
          ) : (
            <i className="fa-solid fa-hotel"></i>
          )}
        </div>

        {/* ИНФОРМАЦИЯ */}

        <div className="armhotel-content">
          <div className="armhotel-city">
            <i className="fa-solid fa-location-dot"></i>

            {booking.city}
          </div>

          <h1>{booking.name}</h1>

          <div className="armhotel-price">
            {booking.price} сом
            <span>/ ночь</span>
          </div>

          <p>Статус: {booking.status}</p>

          <div className="armhotel-divider"></div>

          {/* ИНФОРМАЦИЯ О БРОНИРОВАНИИ */}

          <h2>Информация о бронировании</h2>

          <div className="armhotel-info">
            <div className="armhotel-info-row">
              <div className="armhotel-info-icon">
                <i className="fa-solid fa-calendar-check"></i>
              </div>

              <div>
                <strong>Дата заезда</strong>

                <p>{booking.date1}</p>
              </div>
            </div>

            <div className="armhotel-info-row">
              <div className="armhotel-info-icon">
                <i className="fa-solid fa-calendar-xmark"></i>
              </div>

              <div>
                <strong>Дата выезда</strong>

                <p>{booking.date2}</p>
              </div>
            </div>

            <div className="armhotel-info-row">
              <div className="armhotel-info-icon">
                <i className="fa-solid fa-moon"></i>
              </div>

              <div>
                <strong>Количество ночей</strong>

                <p>{booking.forpriceday}</p>
              </div>
            </div>

            <div className="armhotel-info-row">
              <div className="armhotel-info-icon">
                <i className="fa-solid fa-users"></i>
              </div>

              <div>
                <strong>Количество гостей</strong>

                <p>{booking.guests}</p>
              </div>
            </div>
          </div>

          {/* ОБЩАЯ СУММА */}

          <div className="armhotel-total">
            <span>Общая сумма</span>

            <strong>{booking.allprice} сом</strong>
          </div>

          {/* КНОПКИ */}

          <button className="armhotel-cancel-button" onClick={removeBooking}>
            <i className="fa-solid fa-trash"></i>
            Отменить бронирование
          </button>
        </div>
      </div>
    </div>
  );
}

export default Armhotels;
