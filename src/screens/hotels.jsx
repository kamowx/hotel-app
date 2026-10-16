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
  const [bookedDates, setBookedDates] = useState([]);

  // Получаем данные отеля
  const getHotel = async () => {
    try {
      const response = await axios.get(
        `https://6ac221b73f4ae78f6944db9c.mockapi.io/hotels/${id}`,
      );

      if (response.status === 200) {
        setSelectedHotel(response.data);
      }
    } catch (error) {
      console.error("Ошибка загрузки отеля:", error);
      alert("Не удалось загрузить отель");
    }
  };

  const getBookings = async () => {
    const storedId = localStorage.getItem("id");

    if (!storedId) return;

    const userId = String(storedId).replaceAll('"', "");

    try {
      const response = await axios.get(
        `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${userId}`,
      );

      const bookings = Array.isArray(response.data.bookhotel)
        ? response.data.bookhotel
        : [];

      const activeBookings = bookings.filter(
        (booking) =>
          String(booking.hotelId) === String(id) &&
          booking.status !== "Отменен" &&
          booking.status !== "Отменено",
      );

      setBookedDates(activeBookings);
    } catch (error) {
      console.error("Ошибка загрузки бронирований:", error);
    }
  };

  useEffect(() => {
    const storedId = localStorage.getItem("id");

    if (!storedId) {
      navigate("/signin");
      return;
    }

    getHotel();
    getBookings();
  }, [id]);

  const photos = selectedHotel
    ? Array.isArray(selectedHotel.images)
      ? selectedHotel.images.filter(Boolean)
      : selectedHotel.image
        ? [selectedHotel.image]
        : selectedHotel.avatarhotels
          ? [selectedHotel.avatarhotels]
          : []
    : [];

  // Цена и скидка
  const price = Number(selectedHotel?.price) || 0;

  const discount = Math.min(
    100,
    Math.max(0, Number(selectedHotel?.discount) || 0),
  );

  const finalPrice = Number((price - (price * discount) / 100).toFixed(2));

  const forpriceday =
    date1 && date2 && date2 > date1
      ? Math.round(
          (new Date(date2 + "T00:00:00").getTime() -
            new Date(date1 + "T00:00:00").getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  const allprice = Number((forpriceday * finalPrice).toFixed(2));

  const savedMoney = Number((forpriceday * price - allprice).toFixed(2));

  const getToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const isDateBooked = (date) => {
    if (!date) return false;

    return bookedDates.some(
      (booking) => date >= booking.date1 && date < booking.date2,
    );
  };

  const checkBookedDates = (startDate, endDate) => {
    return bookedDates.some(
      (booking) => startDate < booking.date2 && endDate > booking.date1,
    );
  };

  const prevPhoto = () => {
    setPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const nextPhoto = () => {
    setPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const SaveBooking = async () => {
    const storedId = localStorage.getItem("id");

    if (!storedId) {
      navigate("/signin");
      return;
    }

    const userId = String(storedId).replaceAll('"', "");

    if (!date1) {
      alert("Выберите дату заезда");
      return;
    }

    if (!date2) {
      alert("Выберите дату выезда");
      return;
    }

    if (date2 <= date1) {
      alert("Дата выезда должна быть позже даты заезда");
      return;
    }

    if (Number(guests) > Number(selectedHotel.people)) {
      alert("В отеле недостаточно мест для выбранного количества гостей");
      return;
    }

    if (forpriceday <= 0) {
      alert("Проверьте даты проживания");
      return;
    }

    try {
      const userResponse = await axios.get(
        `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${userId}`,
      );

      const currentUser = userResponse.data;

      const oldBookings = Array.isArray(currentUser.bookhotel)
        ? currentUser.bookhotel
        : [];

      const hasConflict = oldBookings.some(
        (booking) =>
          String(booking.hotelId) === String(selectedHotel.id) &&
          booking.status !== "Отменен" &&
          booking.status !== "Отменено" &&
          date1 < booking.date2 &&
          date2 > booking.date1,
      );

      if (hasConflict) {
        alert("Вы уже бронировали этот отель на эти даты!");
        return;
      }

      // Проверяем баланс
      const balance = Number(currentUser.check) || 0;
      const totalPrice = Number(allprice.toFixed(2));

      if (balance < totalPrice) {
        alert(
          `Недостаточно денег на счёте! Ваш баланс: ${balance} сом. Нужно: ${totalPrice} сом.`,
        );
        return;
      }

      // Создаём бронь
      const newBooking = {
        userId: userId,
        hotelId: selectedHotel.id,
        name: selectedHotel.namehotels,
        city: selectedHotel.location,
        price: price,
        discount: discount,
        discountPrice: finalPrice,
        date1: date1,
        date2: date2,
        forpriceday: forpriceday,
        allprice: totalPrice,
        guests: guests,
        status: "Новый",
        refunded: false,
      };

      const newBalance = Number((balance - totalPrice).toFixed(2));

      const response = await axios.put(
        `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${userId}`,
        {
          ...currentUser,
          check: newBalance,
          bookhotel: [...oldBookings, newBooking],
        },
      );

      if (response.status === 200) {
        setBookedDates((prev) => [...prev, newBooking]);
        setShowPayModal(false);

        alert(
          `Отель успешно забронирован! Списано ${totalPrice} сом. Остаток на счёте: ${newBalance} сом.`,
        );

        setDate1("");
        setDate2("");
        setGuests("1");
      }
    } catch (error) {
      console.error("Ошибка при бронировании:", error);
      alert("Не удалось выполнить бронирование. Попробуйте ещё раз.");
    }
  };

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
      <div className="onboarding home-onboarding">
        <div className="details-header">
          <Link to="/home" className="details-back">
            <i className="fa-solid fa-arrow-left"></i>
          </Link>

          <div className="logo-text">FirstHotel</div>
        </div>

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

        <div className="details-content p-2">
          <div className="details-city">
            <i className="fa-solid fa-location-dot"></i>
            {selectedHotel.location}
          </div>

          <h1>{selectedHotel.namehotels}</h1>

          <div className="details-price">
            {discount > 0 && (
              <div>
                <span className="details-old-price">
                  {price.toLocaleString("ru-RU")} сом
                </span>

                <span className="details-discount">-{discount}%</span>
              </div>
            )}

            <div>
              {finalPrice.toLocaleString("ru-RU", {
                maximumFractionDigits: 2,
              })}{" "}
              сом
              <span>/ ночь</span>
            </div>
          </div>

          <div className="details-divider"></div>

          <h2>Об отеле</h2>

          <p className="details-description">
            {selectedHotel.description ||
              `Отель ${selectedHotel.namehotels} находится в городе ${selectedHotel.location}. Здесь вы можете выбрать даты проживания и забронировать номер.`}
          </p>

          <div className="details-info-row">
            <div className="details-info-icon">
              <i className="fa-solid fa-users"></i>
            </div>

            <div>
              <strong>Количество мест</strong>
              <p>{selectedHotel.people} гостей</p>
            </div>
          </div>

          <div className="details-info-row">
            <div className="details-info-icon">
              <i className="fa-solid fa-calendar-check"></i>
            </div>

            <div>
              <strong>Бронирование</strong>
              <p>Выберите даты вашего проживания</p>
            </div>
          </div>

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

                <div className="details-modal-body">
                  <label>Дата заезда</label>

                  <input
                    type="date"
                    min={getToday()}
                    value={date1}
                    onChange={(e) => {
                      const selectedDate = e.target.value;

                      if (isDateBooked(selectedDate)) {
                        alert("Вы уже бронировали этот день в этом отеле!");
                        setDate1("");
                        setDate2("");
                        return;
                      }

                      setDate1(selectedDate);
                      setDate2("");
                    }}
                  />

                  <label>Дата выезда</label>

                  <input
                    type="date"
                    min={date1 || getToday()}
                    value={date2}
                    disabled={!date1}
                    onChange={(e) => {
                      const selectedDate = e.target.value;

                      if (selectedDate <= date1) {
                        alert("Дата выезда должна быть позже даты заезда");
                        setDate2("");
                        return;
                      }

                      if (checkBookedDates(date1, selectedDate)) {
                        alert("Вы уже бронировали этот период!");
                        setDate2("");
                        return;
                      }

                      setDate2(selectedDate);
                    }}
                  />

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

                  {forpriceday > 0 && date2 > date1 && (
                    <div className="details-total">
                      <div>
                        <span>Количество ночей</span>
                        <strong>{forpriceday}</strong>
                      </div>

                      {discount > 0 && (
                        <>
                          <div>
                            <span>Цена без скидки</span>
                            <strong>
                              {(forpriceday * price).toLocaleString("ru-RU", {
                                maximumFractionDigits: 2,
                              })}{" "}
                              сом
                            </strong>
                          </div>

                          <div>
                            <span>Скидка ({discount}%)</span>
                            <strong>
                              -
                              {savedMoney.toLocaleString("ru-RU", {
                                maximumFractionDigits: 2,
                              })}{" "}
                              сом
                            </strong>
                          </div>
                        </>
                      )}

                      <div>
                        <span>Итого к оплате</span>
                        <strong>
                          {allprice.toLocaleString("ru-RU", {
                            maximumFractionDigits: 2,
                          })}{" "}
                          сом
                        </strong>
                      </div>
                    </div>
                  )}
                </div>

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
