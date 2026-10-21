import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import "moment/locale/ru";

moment.locale("ru");

const CHAT_URL = "https://6ad252f566cd28aed82de514.mockapi.io/chat";
const USER_URL = "https://6ac221b73f4ae78f6944db9c.mockapi.io/data";

function parseMessages(value) {
  if (Array.isArray(value)) return value;

  try {
    const result = JSON.parse(value || "[]");
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}

function Adminsupport() {
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const getData = useCallback(async () => {
    const savedId = localStorage.getItem("id");

    if (!savedId) {
      navigate("/adminsignin");
      return;
    }

    const adminId = String(savedId).replaceAll('"', "");

    try {
      const adminResponse = await axios.get(`${USER_URL}/${adminId}`);

      if (adminResponse.data.userstatus !== "admin") {
        navigate("/home");
        return;
      }

      const [chatsResponse, usersResponse] = await Promise.all([
        axios.get(CHAT_URL),
        axios.get(USER_URL),
      ]);

      const allChats = chatsResponse.data;
      const allUsers = usersResponse.data;

      setChats(allChats);
      setUsers(allUsers);

      setSelectedChat((previous) => {
        if (!previous) return null;

        const updated = allChats.find(
          (item) => String(item.id) === String(previous.id),
        );

        return updated || null;
      });
    } catch (error) {
      console.error("Ошибка загрузки чатов:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    getData();

    const timer = setInterval(() => {
      getData();
    }, 3000);

    return () => clearInterval(timer);
  }, [getData]);

  // Открытие чата и изменение статуса на «Прочитано»
  const openChat = async (chat) => {
    try {
      const response = await axios.get(`${CHAT_URL}/${chat.id}`);
      const currentChat = response.data;

      setSelectedChat(currentChat);
      setMessages(parseMessages(currentChat.support));

      if (currentChat.chatstatus !== "Прочитано") {
        const updateResponse = await axios.put(`${CHAT_URL}/${chat.id}`, {
          ...currentChat,
          chatstatus: "Прочитано",
        });

        setSelectedChat(updateResponse.data);

        setChats((previous) =>
          previous.map((item) =>
            String(item.id) === String(chat.id) ? updateResponse.data : item,
          ),
        );
      }
    } catch (error) {
      console.error("Ошибка открытия чата:", error);
      alert("Не удалось открыть чат");
    }
  };

  const getUserInfo = (chat) => {
    const user = users.find((item) => String(item.id) === String(chat.userId));

    return {
      firstname: chat.firstname || user?.firstname || "",
      lastname: chat.lastname || user?.lastname || "",
      email: chat.email || user?.email || "",
      avatar: chat.avatar || user?.avatar || "",
      chatstatus: chat.chatstatus || "",
      numberphone: chat.numberphone || user?.numberphone || "",
    };
  };

  useEffect(() => {
    if (!selectedChat?.id) return;

    const timer = setInterval(async () => {
      try {
        const response = await axios.get(`${CHAT_URL}/${selectedChat.id}`);

        setSelectedChat(response.data);
        setMessages(parseMessages(response.data.support));
      } catch (error) {
        console.error("Ошибка обновления переписки:", error);
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [selectedChat?.id]);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim() || !selectedChat || sending) return;

    setSending(true);

    try {
      const response = await axios.get(`${CHAT_URL}/${selectedChat.id}`);

      const currentChat = response.data;
      const oldMessages = parseMessages(currentChat.support);

      const now = new Date();

      const newMessage = {
        id: String(Date.now()),
        text: message.trim(),
        sender: "admin",
        time: now.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: now.toISOString(),
      };

      const updatedMessages = [...oldMessages, newMessage];

      const updateResponse = await axios.put(`${CHAT_URL}/${selectedChat.id}`, {
        ...currentChat,
        support: JSON.stringify(updatedMessages),
        chatstatus: "Прочитано",
      });

      setSelectedChat(updateResponse.data);
      setMessages(updatedMessages);
      setMessage("");

      setChats((previous) =>
        previous.map((item) =>
          String(item.id) === String(updateResponse.data.id)
            ? updateResponse.data
            : item,
        ),
      );
    } catch (error) {
      console.error("Ошибка отправки ответа:", error);
      alert("Не удалось отправить ответ");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="container py-4">Загрузка чатов...</div>;
  }

  const selectedUser = selectedChat ? getUserInfo(selectedChat) : null;

  return (
    <div className="container-fluid py-3">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2>Служба поддержки</h2>
          <p className="text-secondary mb-0">Все обращения пользователей</p>
        </div>

        <Link to="/admin" className="btn btn-outline-secondary">
          <i className="fa-solid fa-arrow-left me-2"></i>
          Назад
        </Link>
      </div>

      <div className="row g-3">
        {/* Список всех чатов */}
        <div className="col-12 col-md-4">
          <div className="border rounded p-3">
            <h5>Все чаты ({chats.length})</h5>

            {chats.length === 0 ? (
              <p className="text-secondary">Пока нет обращений</p>
            ) : (
              chats.map((chat) => {
                const user = getUserInfo(chat);
                const chatMessages = parseMessages(chat.support);
                const lastMessage = chatMessages[chatMessages.length - 1];

                return (
                  <button
                    type="button"
                    key={chat.id}
                    onClick={() => openChat(chat)}
                    className={`w-100 text-start border rounded p-3 mb-2 ${
                      String(selectedChat?.id) === String(chat.id)
                        ? "border-primary bg-light"
                        : "bg-white"
                    }`}
                  >
                    <div className="row align-items-center">
                      <div className="col-9">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt=""
                              className="admin-hotel-icon"
                            />
                          ) : (
                            <i className="fa-solid fa-user admin-hotel-icon"></i>
                          )}

                          <strong>
                            {user.firstname} {user.lastname}
                          </strong>
                        </div>

                        <div className="small text-secondary">
                          {user.email || "Нет email"}
                        </div>

                        <div className="small text-secondary">
                          {user.numberphone || "Нет телефона"}
                        </div>

                        <div className="small mt-2 text-truncate">
                          {lastMessage?.text || "Нет сообщений"}
                        </div>
                      </div>

                      <div className="col-3 small">
                        <span className="text-primary">
                          {chat.chatstatus === "Прочитано" ? "✓✓" : "✓"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Открытая переписка */}
        <div className="col-12 col-md-8">
          <div className="border rounded p-3">
            {!selectedChat ? (
              <div className="text-center text-secondary py-5">
                <i className="fa-solid fa-comments fa-2x mb-3"></i>
                <p>Выберите чат, чтобы открыть переписку</p>
              </div>
            ) : (
              <>
                <div className="border-bottom pb-3 mb-3">
                  <h5>
                    {selectedUser.firstname} {selectedUser.lastname}
                  </h5>

                  <div className="small text-secondary">
                    Email: {selectedUser.email || "Не указан"}
                  </div>

                  <div className="small text-secondary">
                    Телефон: {selectedUser.numberphone || "Не указан"}
                  </div>

                  <div className="small text-secondary">
                    Статус: {selectedChat.chatstatus || "Не прочитано"}
                  </div>
                </div>

                <div
                  className="d-flex flex-column gap-2 mb-3"
                  style={{
                    height: "400px",
                    overflowY: "auto",
                  }}
                >
                  {messages.length === 0 ? (
                    <p className="text-secondary">
                      Пользователь ещё не написал сообщение.
                    </p>
                  ) : (
                    messages.map((item) => (
                      <div
                        key={item.id}
                        className={`d-flex ${
                          item.sender === "admin"
                            ? "justify-content-end"
                            : "justify-content-start"
                        }`}
                      >
                        <div
                          className={`p-3 rounded ${
                            item.sender === "admin"
                              ? "bg-primary text-white"
                              : "bg-light border"
                          }`}
                          style={{
                            maxWidth: "80%",
                            overflowWrap: "anywhere",
                          }}
                        >
                          <div className="small fw-bold mb-1">
                            {item.sender === "admin"
                              ? "Администратор"
                              : "Пользователь"}
                          </div>

                          <div>{item.text}</div>

                          <div className="small text-end mt-1">
                            {item.date
                              ? moment(item.date).format("DD.MM.YYYY HH:mm")
                              : item.time}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form className="d-flex gap-2" onSubmit={sendMessage}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Напишите ответ..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={sending || !message.trim()}
                  >
                    <i className="fa-solid fa-paper-plane"></i>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Adminsupport;
