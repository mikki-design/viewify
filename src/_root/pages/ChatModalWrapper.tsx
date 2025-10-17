import { useChat } from "@/context/ChatContext";
import ChatModal from "@/components/chat/ChatModal";

const ChatModalWrapper = () => {
  const { setShowChat, setReceiverId } = useChat();

  return (
    <ChatModal
      isOpen={true} // always open on this route
      onClose={() => (window.history.back())} // go back when closed
      onSelectChat={(id) => {
        setReceiverId(id);
        setShowChat(true); // open chatbox overlay
      }}
    />
  );
};

export default ChatModalWrapper;
