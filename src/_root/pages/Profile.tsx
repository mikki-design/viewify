import {
  Route,
  Routes,
  Link,
  Outlet,
  useParams,
  useLocation,
} from "react-router-dom";

import { Button } from "@/components/ui";
import { LikedPosts } from "@/_root/pages";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserById } from "@/lib/react-query/queries";
import { GridPostList, Loader } from "@/components/shared";
import { useFollowUser, useUnfollowUser } from '@/lib/react-query/mutations/useFollow';
//import { useIsFollowing } from '@/lib/react-query/queries';
import { Query } from 'appwrite';
import { useQuery } from "@tanstack/react-query";
import { databases } from "@/lib/appwrite/config";
import { appwriteConfig } from "@/lib/appwrite/config";
import { useState } from "react";
import { X } from "lucide-react"; 
import ChatBox from "@/components/chat/ChatBox";
import { useChat } from "@/context/ChatContext";
const DATABASE_ID = appwriteConfig.databaseId;
const FOLLOWERS_COLLECTION_ID = appwriteConfig.followersCollectionId;


interface StabBlockProps {
  value: string | number;
  label: string;
}


const StatBlock = ({ value, label }: StabBlockProps) => (
  <div className="flex-center gap-2">
    <p className="small-semibold lg:body-bold text-primary-500">{value}</p>
    <p className="small-medium lg:base-medium text-light-2">{label}</p>
  </div>
);

export const useFollowerCount = (userId: string) => {
  return useQuery({
    queryKey: ['followerCount', userId],
    queryFn: async () => {
      const res = await databases.listDocuments(
        DATABASE_ID,
        FOLLOWERS_COLLECTION_ID,
        [Query.equal('followedId', userId)]
      );
      return res.total; // number of followers
    },
    enabled: !!userId,
  });
};
export const useFollowingCount = (userId: string) => {
  return useQuery({
    queryKey: ['followingCount', userId],
    queryFn: async () => {
      const res = await databases.listDocuments(
        DATABASE_ID,
        FOLLOWERS_COLLECTION_ID,
        [Query.equal('followerId', userId)]
      );
      return res.total;
    },
    enabled: !!userId,
  });
};

export const useIsFollowing = (followerId: string, followedId: string) => {
  return useQuery({
    queryKey: ['isFollowing', followerId, followedId],
    enabled: !!followerId && !!followedId,
    queryFn: async () => {
      if (!followerId || !followedId) return null; // ✅ return something
      
      const res = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.followersCollectionId,
        [
          Query.equal("followerId", followerId),
          Query.equal("followedId", followedId)
        ]
      );

      return res.documents[0] ?? null; // ✅ Always returns null if no match
    }
  });
};


const Profile = () =>  {
  
  const { setShowChat, setReceiverId } = useChat();
  const { id } = useParams();
  const { user } = useUserContext();
  const { pathname } = useLocation();

  const { data: currentUser } = useGetUserById(id || "");
  const { data: followerCount, isLoading: loadingFollowers } = useFollowerCount(currentUser?.$id || "");
  const { data: followingCount, isLoading: loadingFollowing } = useFollowingCount(currentUser?.$id || "");

  // ⛔ Don't run follow logic until currentUser is available
  const { data: followDoc, isLoading } = useIsFollowing(user.id, id || "");
  const { mutate: followUser } = useFollowUser({
  onSuccess: () => console.log("Followed successfully"),
  onError: (err) => console.error("Follow error:", err),
});

const { mutate: unfollowUser } = useUnfollowUser({
  onSuccess: () => console.log("Unfollowed successfully"),
  onError: (err) => console.error("Unfollow error:", err),
});
const [isLocallyFollowing, setIsLocallyFollowing] = useState<boolean | null>(null);

  const handleFollow = () => {
    console.log('Clicked follow button', followDoc);
    if (followDoc) {
      console.log('Unfollowing user', followDoc.$id);
      unfollowUser(followDoc.$id, {
      onSuccess: () => setIsLocallyFollowing(false),
    });
    } else if (currentUser) {
       console.log('➕ Following', user.id, '->', currentUser.$id);
     followUser({ followerId: user.id, followedId: id! }, {
      onSuccess: () => setIsLocallyFollowing(true),
    });
    }
  };

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
    <div className="profile-container">
      <div className="profile-inner_container">
        <div className="flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7">
          <img
            src={currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="profile"
            className="w-28 h-28 lg:h-36 lg:w-36 rounded-full"
          />
          <div className="flex flex-col flex-1 justify-between md:mt-2">
            <div className="flex flex-col w-full">
              <h1 className="text-center xl:text-left h3-bold md:h1-semibold w-full">
                {currentUser.name}
              </h1>
              <p className="small-regular md:body-medium text-light-3 text-center xl:text-left">
                @{currentUser.username}
              </p>
            </div>

            <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
              <StatBlock value={currentUser.posts.length} label="Posts" />
              <StatBlock value={loadingFollowers ? '...' : (followerCount ?? 0)} label="Followers" />
              <StatBlock value={loadingFollowing ? '...' : (followingCount ?? 0)} label="Following" />
            </div>

            <p className="small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm">
              {currentUser.bio}
            </p>
          </div>

      <div className="flex justify-center gap-4">
  {user.id === currentUser.$id ? (
    <Link
      to={`/update-profile/${currentUser.$id}`}
      className="h-12 bg-dark-4 px-5 text-light-1 flex-center gap-2 rounded-lg"
    >
      <img src="/assets/icons/edit.svg" alt="edit" width={20} height={20} />
      <p className="flex whitespace-nowrap small-medium">Edit Profile</p>
    </Link>
  ) : (
    <>
      {/* 🧍 Follow button */}
      <Button
        type="button"
        className="shad-button_primary px-8"
        onClick={handleFollow}
        disabled={isLoading}
      >
        {isLocallyFollowing ?? followDoc ? "Followed" : "Follow"}
      </Button>

      {/* 💬 Chat button — only for other users */}
      {/* 💬 Chat button — matches Follow button style */}
<Button
  type="button"
  className="shad-button_primary px-8 flex items-center gap-2"
  onClick={() => {
    setReceiverId(currentUser.$id);
    setShowChat(true);
  }}
>
  <img
    src="/assets/icons/chat.svg"
    alt="chat"
    width={20}
    height={20}
    className="invert brightness-0" // ✅ makes icon white
  />
  <span>Chat</span>
</Button>


    </>
  )}
</div>


        </div>
      </div>

      {currentUser.$id === user.id && (
        <div className="flex max-w-5xl w-full">
          <Link
            to={`/profile/${id}`}
            className={`profile-tab rounded-l-lg ${
              pathname === `/profile/${id}` && "!bg-dark-3"
            }`}
          >
            <img src={"/assets/icons/posts.svg"} alt="posts" width={20} height={20} />
            Posts
          </Link>
          <Link
            to={`/profile/${id}/liked-posts`}
            className={`profile-tab rounded-r-lg ${
              pathname === `/profile/${id}/liked-posts` && "!bg-dark-3"
            }`}
          >
            <img src={"/assets/icons/like.svg"} alt="like" width={20} height={20} />
            Liked Posts
          </Link>
         
        </div>
      )}

      <Routes>
        <Route
          index
          element={<GridPostList posts={currentUser.posts} showUser={false} />}
        />
        {currentUser.$id === user.id && (
          <Route path="/liked-posts" element={<LikedPosts />} />
        )}
      </Routes>
     
      <Outlet />
    </div>
  );
};
export default Profile;
