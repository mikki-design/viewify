import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import { INavLink } from "@/types";
import { sidebarLinks } from "@/constants";
import { Loader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useSignOutAccount } from "@/lib/react-query/queries";
import { useUserContext, INITIAL_USER } from "@/context/AuthContext";
import { useEffect } from "react";

import { fetchUserChats } from "@/lib/appwrite/api/chat";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, setUser, setIsAuthenticated, isLoading } = useUserContext();
  const [unreadCount, setUnreadCount] = useState(0);
  
  
  useEffect(() => {
  if (!user?.id) return;

  const loadUnread = async () => {
    const chats = await fetchUserChats(user.id);
    const totalUnread = chats.reduce((acc, chat) => acc + (chat.unread || 0), 0);
    setUnreadCount(totalUnread);
  };

  loadUnread();
}, [user?.id]);


 const handleLinkClick = (route: string) => {
  if (route === "/chat") {
    navigate("/chat"); // open ChatModalWrapper route
  } else {
    navigate(route);
  }
};

  const { mutate: signOut } = useSignOutAccount();

  const handleSignOut = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    signOut();
    setIsAuthenticated(false);
    setUser(INITIAL_USER);
    navigate("/sign-in");
  };

  return (
    <>
      <nav className="leftsidebar">
        <div className="flex flex-col gap-11">
          <Link to="/" className="flex gap-3 items-center">
            <img
              src="/assets/images/viewss.png"
              alt="logo"
              width={150}
              height={26}
            />
          </Link>

          {isLoading || !user.email ? (
            <div className="h-14">
              <Loader />
            </div>
          ) : (
            <Link to={`/profile/${user.id}`} className="flex gap-3 items-center">
              <img
                src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
                alt="profile"
                className="h-14 w-14 rounded-full"
              />
              <div className="flex flex-col">
                <p className="body-bold">{user.name}</p>
                <p className="small-regular text-light-3">@{user.username}</p>
              </div>
            </Link>
          )}

          <ul className="flex flex-col gap-6">
            {sidebarLinks.map((link: INavLink) => {
  const isActive = pathname === link.route;

  return (
    <li
      key={link.label}
      className={`leftsidebar-link group ${isActive && "bg-primary-500"}`}
    >
      <button
        onClick={() => handleLinkClick(link.route)}
        className="flex gap-4 items-center p-4 w-full text-left relative"
      >
        <img
          src={link.imgURL}
          alt={link.label}
          className={`group-hover:invert-white ${isActive && "invert-white"}`}
        />
        {link.label}

        {/* 🔔 Unread badge */}
        {link.route === "/chat" && unreadCount > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
    </li>
  );
})}

          </ul>
        </div>

        <Button
          variant="ghost"
          className="shad-button_ghost"
          onClick={(e) => handleSignOut(e)}
        >
          <img src="/assets/icons/logout.svg" alt="logout" />
          <p className="small-medium lg:base-medium">Logout</p>
        </Button>
      </nav>


    </>
  );
};

export default LeftSidebar;
