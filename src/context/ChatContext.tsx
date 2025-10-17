// src/context/ChatContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { client, databases } from "@/lib/appwrite/config";
import { useToast } from "@/components/ui/use-toast";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const CHATS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_CHATS_COLLECTION_ID;
const USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID; // ✅ add your users collection ID

interface ChatContextType {
  showChat: boolean;
  setShowChat: (show: boolean) => void;
  receiverId: string | null;
  setReceiverId: (id: string | null) => void;
}

const ChatContext = createContext<ChatContextType>({
  showChat: false,
  setShowChat: () => {},
  receiverId: null,
  setReceiverId: () => {},
});

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [showChat, setShowChat] = useState(false);
  const [receiverId, setReceiverId] = useState<string | null>(null);

  return (
    <ChatContext.Provider value={{ showChat, setShowChat, receiverId, setReceiverId }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
};

// ✅ Helper to fetch sender name
async function getSenderName(senderId: string) {
  try {
    const userDoc = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, senderId);
    return userDoc.name || "Someone";
  } catch (err) {
    console.error("Failed to fetch sender name:", err);
    return "Someone";
  }
}

export function useChatNotifications(currentUserId: string) {
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUserId) return;

    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${CHATS_COLLECTION_ID}.documents`,
      async (res: any) => {
        if (res.events.includes("databases.*.collections.*.documents.*.create")) {
          const newMsg = res.payload;

          // ✅ Notify only if the current user is the receiver
          if (newMsg.receiverId === currentUserId) {
            const senderName = await getSenderName(newMsg.senderId);

            toast({
              title: "💬 New Message",
              description: `${senderName} sent you a message`,
              duration: 10000, // ✅ lasts 1 minute
            });
          }
        }
         // ✅ Mobile vibration feedback
  if (navigator.vibrate) {
    navigator.vibrate(200);
  }
      }
    );

    return () => unsubscribe();
  }, [currentUserId, toast]);
}
