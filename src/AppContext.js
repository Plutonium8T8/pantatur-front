import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef
} from "react"
import { useSnackbar } from "notistack"
import { useUser } from "./UserContext"
import { truncateText } from "./stringUtils"
import { api } from "./api"

const AppContext = createContext()

export const useAppContext = () => useContext(AppContext)

export const AppProvider = ({ children, isLoggedIn }) => {
  const socketRef = useRef(null)
  const [tickets, setTickets] = useState([])
  const [ticketIds, setTicketIds] = useState([])
  const [messages, setMessages] = useState([])
  const [clientMessages, setClientMessages] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const [isLoading, setIsLoading] = useState(false)
  const { userId } = useUser()
  const [unreadMessages, setUnreadMessages] = useState(new Map())
  const [selectTicketId, setSelectTicketId] = useState(null)

  useEffect(() => {
    let pingInterval

    if (socketRef.current) {
      pingInterval = setInterval(() => {
        if (socketRef.current.readyState === WebSocket.OPEN) {
          const pingMessage = JSON.stringify({ type: "ping" })
          socketRef.current.send(pingMessage)
        }
      }, 5000)

      return () => {
        clearInterval(pingInterval)
        if (socketRef.current) {
          socketRef.current.onmessage = null
        }
      }
    }

    return () => {}
  }, [])

  useEffect(() => {
    if (!isLoggedIn) {
      setTickets([])
      setTicketIds([])
      setMessages([])
      setUnreadCount(0)
      setClientMessages([])
      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
      }
      return
    }

    const connectToChatRooms = (ticketIds) => {
      const socketInstance = socketRef.current
      if (!socketInstance || socketInstance.readyState !== WebSocket.OPEN) {
        console.warn("WebSocket не подключён или недоступен.")
        return
      }

      if (!ticketIds || ticketIds.length === 0) {
        console.warn("Нет id для подключения к комнатам.")
        return
      }

      const socketMessage = JSON.stringify({
        type: "connect",
        data: { ticket_id: ticketIds }
      })

      socketInstance.send(socketMessage)
      console.log("connect to chat rooms", ticketIds)
    }

    if (!socketRef.current) {
      const socketInstance = new WebSocket("wss://pandaturws.com")
      socketRef.current = socketInstance

      socketInstance.onopen = async () => {
        console.log("WebSocket подключен")
        const tickets = await fetchTickets()
        const ticketIds = tickets.map((ticket) => ticket.id)
        connectToChatRooms(ticketIds)
      }

      socketInstance.onmessage = (event) => {
        const message = JSON.parse(event.data)
        handleWebSocketMessage(message)
      }

      socketInstance.onclose = () => {
        // alert(translations["WebSocket off"][language] || "WebSocket este oprit. Te rog să reîncarci pagina!");
        // window.location.reload();
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
      }
    }
  }, [isLoggedIn])

  useEffect(() => {
    console.log("Количество непрочитанных сообщений:", unreadCount)
  }, [unreadCount])

  useEffect(() => {
    const unread = messages.filter(
      (msg) =>
        msg.seen_by != null &&
        msg.seen_by === "{}" &&
        msg.sender_id !== 1 &&
        msg.sender_id !== userId
    )
    console.log("🔄 Обновляем `unreadCount`: ", unread.length)
    setUnreadCount(unread.length)
  }, [messages])

  const markMessagesAsRead = (ticketId) => {
    if (!ticketId) return

    const socketInstance = socketRef.current

    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.ticket_id === ticketId) {
          return {
            ...msg,
            seen_by: JSON.stringify({ [userId]: true }),
            seen_at: new Date().toISOString()
          }
        }
        return msg
      })
    )

    setUnreadMessages((prevUnread) => {
      const updatedUnread = new Map(prevUnread)
      updatedUnread.forEach((msg, msgId) => {
        if (msg.ticket_id === ticketId) {
          updatedUnread.delete(msgId)
        }
      })
      return updatedUnread
    })

    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, unseen_count: 0 } : ticket
      )
    )

    if (socketInstance && socketInstance.readyState === WebSocket.OPEN) {
      const readMessageData = {
        type: "seen",
        data: {
          ticket_id: ticketId,
          sender_id: Number(userId)
        }
      }
      socketInstance.send(JSON.stringify(readMessageData))
      console.log(`✅ Seen отправлен для ticket_id=${ticketId}`)
    } else {
      console.warn("WebSocket не подключён, не удалось отправить seen.")
    }
  }

  const fetchTickets = async () => {
    try {
      setIsLoading(true)

      const data = await api.tickets.getLightList()

      const processedTickets = data.map((ticket) => ({
        ...ticket,
        client_ids: ticket.client_id
          ? ticket.client_id
              .replace(/[{}]/g, "")
              .split(",")
              .map((id) => Number(id))
          : [],
        last_message: ticket.last_message || "Нет сообщений",
        time_sent: ticket.time_sent || null,
        unseen_count: ticket.unseen_count || 0
      }))

      setTickets(processedTickets)
      setTicketIds(processedTickets.map((ticket) => ticket.id))

      return processedTickets
    } catch (error) {
      console.error("Ошибка при загрузке тикетов:", error)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSingleTicket = async (ticketId) => {
    try {
      setIsLoading(true)

      const ticket = await api.tickets.getLightById(ticketId)

      setTickets((prevTickets) => {
        const existingTicket = prevTickets.find((t) => t.id === ticketId)
        if (existingTicket) {
          return prevTickets.map((t) => (t.id === ticketId ? ticket : t))
        } else {
          return [...prevTickets, ticket]
        }
      })

      return ticket
    } catch (error) {
      console.error("Ошибка при загрузке тикета:", error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const updateTicket = async (updateData) => {
    try {
      const updatedTicket = await api.tickets.updateById(
        updateData.id,
        updateData
      )

      return updatedTicket
    } catch (error) {
      console.error("Error updating ticket:", error.message || error)
      throw error
    }
  }

  // Функция загрузки сообщений клиента
  // const getClientMessages = async () => {
  //   try {
  //     const token = Cookies.get('jwt');
  //     if (!token) {
  //       console.warn('Нет токена. Пропускаем загрузку сообщений.');
  //       return;
  //     }

  //     const response = await fetch('https://pandatur-api.com/api/messages', {
  //       method: 'GET',
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //         Origin: 'https://plutonium8t8.github.io'
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  //     }

  //     const data = await response.json();
  //     // console.log("Сообщения, загруженные из API:", data);

  //     setMessages(data); // Обновляем состояние всех сообщений
  //   } catch (error) {
  //     enqueueSnackbar('Не удалось получить сообщения!', { variant: 'error' });
  //     console.error('Ошибка при получении сообщений:', error.message);
  //   }
  // };

  const getClientMessagesSingle = async (ticket_id) => {
    console.log("Обновление сообщений для тикета:", ticket_id)
    try {
      const data = await api.messages.messagesTicketById(ticket_id)

      if (Array.isArray(data)) {
        setMessages((prevMessages) => {
          console.log("Старые сообщения в state:", prevMessages)
          console.log("Пришедшие новые сообщения:", data)

          const otherMessages = prevMessages.filter(
            (msg) => msg.ticket_id !== ticket_id
          )

          return [...otherMessages, ...data]
        })

        console.log("Обновленный state сообщений:", data)

        const unseenMessages = data.filter(
          (msg) => msg.seen_by === "{}" && msg.sender_id !== userId
        )

        setTickets((prevTickets) =>
          prevTickets.map((ticket) =>
            ticket.id === ticket_id
              ? { ...ticket, unseen_count: unseenMessages.length }
              : ticket
          )
        )
      }
    } catch (error) {
      console.error("Ошибка при получении сообщений:", error.message)
    }
  }

  const handleWebSocketMessage = (message) => {
    switch (message.type) {
      case "message": {
        console.log("Новое сообщение из WebSocket:", message.data)

        const {
          ticket_id,
          message: msgText,
          time_sent,
          sender_id
        } = message.data

        setMessages((prevMessages) => [...prevMessages, message.data])

        setTickets((prevTickets) =>
          prevTickets.map((ticket) =>
            ticket.id === ticket_id
              ? {
                  ...ticket,
                  last_message: msgText,
                  time_sent: time_sent,
                  unseen_count:
                    ticket_id === selectTicketId
                      ? 0
                      : ticket.unseen_count + (sender_id !== userId ? 1 : 0)
                }
              : ticket
          )
        )

        setUnreadMessages((prevUnread) => {
          const updatedUnread = new Map(prevUnread)

          if (ticket_id === selectTicketId) {
            updatedUnread.forEach((msg, msgId) => {
              if (msg.ticket_id === ticket_id) {
                updatedUnread.delete(msgId)
              }
            })
          } else if (sender_id !== userId) {
            updatedUnread.set(message.data.id, message.data)
          }

          return updatedUnread
        })

        break
      }
      case "seen": {
        const { ticket_id, seen_at } = message.data

        console.log("🔄 Получен `seen` из WebSocket:", { ticket_id, seen_at })

        setMessages((prevMessages) => {
          return prevMessages.map((msg) =>
            msg.ticket_id === ticket_id ? { ...msg, seen_at } : msg
          )
        })

        setUnreadMessages((prevUnreadMessages) => {
          const updatedUnreadMap = new Map(prevUnreadMessages)
          updatedUnreadMap.forEach((msg, msgId) => {
            if (msg.ticket_id === ticket_id) {
              updatedUnreadMap.delete(msgId)
            }
          })
          return updatedUnreadMap
        })

        setTickets((prevTickets) =>
          prevTickets.map((ticket) =>
            ticket.id === ticket_id ? { ...ticket, unseen_count: 0 } : ticket
          )
        )

        break
      }
      case "ticket": {
        console.log("Пришел тикет:", message.data)

        const ticketId = message.data.ticket_id

        if (!ticketId) {
          console.warn(
            "Не удалось извлечь ticket_id из сообщения типа 'ticket'."
          )
          break
        }

        fetchSingleTicket(ticketId)

        const socketInstance = socketRef.current
        if (socketInstance && socketInstance.readyState === WebSocket.OPEN) {
          const socketMessage = JSON.stringify({
            type: "connect",
            data: { ticket_id: [ticketId] }
          })
          socketInstance.send(socketMessage)
        } else {
          console.warn(
            "Не удалось подключиться к комнатам. WebSocket не готов."
          )
          console.log(
            "Состояние WebSocket:",
            socketInstance
              ? socketInstance.readyState
              : "Нет WebSocket соединения"
          )
        }
        break
      }
      case "ticket_update": {
        console.log("обновление тикета :", message.data)
        const ticketId = message.data.ticket_id
        fetchSingleTicket(ticketId)
      }
      case "notification": {
        const notificationText = truncateText(
          message.data.description || "Уведомление с пустым текстом!",
          100
        )
        enqueueSnackbar(notificationText, { variant: "info" })
        break
      }
      case "task": {
        enqueueSnackbar(`Новое задание: ${message.data.title}`, {
          variant: "warning"
        })
        break
      }
      case "pong":
        console.log("пришел понг")
        break
      default:
        console.warn("Неизвестный тип сообщения:", message.type)
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      fetchTickets()
    }
  }, [isLoggedIn])

  useEffect(() => {
    const totalUnread = tickets.reduce(
      (sum, ticket) => sum + ticket.unseen_count,
      0
    )

    console.log(`🔄 Обновленный unreadCount: ${totalUnread}`)
    setUnreadCount(totalUnread)
  }, [tickets, unreadMessages])

  return (
    <AppContext.Provider
      value={{
        tickets,
        setTickets,
        selectTicketId,
        setSelectTicketId,
        messages,
        setMessages,
        unreadCount,
        markMessagesAsRead,
        clientMessages,
        isLoading,
        updateTicket,
        fetchTickets,
        socketRef,
        getClientMessagesSingle
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
