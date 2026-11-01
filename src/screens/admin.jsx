import { useEffect, useState } from "react";
import Bottomnav from "../components/bottomnav";
import axios from "axios";

const FOOD_URL = "https://6ae6edba56b2ee1e543ff943.mockapi.io/foodorders";

const USERS_URL = "https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data";

function Check() {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Карта");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    getOrders();
  }, []);

  // Получаем пользователя и его заказы
  const getOrders = async () => {
    try {
      const savedUid = localStorage.getItem("uid");

      if (!savedUid) {
        alert("Сначала войдите в аккаунт");
        setLoading(false);
        return;
      }

      const uid = String(savedUid).replaceAll('"', "");

      const usersResponse = await axios.get(USERS_URL);

      const currentUser = usersResponse.data.find(
        (item) => String(item.uid) === uid,
      );

      if (!currentUser) {
        alert("Пользователь не найден");
        setLoading(false);
        return;
      }

      setUser(currentUser);

      const ordersResponse = await axios.get(FOOD_URL);

      const myOrders = ordersResponse.data
        .filter((item) => String(item.userId) === String(currentUser.id))
        .reverse();

      setOrders(myOrders);
    } catch (error) {
      console.log("GET ORDERS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  // Открываем окно оплаты
  const openPayment = (order) => {
    setSelectedOrder(order);
    setPaymentMethod("Карта");
  };

  // Закрываем окно оплаты
  const closePayment = () => {
    if (paying) return;

    setSelectedOrder(null);
    setPaymentMethod("Карта");
  };

  // Оплата и получение заказа
  const payOrder = async () => {
    if (!selectedOrder || !user || paying) return;

    const total = Number(selectedOrder.total || 0);
    const currentBalance = Number(user.check || 0);

    if (total <= 0) {
      alert("Некорректная сумма заказа");
      return;
    }

    if (paymentMethod === "Карта" && currentBalance < total) {
      alert("Недостаточно денег на балансе");
      return;
    }

    setPaying(true);

    const oldBalance = currentBalance;
    const newBalance =
      paymentMethod === "Карта" ? oldBalance - total : oldBalance;

    try {
      // Если оплата картой — списываем деньги с баланса
      if (paymentMethod === "Карта") {
        const updatedUser = {
          ...user,
          check: newBalance,
        };

        await axios.put(`${USERS_URL}/${user.id}`, updatedUser);

        setUser(updatedUser);
      }

      // Меняем статус заказа
      const updatedOrder = {
        ...selectedOrder,
        status: "Получено",
        paymentMethod: paymentMethod,
        paidAmount: total,
        paidAt: new Date().toLocaleString("ru-RU"),
      };

      try {
        await axios.put(`${FOOD_URL}/${selectedOrder.id}`, updatedOrder);
      } catch (error) {
        // Если заказ не обновился, возвращаем деньги на баланс
        if (paymentMethod === "Карта") {
          const restoredUser = {
            ...user,
            check: oldBalance,
          };

          await axios.put(`${USERS_URL}/${user.id}`, restoredUser);

          setUser(restoredUser);
        }

        throw error;
      }

      // Обновляем заказ на странице
      setOrders((prev) =>
        prev.map((item) =>
          String(item.id) === String(selectedOrder.id) ? updatedOrder : item,
        ),
      );

      setSelectedOrder(null);

      alert("Оплата прошла успешно! Заказ получен.");
    } catch (error) {
      console.log("PAYMENT ERROR:", error);
      alert("Не удалось завершить оплату. Попробуйте ещё раз.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="hotel-page">
      <div className="mobile-app check-page">
        <header className="check-header">
          <h2>Мои чеки</h2>
          <p>История ваших заказов</p>

          <div className="check-balance">
            <span>Мой баланс</span>
            <h3>{Number(user?.check || 0)} сом</h3>
          </div>
        </header>

        <main className="check-content">
          {loading ? (
            <p className="check-empty">Загрузка заказов...</p>
          ) : orders.length === 0 ? (
            <div className="check-empty">
              <i className="fa-solid fa-receipt"></i>
              <h3>Заказов пока нет</h3>
              <p>Здесь будут отображаться ваши оформленные заказы</p>
            </div>
          ) : (
            orders.map((order) => {
              const foods = Array.isArray(order.foods) ? order.foods : [];

              return (
                <div className="check-order" key={order.id}>
                  <div className="check-status">
                    <div className="check-status-icon">
                      <i className="fa-solid fa-receipt"></i>
                    </div>

                    <div>
                      <strong>Ваш заказ</strong>
                      <span>Заказ № {order.id}</span>
                    </div>

                    <span className="check-status-badge">
                      {order.status || "Новый"}
                    </span>
                  </div>

                  <div className="check-info-card">
                    <div className="check-info-row">
                      <span>Отель</span>
                      <strong>{order.hotelname || "—"}</strong>
                    </div>

                    <div className="check-info-row">
                      <span>Номер комнаты</span>
                      <strong>№ {order.room || "—"}</strong>
                    </div>

                    <div className="check-info-row">
                      <span>Дата заказа</span>
                      <strong>{order.date || "—"}</strong>
                    </div>

                    <div className="check-info-row">
                      <span>Время</span>
                      <strong>{order.time || "—"}</strong>
                    </div>

                    {order.paymentMethod && (
                      <div className="check-info-row">
                        <span>Способ оплаты</span>
                        <strong>{order.paymentMethod}</strong>
                      </div>
                    )}
                  </div>

                  <section className="check-items-section">
                    <h3>Состав заказа</h3>

                    {foods.map((food, foodIndex) => (
                      <div
                        className="check-item"
                        key={food.foodId || foodIndex}
                      >
                        <div className="check-item-info">
                          <strong>{food.name}</strong>
                          <span>
                            {food.price} сом × {food.quantity}
                          </span>
                        </div>

                        <strong className="check-item-price">
                          {Number(food.price) * Number(food.quantity)} сом
                        </strong>
                      </div>
                    ))}
                  </section>

                  <div className="check-total-card">
                    <h3>Итого к оплате</h3>

                    <div className="check-total-row">
                      <span>Стоимость блюд</span>
                      <span>{Number(order.total || 0)} сом</span>
                    </div>

                    <div className="check-total-row">
                      <span>Доставка</span>
                      <span>Бесплатно</span>
                    </div>

                    <div className="check-total-divider"></div>

                    <div className="check-total-final">
                      <strong>Общая сумма</strong>
                      <strong>{Number(order.total || 0)} сом</strong>
                    </div>
                  </div>

                  {order.status === "Едет" && (
                    <button
                      className="check-receive-button"
                      onClick={() => openPayment(order)}
                    >
                      <i className="fa-solid fa-box-open"></i>
                      Получить
                    </button>
                  )}

                  {order.status === "Получено" && (
                    <div className="check-received">
                      <i className="fa-solid fa-circle-check"></i>
                      Заказ получен и оплачен
                    </div>
                  )}
                </div>
              );
            })
          )}

          <p className="check-bottom-text">
            Спасибо, что выбираете FirstHotel!
          </p>
        </main>

        {/* Модальное окно оплаты */}
        {selectedOrder && (
          <div className="check-modal-overlay">
            <div className="check-payment-modal">
              <button
                className="check-modal-close"
                onClick={closePayment}
                disabled={paying}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>

              <div className="check-modal-icon">
                <i className="fa-solid fa-wallet"></i>
              </div>

              <h3>Оплата заказа</h3>
              <p>Заказ № {selectedOrder.id}</p>

              <div className="check-modal-total">
                <span>Сумма к оплате</span>
                <strong>{Number(selectedOrder.total || 0)} сом</strong>
              </div>

              <div className="check-payment-balance">
                <span>Ваш баланс</span>
                <strong>{Number(user?.check || 0)} сом</strong>
              </div>

              <h4>Выберите способ оплаты</h4>

              <div className="check-payment-options">
                <button
                  type="button"
                  className={
                    paymentMethod === "Карта"
                      ? "check-payment-option selected"
                      : "check-payment-option"
                  }
                  onClick={() => setPaymentMethod("Карта")}
                >
                  <i className="fa-solid fa-credit-card"></i>
                  <span>Картой</span>
                  <i className="fa-solid fa-circle-check"></i>
                </button>

                <button
                  type="button"
                  className={
                    paymentMethod === "Наличные"
                      ? "check-payment-option selected"
                      : "check-payment-option"
                  }
                  onClick={() => setPaymentMethod("Наличные")}
                >
                  <i className="fa-solid fa-money-bill-wave"></i>
                  <span>Наличными</span>
                  <i className="fa-solid fa-circle-check"></i>
                </button>
              </div>

              {paymentMethod === "Карта" && (
                <p className="check-payment-note">
                  Сумма будет списана с вашего баланса.
                </p>
              )}

              {paymentMethod === "Наличные" && (
                <p className="check-payment-note">
                  Оплата наличными при получении заказа. Баланс не изменится.
                </p>
              )}

              <button
                className="check-payment-confirm"
                onClick={payOrder}
                disabled={paying}
              >
                {paying
                  ? "Обработка..."
                  : paymentMethod === "Карта"
                    ? "Оплатить картой"
                    : "Подтвердить получение"}
              </button>

              <button
                className="check-payment-cancel"
                onClick={closePayment}
                disabled={paying}
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        <Bottomnav />
      </div>
    </div>
  );
}

export default Check;
