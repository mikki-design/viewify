import { useEffect, useRef, useState } from "react";
import { fetchChatMessages, sendMessage, markMessagesAsRead } from "@/lib/appwrite/api/chat";
import { useUserContext } from "@/context/AuthContext";
import { client } from "@/lib/appwrite/config";
import { CheckCheck } from "lucide-react";
import { updateMessage, deleteMessage } from "@/lib/appwrite/api/chat";


const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const CHATS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_CHATS_COLLECTION_ID;

interface ChatBoxProps {
  receiverId: string;
}


const ChatBox = ({ receiverId }: ChatBoxProps) => {
  const { user } = useUserContext();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
const [editText, setEditText] = useState("");




const handleEditStart = (msg: any) => {
  setEditingMessageId(msg.$id);
  setEditText(msg.message);
};

const handleEditSave = async () => {
  await updateMessage(editingMessageId!, editText);
  setEditingMessageId(null);
  setEditText("");
};

const handleDelete = async (msgId: string) => {
  await deleteMessage(msgId);
  setMessages((prev) => prev.filter((m) => m.$id !== msgId));
};


  
  // 🔹 Scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 🧩 1️⃣ Load existing messages between two users
  useEffect(() => {
    const loadMessages = async () => {
      if (!user?.id || !receiverId) return;
      const res = await fetchChatMessages(user.id, receiverId);
      setMessages(res);
    };
    loadMessages();
  }, [receiverId, user?.id]);

 // ⚡ 2️⃣ Real-time subscription to new messages + read status
useEffect(() => {
  const unsubscribe = client.subscribe(
    `databases.${DATABASE_ID}.collections.${CHATS_COLLECTION_ID}.documents`,
    (res: any) => {
      const newMsg: any = res.payload;

      // New message created
      if (res.events.includes("databases.*.collections.*.documents.*.create")) {
        if (
          (newMsg.senderId === user.id && newMsg.receiverId === receiverId) ||
          (newMsg.senderId === receiverId && newMsg.receiverId === user.id)
        ) {
          setMessages((prev) => [...prev, newMsg]);
        }
      }

      // Message updated (read status changed)
     // Message updated (edited or read)
if (res.events.includes("databases.*.collections.*.documents.*.update")) {
  if (
    (newMsg.senderId === user.id && newMsg.receiverId === receiverId) ||
    (newMsg.senderId === receiverId && newMsg.receiverId === user.id)
  ) {
    setMessages((prev) =>
      prev.map((m) =>
        m.$id === newMsg.$id ? { ...m, ...newMsg } : m
      )
    );
  }
}

    }
  );

  return () => unsubscribe();
}, [receiverId, user?.id]);


  // 🌀 3️⃣ Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🧠 4️⃣ Mark messages as read when user opens chat
  useEffect(() => {
    if (!user?.id || !receiverId || messages.length === 0) return;

    const unread = messages.some(
      (m) => m.senderId === receiverId && !m.read
    );

    if (unread) {
      // Locally update first for instant UI feedback
      setMessages((prev) =>
        prev.map((m) =>
          m.senderId === receiverId ? { ...m, read: true } : m
        )
      );

      // Optionally update Appwrite (implement this in api/chat.ts)
      markMessagesAsRead(receiverId, user.id);
    }
  }, [receiverId, messages, user?.id]);

  // 📨 5️⃣ Send a message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await sendMessage({
        senderId: user.id,
        receiverId,
        message: text,
        read: false, // default
      });
      setText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex flex-col w-full border rounded-xl bg-dark-2 p-4">


      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-3 space-y-2 max-h-[70vh] scrollbar-thin scrollbar-thumb-gray-700">
        {messages.map((msg, idx) => (
  <div
    key={idx}
    className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}
  >
    <div className="relative group">
      <div
        className={`p-2 rounded-lg max-w-[85%] break-words transition-colors duration-300 ${
          msg.senderId === user.id
            ? "bg-blue-600 text-white ml-auto"
            : "bg-gray-700 text-white"
        }`}
      >
        {/* If editing */}
        {editingMessageId === msg.$id ? (
          <input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="bg-white text-black rounded p-1 w-full"
          />
        ) : (
          msg.message
        )}

        {msg.senderId === user.id && (
          <CheckCheck
            size={16}
            className={`absolute bottom-1 right-2 ${
              msg.read ? "text-green-400" : "text-gray-400"
            }`}
          />
        )}
      </div>

      {/* ⋮ Menu - Only for user messages */}
      {msg.senderId === user.id && (
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition">
          {editingMessageId === msg.$id ? (
            <button
              onClick={handleEditSave}
              className="text-xs bg-green-500 px-2 py-1 rounded mr-1"
            >
              Save
            </button>
          ) : (
            <button
              onClick={() => handleEditStart(msg)}
              className="text-xs bg-yellow-500 px-2 py-1 rounded mr-1"
            >
              Edit
            </button>
          )}
          <button
            onClick={() => handleDelete(msg.$id)}
            className="text-xs bg-red-500 px-2 py-1 rounded"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  </div>
))}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2">
        <input
          className="p-2 rounded bg-dark-3 border border-gray-600 outline-none 
                     w-[70%] sm:w-[80%] md:w-[85%] lg:flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          type="submit"
          className="bg-blue-500 px-3 py-2 rounded text-white hover:bg-blue-600 text-sm sm:text-base"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
