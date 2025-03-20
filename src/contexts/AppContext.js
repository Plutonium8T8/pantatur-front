import React, { createContext, useState, useEffect, useRef } from "react"
import { useSnackbar } from "notistack"
import { useUser } from "../hooks"
import { api } from "../api"

export const AppContext = createContext()

export const AppProvider = ({ children }) => {
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
    const connectToChatRooms = (ticketIds) => {
      const socketInstance = socketRef.current
      if (!socketInstance || socketInstance.readyState !== WebSocket.OPEN) {
        console.warn("WebSocket off.")
        return
      }

      if (!ticketIds || ticketIds.length === 0) {
        console.warn("Nu exista id pentru conect la chat-room!")
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
        console.log("WebSocket on")
        const tickets = await fetchTickets()
        const ticketIds = tickets.map((ticket) => ticket.id)
        connectToChatRooms(ticketIds)
      }

      socketInstance.onmessage = (event) => {
        const message = JSON.parse(event.data)
        handleWebSocketMessage(message)
      }

      socketInstance.onclose = () => {}
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    console.log("numarul de mesaje ne citite:", unreadCount)
  }, [unreadCount])

  useEffect(() => {
    const unread = messages.filter(
      (msg) =>
        msg.seen_by != null &&
        msg.seen_by === "{}" &&
        msg.sender_id !== 1 &&
        msg.sender_id !== userId
    )
    console.log("🔄 Update `unreadCount`: ", unread.length)
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
      console.log(`✅ Seen transmis pentru ticket_id=${ticketId}`)
    } else {
      console.warn("WebSocket off, nu sa transmis seen.")
    }
  }

  const fetchTickets = async () => {
    try {
      setIsLoading(true)

      const response = await api.tickets.getLightList()
      const data = response.tickets || []

      const processedTickets = data.map((ticket) => ({
        ...ticket,
        client_ids: ticket.clients
          ? ticket.clients.map((client) => client.id)
          : [],
        last_message: ticket.last_message || "Nu sunt mesaje",
        time_sent: ticket.time_sent || null,
        unseen_count: ticket.unseen_count || 0
      }))

      setTickets(processedTickets)
      setTicketIds(processedTickets.map((ticket) => ticket.id))

      return processedTickets
    } catch (error) {
      console.error("Erroare la request ticketuri:", error)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSingleTicket = async (ticketId) => {
    try {
      setIsLoading(true)

      const ticket = await api.tickets.ticket.getLightById(ticketId)

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
      console.error("Eroare request ticket:", error)
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

  const getClientMessagesSingle = async (ticket_id) => {
    console.log("Обновление сообщений для тикета:", ticket_id)
    try {
      const data = await api.messages.messagesTicketById(ticket_id)

      if (Array.isArray(data)) {
        setMessages((prevMessages) => {
          console.log("mesaje vechi in state:", prevMessages)
          console.log("Mesaj nou:", data)

          const otherMessages = prevMessages.filter(
            (msg) => msg.ticket_id !== ticket_id
          )

          return [...otherMessages, ...data]
        })

        console.log("update state messages:", data)

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
      console.error("error request messages:", error.message)
    }
  }

  const handleWebSocketMessage = (message) => {
    switch (message.type) {
      case "message": {
        console.log("nou mesaj din WebSocket:", message.data)

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

        console.log("🔄 Primit `seen` din WebSocket:", { ticket_id, seen_at })

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
        console.log("A venit ticket nou:", message.data)

        const ticketId = message.data.ticket_id

        if (!ticketId) {
          console.warn("nu pot scoate ticket id din 'ticket'.")
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
          console.warn("eroor conect chat-room, WebSocket off.")
          console.log(
            "Stare WebSocket:",
            socketInstance
              ? socketInstance.readyState
              : "Nu exista conecsiune la webSocket"
          )
        }
        break
      }
      // case "ticket_update": {
      //   console.log("обновление тикета :", message.data)
      //   const ticketId = message.data.ticket_id
      //   fetchSingleTicket(ticketId)
      // }
      // case "notification": {
      //   const notificationText = truncateText(
      //     message.data.description || "Уведомление с пустым текстом!",
      //     100
      //   )
      //   enqueueSnackbar(notificationText, { variant: "info" })
      //   break
      // }
      // case "task": {
      //   enqueueSnackbar(`Новое задание: ${message.data.title}`, {
      //     variant: "warning"
      //   })
      //   break
      // }
      case "pong":
        console.log("пришел понг")
        break
      default:
        console.warn("inValid message_type din socket:", message.type)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  useEffect(() => {
    const totalUnread = tickets.reduce(
      (sum, ticket) => sum + ticket.unseen_count,
      0
    )

    console.log(`🔄 updated unreadCount: ${totalUnread}`)
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
