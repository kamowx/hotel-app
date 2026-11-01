import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const USERS_URL = "https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data";
const HOTELS_URL = "https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/hotels";

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function Hotels() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);

  const [guests, setGuests] = useState("1");
  const [selectedPlace, setSelectedPlace] = useState(1);
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [photoIndex, setPhotoIndex] = useState(0);

  const [bookedDates, setBookedDates] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);

  // Состояния промокода
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");

  // Пользователь: ищем по Firebase uid
  const allUser = async () => {
    try {
      const response = await axios.get(USERS_URL);

      console.log("ВСЕ ДАННЫЕ:", response.data);

      if (response.status === 200 && Array.isArray(response.data)) {
        setUsers(response.data);

        const savedId = localStorage.getItem("uid");

        if (savedId) {
          const cleanId = String(savedId).replaceAll('"', "");

          const currentUser = response.data.find(
            (item) => String(item.uid) === cleanId,
          );

          if (currentUser) {
            setUser(currentUser);
          } else {
            setUser(null);
            console.error("Пользователь с таким uid не найден");
          }
        }
      }
    } catch (error) {
      console.error("ОШИБКА ПОЛУЧЕНИЯ ПОЛЬЗОВАТЕЛЯ:", error);
    }
  };

  useEffect(() => {
    allUser();
  }, []);

  // Получаем данные отеля
  const getHotel = async () => {
    try {
      const response = await axios.get(`${HOTELS_URL}/${id}`);

      if (response.status === 200) {
        setSelectedHotel(response.data);
      }
    } catch (error) {
      console.error("Ошибка загрузки отеля:", error);
      alert("Не удалось загрузить отель");
    }
  };

  // Получаем бронирования всех пользователей для данного отеля
  const getBookings = async () => {
    try {
      const response = await axios.get(USERS_URL);

      if (response.status === 200 && Array.isArray(response.data)) {
        const allBookings = response.data.flatMap((u) =>
          Array.isArray(u.bookhotel)
            ? u.bookhotel.map((b) => ({
                ...b,
                bookedByUserId: u.id,
              }))
            : [],
        );

        const activeBookings = allBookings.filter(
          (booking) =>
            String(booking.hotelId) === String(id) &&
            booking.status !== "Отменен" &&
            booking.status !== "Отменено",
        );

        setBookedDates(activeBookings);
      }
    } catch (error) {
      console.error("Ошибка загрузки бронирований:", error);
    }
  };

  useEffect(() => {
    const storedId = localStorage.getItem("uid");

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

  // Вместимость и категория (отель или хостел)
  const totalPlaces = Math.max(1, Number(selectedHotel?.people) || 1);
  const isHostel = selectedHotel?.type === "hostel";

  // Цена и скидка
  const price = Number(selectedHotel?.price) || 0;

  const discount = Math.min(
    100,
    Math.max(0, Number(selectedHotel?.discount) || 0),
  );

  const finalPrice = Number((price - (price * discount) / 100).toFixed(2));

  // Проверяем, действует ли промокод
  const promoAvailable =
    Boolean(selectedHotel?.promo) &&
    Boolean(selectedHotel?.pricepromo) &&
    Boolean(selectedHotel?.promodate) &&
    selectedHotel.promodate >= getToday() &&
    Number(selectedHotel.pricepromo) > 0 &&
    Number(selectedHotel.pricepromo) < price;

  // Цена с учётом применённого промокода
  const bookingPrice =
    appliedPromo && promoAvailable
      ? Number(selectedHotel.pricepromo)
      : finalPrice;

  // Расчёт количества ночей
  const forpriceday =
    date1 && date2 && date2 > date1
      ? Math.round(
          (new Date(date2 + "T00:00:00").getTime() -
            new Date(date1 + "T00:00:00").getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  // Итоговая сумма
  const allprice = Number((forpriceday * bookingPrice).toFixed(2));

  const savedMoney = Number((forpriceday * price - allprice).toFixed(2));

  // Применение промокода
  const applyPromo = () => {
    if (!promoAvailable) {
      setAppliedPromo(false);
      setPromoMessage("Срок действия промокода закончился или он недоступен.");
      return;
    }

    if (!promoCode.trim()) {
      setPromoMessage("Введите промокод");
      return;
    }

    if (
      promoCode.trim().toLowerCase() ===
      String(selectedHotel.promo).trim().toLowerCase()
    ) {
      setAppliedPromo(true);
      setPromoMessage("Промокод успешно применён!");
    } else {
      setAppliedPromo(false);
      setPromoMessage("Неправильный промокод");
    }
  };

  // Удаление применённого промокода
  const removePromo = () => {
    setAppliedPromo(false);
    setPromoCode("");
    setPromoMessage("");
  };

  // Проверка занятости конкретного места на указанные даты
  const isPlaceBooked = (placeNum, startDate = date1, endDate = date2) => {
    if (!startDate || !endDate) return false;

    return bookedDates.some((booking) => {
      const bookedP = Number(
        booking.place || booking.room || booking.placeNumber || 1,
      );

      const isSamePlace = bookedP === Number(placeNum);

      const isDateOverlap =
        startDate < booking.date2 && endDate > booking.date1;

      return isSamePlace && isDateOverlap;
    });
  };

  // Проверка: заняты ли все места на дату
  const isDateFullyBooked = (date) => {
    if (!date) return false;

    const occupiedPlaces = new Set();

    bookedDates.forEach((b) => {
      if (date >= b.date1 && date < b.date2) {
        const p = Number(b.place || b.room || b.placeNumber || 1);
        occupiedPlaces.add(p);
      }
    });

    return occupiedPlaces.size >= totalPlaces;
  };

  // Проверка: заняты ли все места на весь период
  const isRangeFullyBooked = (startDate, endDate) => {
    if (!startDate || !endDate) return false;

    for (let p = 1; p <= totalPlaces; p++) {
      if (!isPlaceBooked(p, startDate, endDate)) {
        return false;
      }
    }

    return true;
  };

  const prevPhoto = () => {
    setPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const nextPhoto = () => {
    setPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  // Сохранение бронирования
  const SaveBooking = async () => {
    const storedId = localStorage.getItem("uid");

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

    if (!selectedPlace) {
      alert(
        isHostel
          ? "Выберите место для бронирования"
          : "Выберите номер для бронирования",
      );
      return;
    }

    // Проверяем, свободно ли выбранное место
    if (isPlaceBooked(selectedPlace, date1, date2)) {
      alert(
        isHostel
          ? `Место ${selectedPlace} уже занято на выбранные даты другим человеком! Пожалуйста, выберите другое свободное место.`
          : `Номер ${selectedPlace} уже занят на выбранные даты другим человеком! Пожалуйста, выберите другой номер.`,
      );
      return;
    }

    if (forpriceday <= 0) {
      alert("Проверьте даты проживания");
      return;
    }

    try {
      // Получаем всех пользователей и находим по Firebase uid
      const usersResponse = await axios.get(USERS_URL);

      const currentUser = usersResponse.data.find(
        (item) => String(item.uid) === userId,
      );

      if (!currentUser) {
        alert("Пользователь не найден");
        console.error("Пользователь с таким uid не найден:", userId);
        return;
      }

      const numberphone = currentUser.numberphone || "";
      const firstname = currentUser.firstname || "";
      const lastname = currentUser.lastname || "";
      const email = currentUser.email || "";

      const oldBookings = Array.isArray(currentUser.bookhotel)
        ? currentUser.bookhotel
        : [];

      // Проверяем конфликт для того же места у текущего пользователя
      const hasConflict = oldBookings.some((booking) => {
        const bookedP = Number(
          booking.place || booking.room || booking.placeNumber || 1,
        );

        return (
          String(booking.hotelId) === String(selectedHotel.id) &&
          bookedP === Number(selectedPlace) &&
          booking.status !== "Отменен" &&
          booking.status !== "Отменено" &&
          date1 < booking.date2 &&
          date2 > booking.date1
        );
      });

      if (hasConflict) {
        alert(
          isHostel
            ? `Вы уже бронировали место ${selectedPlace} на эти даты!`
            : `Вы уже бронировали номер ${selectedPlace} на эти даты!`,
        );
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
        numberphone: numberphone,
        firstname: firstname,
        lastname: lastname,
        email: email,
        hotelId: selectedHotel.id,
        name: selectedHotel.namehotels,
        city: selectedHotel.location,
        avatarhotels: selectedHotel.avatarhotels || "",
        price: price,
        discount: discount,
        discountPrice: finalPrice,

        // Информация о промокоде
        promo: appliedPromo ? selectedHotel.promo : "",
        pricepromo: appliedPromo ? Number(selectedHotel.pricepromo) : "",
        promoApplied: appliedPromo,

        // Фактическая цена за ночь
        bookingPrice: bookingPrice,

        date1: date1,
        date2: date2,
        forpriceday: forpriceday,
        allprice: totalPrice,
        guests: guests || "1",
        place: Number(selectedPlace),
        room: Number(selectedPlace),
        type: selectedHotel.type || "hotel",
        status: "Новый",
        refunded: false,
      };

      const newBalance = Number((balance - totalPrice).toFixed(2));

      // В URL используем настоящий id записи пользователя в MockAPI
      const response = await axios.put(`${USERS_URL}/${currentUser.id}`, {
        ...currentUser,
        check: newBalance,
        bookhotel: [...oldBookings, newBooking],
      });

      if (response.status === 200) {
        setUser(response.data);
        setBookedDates((prev) => [...prev, newBooking]);
        setShowPayModal(false);

        alert(
          `${isHostel ? `Место ${selectedPlace}` : `Номер ${selectedPlace}`} успешно забронирован! Списано ${totalPrice} сом. Остаток на счёте: ${newBalance} сом.`,
        );

        setDate1("");
        setDate2("");
        setGuests("1");
        setSelectedPlace(1);
        removePromo();

        getBookings();
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

          {/* Информация о доступном промокоде */}
          {promoAvailable && (
            <div
              style={{
                marginTop: "15px",
                padding: "12px",
                background: "#f5f8f2",
                borderRadius: "8px",
              }}
            >
              <strong>Есть специальное предложение!</strong>

              <p style={{ margin: "6px 0" }}>
                Используйте промокод и забронируйте по цене{" "}
                <strong>
                  {Number(selectedHotel.pricepromo).toLocaleString("ru-RU")} сом
                </strong>{" "}
                за ночь.
              </p>

              <small>Промокод действует до: {selectedHotel.promodate}</small>
            </div>
          )}

          <div className="details-divider"></div>

          <h2>Об отеле</h2>

          <p className="details-description">
            {selectedHotel.description ||
              `${isHostel ? "Хостел" : "Отель"} ${selectedHotel.namehotels} находится в городе ${selectedHotel.location}. Здесь вы можете выбрать даты проживания и забронировать место.`}
          </p>

          <div className="details-info-row">
            <div className="details-info-icon">
              <i
                className={isHostel ? "fa-solid fa-bed" : "fa-solid fa-users"}
              ></i>
            </div>

            <div>
              <strong>Количество мест</strong>
              <p>
                {selectedHotel.people} {isHostel ? "койко-мест" : "мест"}
              </p>
            </div>
          </div>

          <div className="details-info-row">
            <div className="details-info-icon">
              <i className="fa-solid fa-calendar-check"></i>
            </div>

            <div>
              <strong>Бронирование</strong>
              <p>Выберите даты и конкретное место</p>
            </div>
          </div>

          <button
            className="details-book-button"
            onClick={() => {
              setShowPayModal(true);
              setDate1("");
              setDate2("");
              setGuests("1");
              setSelectedPlace(1);
              removePromo();
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

                      if (isDateFullyBooked(selectedDate)) {
                        alert(
                          "На эту дату все места в этом объекте уже заняты!",
                        );
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

                      if (isRangeFullyBooked(date1, selectedDate)) {
                        alert("На этот период все места уже забронированы!");
                        setDate2("");
                        return;
                      }

                      setDate2(selectedDate);

                      // Если место занято на новые даты,
                      // выбираем первое свободное место
                      if (isPlaceBooked(selectedPlace, date1, selectedDate)) {
                        const firstFree = Array.from(
                          { length: totalPlaces },
                          (_, i) => i + 1,
                        ).find((p) => !isPlaceBooked(p, date1, selectedDate));

                        if (firstFree) {
                          setSelectedPlace(firstFree);
                        }
                      }
                    }}
                  />

                  {/* Поле для промокода */}
                  {promoAvailable && (
                    <div
                      style={{
                        marginTop: "15px",
                        padding: "12px",
                        background: "#f5f8f2",
                        borderRadius: "8px",
                      }}
                    >
                      <label>Промокод</label>

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginTop: "8px",
                        }}
                      >
                        <input
                          type="text"
                          placeholder="Введите промокод"
                          value={promoCode}
                          disabled={appliedPromo}
                          onChange={(e) => {
                            setPromoCode(e.target.value);
                            setPromoMessage("");
                          }}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            margin: 0,
                          }}
                        />

                        {!appliedPromo ? (
                          <button
                            type="button"
                            onClick={applyPromo}
                            style={{
                              padding: "10px 14px",
                              border: "none",
                              borderRadius: "6px",
                              background: "#9fdb12",
                              color: "#222",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Применить
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={removePromo}
                            style={{
                              padding: "10px 14px",
                              border: "none",
                              borderRadius: "6px",
                              background: "#eeeeee",
                              color: "#333",
                              cursor: "pointer",
                            }}
                          >
                            Отменить
                          </button>
                        )}
                      </div>

                      {promoMessage && (
                        <p
                          style={{
                            margin: "8px 0 0",
                            color: appliedPromo ? "#2e7d32" : "#e53935",
                            fontSize: "13px",
                          }}
                        >
                          {promoMessage}
                        </p>
                      )}

                      {appliedPromo && (
                        <p
                          style={{
                            margin: "8px 0 0",
                            color: "#2e7d32",
                            fontWeight: 600,
                          }}
                        >
                          Промокод применён! Цена:{" "}
                          {Number(selectedHotel.pricepromo).toLocaleString(
                            "ru-RU",
                          )}{" "}
                          сом / ночь
                        </p>
                      )}
                    </div>
                  )}

                  {/* Выбор конкретного места / номера */}
                  <div className="booking-place-selector">
                    <label className="booking-section-label">
                      {isHostel
                        ? "Выберите место (койку):"
                        : "Выберите номер комнаты:"}
                    </label>

                    <div className="booking-places-grid">
                      {Array.from(
                        { length: totalPlaces },
                        (_, index) => index + 1,
                      ).map((placeNum) => {
                        const occupied =
                          date1 && date2 ? isPlaceBooked(placeNum) : false;

                        const isSelected = Number(selectedPlace) === placeNum;

                        return (
                          <button
                            key={placeNum}
                            type="button"
                            disabled={occupied}
                            onClick={() => setSelectedPlace(placeNum)}
                            className={`booking-place-btn ${
                              isSelected ? "selected" : ""
                            } ${occupied ? "occupied" : "available"}`}
                          >
                            <div className="place-btn-icon">
                              <i
                                className={
                                  isHostel
                                    ? "fa-solid fa-bed"
                                    : "fa-solid fa-door-closed"
                                }
                              ></i>
                            </div>

                            <strong className="place-btn-title">
                              {isHostel
                                ? `Место ${placeNum}`
                                : `Номер ${placeNum}`}
                            </strong>

                            <span
                              className={`place-btn-status ${
                                occupied
                                  ? "occupied"
                                  : isSelected
                                    ? "selected"
                                    : "free"
                              }`}
                            >
                              {occupied
                                ? "Занято"
                                : isSelected
                                  ? "Выбрано"
                                  : "Свободно"}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {!date1 || !date2 ? (
                      <small className="booking-hint">
                        * Выберите даты заезда и выезда, чтобы увидеть занятые и
                        свободные {isHostel ? "места" : "номера"}.
                      </small>
                    ) : (
                      <small
                        className="booking-hint"
                        style={{
                          color: "#2e7d32",
                          fontWeight: 600,
                        }}
                      >
                        {isHostel
                          ? `Выбрано: Место ${selectedPlace} (свободно)`
                          : `Выбран: Номер ${selectedPlace} (свободен)`}
                      </small>
                    )}
                  </div>

                  {forpriceday > 0 && date2 > date1 && (
                    <div className="details-total">
                      <div>
                        <span>
                          {isHostel ? "Выбранное место" : "Выбранный номер"}
                        </span>

                        <strong>
                          {isHostel
                            ? `Место ${selectedPlace}`
                            : `Номер ${selectedPlace}`}
                        </strong>
                      </div>

                      <div>
                        <span>Количество ночей</span>
                        <strong>{forpriceday}</strong>
                      </div>

                      <div>
                        <span>Цена за ночь</span>

                        <strong>
                          {bookingPrice.toLocaleString("ru-RU", {
                            maximumFractionDigits: 2,
                          })}{" "}
                          сом
                        </strong>
                      </div>

                      {appliedPromo && (
                        <div>
                          <span>Применён промокод</span>
                          <strong>{selectedHotel.promo}</strong>
                        </div>
                      )}

                      {!appliedPromo && discount > 0 && (
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

                      {appliedPromo && (
                        <div>
                          <span>Экономия по промокоду</span>

                          <strong>
                            -
                            {(
                              forpriceday *
                              (price - bookingPrice)
                            ).toLocaleString("ru-RU", {
                              maximumFractionDigits: 2,
                            })}{" "}
                            сом
                          </strong>
                        </div>
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
