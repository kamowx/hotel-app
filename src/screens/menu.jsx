import { useEffect, useState } from "react";
import Bottomnav from "../components/bottomnav";
import axios from "axios";

const FOOD_URL = "https://6ae6edba56b2ee1e543ff943.mockapi.io/foodorders";
const FOOD_MENU_URL = "https://6ae6edba56b2ee1e543ff943.mockapi.io/food";
const USERS_URL = "https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data";

function Menu() {
  const [foods, setFoods] = useState([]);
  const [user, setUser] = useState(null);
  const [activeBookings, setActiveBookings] = useState([]);

  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");

  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Загружаем блюда и данные пользователя
  useEffect(() => {
    getFoods();
    getUser();
  }, []);

  // Получение блюд
  const getFoods = async () => {
    try {
      const response = await axios.get(FOOD_MENU_URL);
      setFoods(response.data);
    } catch (error) {
      console.log("GET FOOD ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUser = async () => {
    try {
      const savedUid = localStorage.getItem("uid");

      if (!savedUid) {
        alert("Сначала войдите в аккаунт");
        return;
      }

      const uid = String(savedUid).replaceAll('"', "");

      const response = await axios.get(USERS_URL);

      const currentUser = response.data.find(
        (item) => String(item.uid) === uid,
      );

      if (!currentUser) {
        alert("Пользователь не найден");
        return;
      }

      setUser(currentUser);

      const bookings = Array.isArray(currentUser.bookhotel)
        ? currentUser.bookhotel
        : [];

      const active = bookings.filter(
        (item) =>
          String(item.status || "")
            .trim()
            .toLowerCase() === "активно",
      );

      setActiveBookings(active);
    } catch (error) {
      console.log("GET USER ERROR:", error);
    }
  };

  // Добавление блюда в корзину
  const addToCart = (food) => {
    setCart((prev) => {
      const found = prev.find(
        (item) => String(item.foodId) === String(food.id),
      );

      if (found) {
        return prev.map((item) =>
          String(item.foodId) === String(food.id)
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...prev,
        {
          foodId: food.id,
          name: food.name,
          price: Number(food.price),
          quantity: 1,
        },
      ];
    });
  };

  // Уменьшение количества
  const decreaseQuantity = (foodId) => {
    setCart((prev) =>
      prev
        .map((item) =>
          String(item.foodId) === String(foodId)
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  // Увеличение количества
  const increaseQuantity = (foodId) => {
    setCart((prev) =>
      prev.map((item) =>
        String(item.foodId) === String(foodId)
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  };

  // Общая сумма
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Общее количество блюд
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Выбранное бронирование
  const booking =
    selectedBooking !== "" ? activeBookings[Number(selectedBooking)] : null;

  // Открытие подтверждения заказа
  const openOrderModal = () => {
    if (cart.length === 0) {
      alert("Сначала добавьте блюда в корзину");
      return;
    }

    if (!user) {
      alert("Не удалось загрузить данные пользователя");
      return;
    }

    if (activeBookings.length === 0) {
      alert("У вас нет активного бронирования отеля или хостела");
      return;
    }

    setSelectedBooking("");
    setShowModal(true);
  };

  // Отправка заказа в MockAPI
  const createOrder = async () => {
    if (!booking) {
      alert("Выберите отель или хостел");
      return;
    }

    if (!booking.place) {
      alert("Не удалось определить номер комнаты или место");
      return;
    }

    if (!cart.length) {
      alert("Корзина пустая");
      return;
    }

    try {
      setSending(true);

      const now = new Date();

      const date = now.toLocaleDateString("ru-RU");
      const time = now.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const newOrder = {
        userId: String(user.id),
        hotelname: booking.name || "",
        room: String(booking.place),
        foods: cart.map((item) => ({
          foodId: String(item.foodId),
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total: total,
        status: "Новый",
        date: date,
        time: time,
      };

      const response = await axios.post(FOOD_URL, newOrder);

      if (response.status === 200 || response.status === 201) {
        alert("Ваш заказ успешно отправлен!");

        setCart([]);
        setShowModal(false);
        setSelectedBooking("");
      }
    } catch (error) {
      console.log("CREATE FOOD ORDER ERROR:", error);
      alert("Не удалось отправить заказ. Попробуйте ещё раз.");
    } finally {
      setSending(false);
    }
  };

  // Категории
  const categories = [
    "Все",
    ...new Set(foods.map((food) => food.category).filter(Boolean)),
  ];

  // Поиск и фильтрация
  const filteredFoods = foods.filter((food) => {
    const searchMatch = String(food.name || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const categoryMatch = category === "Все" || food.category === category;

    return searchMatch && categoryMatch;
  });

  return (
    <div className="hotel-page">
      <div className="mobile-app menu-page">
        {/* Шапка */}
        <header className="menu-header">
          <div className="menu-header-top">
            <h2>Меню</h2>
            <a href="/check" className="i1">
              <div className="menu-cart-icon" style={{ cursor: "pointer" }}>
                <i className="fa-solid fa-bag-shopping"></i>
                <span>{cartCount}</span>
              </div>
            </a>{" "}
          </div>

          <p>Вкусная еда прямо в ваш номер</p>
        </header>

        <main className="menu-content">
          {/* Поиск */}
          <div className="menu-search">
            <i className="fa-solid fa-magnifying-glass"></i>

            <input
              type="text"
              placeholder="Найти блюдо..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Категории */}
          <div className="menu-categories">
            {categories.map((item, index) => (
              <button
                key={index}
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Заголовок */}
          <div className="menu-section-title">
            <h3>Популярные блюда</h3>
            <span>{filteredFoods.length} блюд</span>
          </div>

          {/* Блюда */}
          {loading ? (
            <div className="menu-empty">
              <p>Загрузка меню...</p>
            </div>
          ) : filteredFoods.length > 0 ? (
            <div className="menu-food-grid">
              {filteredFoods.map((food) => {
                const cartItem = cart.find(
                  (item) => String(item.foodId) === String(food.id),
                );

                return (
                  <div className="menu-food-card" key={food.id}>
                    <div className="menu-food-image">
                      <img src={food.avatar} alt={food.name} />

                      {cartItem && (
                        <span className="menu-food-label">
                          В корзине: {cartItem.quantity}
                        </span>
                      )}
                    </div>

                    <div className="menu-food-info">
                      <h4>{food.name}</h4>

                      <p>
                        {food.description || "Вкусное блюдо нашего ресторана"}
                      </p>

                      <div className="menu-food-bottom">
                        <strong>
                          {Number(food.price).toLocaleString("ru-RU")} сом
                        </strong>

                        {cartItem ? (
                          <div className="menu-quantity">
                            <button onClick={() => decreaseQuantity(food.id)}>
                              <i className="fa-solid fa-minus"></i>
                            </button>

                            <span>{cartItem.quantity}</span>

                            <button onClick={() => addToCart(food)}>
                              <i className="fa-solid fa-plus"></i>
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => addToCart(food)}>
                            <i className="fa-solid fa-plus"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="menu-empty">
              <i className="fa-solid fa-utensils"></i>
              <p>Блюда не найдены</p>
            </div>
          )}

          {/* Корзина */}
          {cart.length > 0 && (
            <div className="menu-order-preview">
              <div>
                <strong>Ваш заказ</strong>
                <span>
                  {cartCount} блюд · {total.toLocaleString("ru-RU")} сом
                </span>
              </div>

              <button onClick={openOrderModal}>Посмотреть чек</button>
            </div>
          )}
        </main>

        <br />

        <Bottomnav />

        {/* Модальное окно подтверждения */}
        {showModal && (
          <div
            className="menu-modal-overlay"
            onClick={() => !sending && setShowModal(false)}
          >
            <div className="menu-modal" onClick={(e) => e.stopPropagation()}>
              <div className="menu-modal-header">
                <div>
                  <h3>Подтверждение заказа</h3>
                  <p>Проверьте ваш заказ перед отправкой</p>
                </div>

                <button
                  className="menu-modal-close"
                  onClick={() => setShowModal(false)}
                  disabled={sending}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              {/* Список блюд */}
              <div className="menu-modal-foods">
                {cart.map((item) => (
                  <div className="menu-modal-food" key={item.foodId}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>
                        {item.quantity} × {item.price} сом
                      </span>
                    </div>

                    <strong>
                      {(item.price * item.quantity).toLocaleString("ru-RU")} сом
                    </strong>
                  </div>
                ))}
              </div>

              <div className="menu-modal-total">
                <span>Итого</span>
                <strong>{total.toLocaleString("ru-RU")} сом</strong>
              </div>

              {/* Выбор отеля */}
              <label className="menu-modal-label">
                Выберите отель или хостел
              </label>

              <select
                value={selectedBooking}
                onChange={(e) => setSelectedBooking(e.target.value)}
              >
                <option value="">Выберите бронирование</option>

                {activeBookings.map((item, index) => (
                  <option key={index} value={index}>
                    {item.name} —{" "}
                    {item.place ? `№ ${item.place}` : "Номер не указан"}
                  </option>
                ))}
              </select>

              {/* Автоматический выбор комнаты */}
              <label className="menu-modal-label">Номер комнаты / место</label>

              <select value={booking ? booking.place || "" : ""} disabled>
                <option value="">
                  {booking ? "Номер не указан" : "Сначала выберите отель"}
                </option>

                {booking?.place && (
                  <option value={booking.place}>{booking.place}</option>
                )}
              </select>

              <div className="menu-modal-actions">
                <button
                  className="menu-modal-cancel"
                  onClick={() => setShowModal(false)}
                  disabled={sending}
                >
                  Отмена
                </button>

                <button
                  className="menu-modal-submit"
                  onClick={createOrder}
                  disabled={sending || !booking}
                >
                  {sending ? "Отправка..." : "Заказать"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Menu;
