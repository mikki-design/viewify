import { Outlet } from "react-router-dom";

import Topbar from "@/components/shared/Topbar";
import Bottombar from "@/components/shared/Bottombar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import { useUserContext } from "@/context/AuthContext";
import { useChatNotifications } from "@/context/ChatContext";

const RootLayout = () => {
const { user } = useUserContext();
  useChatNotifications(user?.id); // ✅ activates notification listener

  return (
    <div className="w-full md:flex">
      <Topbar />
      <LeftSidebar />

      <section className="flex flex-1 h-full">
        <Outlet />
      </section>

      <Bottombar />
    </div>
  );
};

export default RootLayout;
