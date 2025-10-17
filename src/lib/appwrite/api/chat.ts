import { Query,ID,Databases } from "appwrite";
//import { databases } from "@/lib/appwrite/config";
import { client } from "../config";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const CHATS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_CHATS_COLLECTION_ID;
const USER_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID; // ✅ add your users collection ID

const databases = new Databases(client);

export const sendMessage = async ({
  senderId,
  receiverId,
  message,
  read = false, // 👈 added
}: {
  senderId: string;
  receiverId: string;
  message: string;
  read?: boolean; // 👈 added
}) => {
  return await databases.createDocument(
    import.meta.env.VITE_APPWRITE_DATABASE_ID,
    import.meta.env.VITE_APPWRITE_CHATS_COLLECTION_ID,
    ID.unique(),
    {
      senderId,
      receiverId,
      message,
      read, // 👈 added
    }
  );
};


export async function fetchChatMessages(userId: string, otherUserId: string) {
  try {
    // Fetch messages sent by the current user
    const sentMessages = await databases.listDocuments(
      DATABASE_ID,
      CHATS_COLLECTION_ID,
      [
        Query.equal("senderId", userId),
        Query.equal("receiverId", otherUserId),
      ]
    );

    // Fetch messages received by the current user
    const receivedMessages = await databases.listDocuments(
      DATABASE_ID,
      CHATS_COLLECTION_ID,
      [
        Query.equal("senderId", otherUserId),
        Query.equal("receiverId", userId),
      ]
    );

    // ✅ Combine and sort messages by created date
    const allMessages = [...sentMessages.documents, ...receivedMessages.documents];
    allMessages.sort(
      (a, b) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime()
    );

    return allMessages;
  } catch (error) {
    console.error("Failed to fetch chat messages:", error);
    return [];
  }
}

export const markMessagesAsRead = async (senderId: string, receiverId: string) => {
  const response = await databases.listDocuments(DATABASE_ID, CHATS_COLLECTION_ID, [
    Query.equal("senderId", senderId),
    Query.equal("receiverId", receiverId),
    Query.equal("read", false),
  ]);

  for (const doc of response.documents) {
    await databases.updateDocument(DATABASE_ID, CHATS_COLLECTION_ID, doc.$id, {
      read: true,
    });
  }
};

// ✅ Fetch chat users with unread counts (client-safe)
export const fetchUserChats = async (userId: string) => {
  try {
    // Fetch chats where user is sender
    const sentChats = await databases.listDocuments(
      DATABASE_ID,
      CHATS_COLLECTION_ID,
      [Query.equal("senderId", userId)]
    );

    // Fetch chats where user is receiver
    const receivedChats = await databases.listDocuments(
      DATABASE_ID,
      CHATS_COLLECTION_ID,
      [Query.equal("receiverId", userId)]
    );

    // Combine both arrays
    const allChats = [...sentChats.documents, ...receivedChats.documents];

    // Map of userId → { unreadCount, latestMessage, user info }
    const chatMap = new Map<string, any>();

    for (const chat of allChats) {
      const otherId = chat.senderId === userId ? chat.receiverId : chat.senderId;
      const isUnread = chat.receiverId === userId && !chat.read;

      if (!chatMap.has(otherId)) {
        chatMap.set(otherId, {
          $id: otherId,
          unreadCount: isUnread ? 1 : 0,
          lastMessage: chat.message,
          createdAt: chat.$createdAt,
        });
      } else {
        const prev = chatMap.get(otherId);
        chatMap.set(otherId, {
          ...prev,
          unreadCount: prev.unreadCount + (isUnread ? 1 : 0),
          lastMessage:
            new Date(chat.$createdAt) > new Date(prev.createdAt)
              ? chat.message
              : prev.lastMessage,
          createdAt:
            new Date(chat.$createdAt) > new Date(prev.createdAt)
              ? chat.$createdAt
              : prev.createdAt,
        });
      }
    }

    // Fetch user info for each chat partner
    const chatUsers: any[] = [];
    for (const [id, data] of chatMap.entries()) {
      try {
        const userDoc = await databases.getDocument(
          DATABASE_ID,
          USER_COLLECTION_ID,
          id
        );
        chatUsers.push({
          ...data,
          name: userDoc.name,
          imageUrl: userDoc.imageUrl || "",
        });
      } catch {
        chatUsers.push({ ...data, name: "Unknown User", imageUrl: "" });
      }
    }

    // Sort by latest message
    return chatUsers.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("Error fetching user chats:", error);
    return [];
  }
};

