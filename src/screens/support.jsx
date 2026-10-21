import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Bottomnav from "../components/bottomnav";
import axios from "axios";
import moment from "moment";
import "moment/locale/ru";

moment.locale("ru");

const CHAT_URL = "https://6ad252f566cd28aed82de514.mockapi.io/chat";
const USER_URL = "https://6ac221b73f4ae78f6944db9c.mockapi.io/data";

// Превращаем сообщения из MockAPI в массив
function parseMessages(value) {
  if (Array.isArray(value)) return value;

  try {
    const result = JSON.parse(value || "[]");
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}

function Support() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const userId = String(localStorage.getItem("id") || "").replaceAll('"', "");

  const loadChat = useCallback(async () => {
    if (!userId) {
      navigate("/signin");
      return;
    }

    try {
      // Получаем пользователя
      const userResponse = await axios.get(`${USER_URL}/${userId}`);
      const user = userResponse.data;

      if (user.userstatus === "admin") {
        navigate("/adminsupport");
        return;
      }

      if (user.userstatus !== "user") {
        navigate("/signin");
        return;
      }

      const chatsResponse = await axios.get(CHAT_URL);
      let currentChat = chatsResponse.data.find(
        (item) => String(item.userId) === String(user.id),
      );

      if (!currentChat) {
        const newChat = {
          userId: String(user.id),
          firstname: user.firstname || "",
          avatar: user.avatar || "",
          lastname: user.lastname || "",
          email: user.email || "",
          numberphone: user.numberphone || "",
          support: "[]",
          chatstatus: "Не прочитано",
        };

        const createResponse = await axios.post(CHAT_URL, newChat);
        currentChat = createResponse.data;
      }

      setChat(currentChat);
      setMessages(parseMessages(currentChat.support));
    } catch (error) {
      console.error("Ошибка загрузки чата:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, navigate]);

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  useEffect(() => {
    if (!chat?.id) return;

    const timer = setInterval(async () => {
      try {
        const response = await axios.get(`${CHAT_URL}/${chat.id}`);
        setChat(response.data);
        setMessages(parseMessages(response.data.support));
      } catch (error) {
        console.error("Ошибка обновления сообщений:", error);
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [chat?.id]);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim() || !chat || sending) return;

    setSending(true);

    try {
      const response = await axios.get(`${CHAT_URL}/${chat.id}`);
      const currentChat = response.data;
      const oldMessages = parseMessages(currentChat.support);

      const now = new Date();

      const newMessage = {
        id: String(Date.now()),
        text: message.trim(),
        sender: "user",
        chatstatus: "Не прочитано",
        time: now.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: now.toISOString(),
      };

      const updatedMessages = [...oldMessages, newMessage];

      const updateResponse = await axios.put(`${CHAT_URL}/${chat.id}`, {
        ...currentChat,
        support: JSON.stringify(updatedMessages),
        chatstatus: "Не прочитано",
      });

      setChat(updateResponse.data);
      setMessages(updatedMessages);
      setMessage("");
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);
      alert("Не удалось отправить сообщение");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="onboarding support-chat-page">
          <h2>Загрузка чата...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="onboarding home-onboarding">
        <div className="support-chat-header">
          <Link to="/home" className="support-back-button">
            <i className="fa-solid fa-arrow-left"></i>
          </Link>

          <div className="support-avatar">
            <i className="fa-solid fa-headset"></i>
          </div>

          <div className="support-header-info">
            <h2>Служба поддержки</h2>
            <p>
              <span className="support-online-dot"></span>
              Мы готовы помочь
            </p>
          </div>
        </div>

        <div className="support-chat-messages">
          <div className="support-chat-date">Переписка</div>

          {messages.length === 0 && (
            <p className="text-center text-secondary">
              Здравствуйте! Напишите свой вопрос.
            </p>
          )}

          {messages.map((item) => (
            <div
              key={item.id}
              className={`support-message-row ${
                item.sender === "user" ? "my-message-row" : ""
              }`}
            >
              <div
                className={`support-message ${
                  item.sender === "user" ? "my-message" : "other-message"
                }`}
              >
                <p>{item.text}</p>

                <div className="support-message-time">
                  {item.date
                    ? moment(item.date).format("DD.MM.YYYY HH:mm")
                    : item.time}

                  {item.sender === "user" && (
                    <i className="fa-solid fa-check-double"></i>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <form className="support-chat-input" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Сообщение..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button type="submit" disabled={sending || !chat}>
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </form>

        <br />
        <br />
        <br />

        <Bottomnav />
      </div>
    </div>
  );
}

export default Support;
