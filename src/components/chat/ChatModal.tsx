import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { fetchUserChats } from "@/lib/appwrite/api/chat"; // you’ll create this
import { useUserContext } from "@/context/AuthContext";


interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChat: (receiverId: string) => void;
}

const ChatModal = ({ isOpen, onClose, onSelectChat }: ChatModalProps) => {
  const { user } = useUserContext();
  const [chatUsers, setChatUsers] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id && isOpen) {
      fetchUserChats(user.id).then(setChatUsers);
    }
  }, [isOpen, user?.id]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-xl bg-dark-2 p-6 text-white">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Chats
          </Dialog.Title>
          {chatUsers.length === 0 ? (
            <p className="text-gray-400 text-sm">No chats yet</p>
          ) : (
            <ul className="space-y-3">
              {chatUsers.map((u) => (
                <li
                  key={u.$id}
                  className="flex items-center justify-between bg-dark-3 p-3 rounded-lg hover:bg-dark-4 cursor-pointer"
                  onClick={() => {
                    onSelectChat(u.$id);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={u.imageUrl || "/assets/icons/profile-placeholder.svg"}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="text-white font-medium">{u.name}</span>
                  </div>
                  {u.unread > 0 && (
      <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5">
        {u.unread}
      </span>
    )}
                </li>
              ))}
            </ul>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ChatModal;
