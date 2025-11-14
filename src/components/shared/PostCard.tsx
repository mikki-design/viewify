import { Models, Query } from "appwrite";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PostStats } from "@/components/shared";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import { databases } from "@/lib/appwrite/config";

type PostCardProps = {
  post: Models.Document;
};

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COMMENTS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID;

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useUserContext();
  const [commentCount, setCommentCount] = useState<number>(0);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [isLongCaption, setIsLongCaption] = useState(false);

  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, COMMENTS_COLLECTION_ID, [
          Query.equal("postId", post.$id),
        ]);
        setCommentCount(response.total);
      } catch (error) {
        console.error("Failed to fetch comment count:", error);
      }
    };

    fetchCommentCount();
  }, [post.$id]);

  // Detect if caption exceeds 3 lines
  useEffect(() => {
    if (post.caption && post.caption.split(" ").length > 30) {
      // roughly ~3 lines
      setIsLongCaption(true);
    }
  }, [post.caption]);

  if (!post.creator) return null;

  return (
    <div className="post-card">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.creator.$id}`}>
            <img
              src={
                post.creator?.imageUrl ||
                "/assets/icons/profile-placeholder.svg"
              }
              alt="creator"
              className="w-12 lg:h-12 rounded-full"
            />
          </Link>

          <div className="flex flex-col">
            <p className="base-medium lg:body-bold text-light-1">
              {post.creator.name}
            </p>
            <div className="flex-center gap-2 text-light-3">
              <p className="subtle-semibold lg:small-regular">
                {multiFormatDateString(post.$createdAt)}
              </p>
              •
              <p className="subtle-semibold lg:small-regular">
                {post.location}
              </p>
            </div>
          </div>
        </div>

        <Link
          to={`/update-post/${post.$id}`}
          className={`${user.id !== post.creator.$id && "hidden"}`}
        >
          <img
            src={"/assets/icons/edit.svg"}
            alt="edit"
            width={20}
            height={20}
          />
        </Link>
      </div>

      {/* ✅ Post caption (3 lines + Read more) */}
      <div className="small-medium lg:base-medium py-5">
        <p className={`${showFullCaption ? "" : "line-clamp-3"} text-light-1`}>
          {post.caption}
        </p>

        {isLongCaption && !showFullCaption && (
          <button
            onClick={() => setShowFullCaption(true)}
            className="text-primary-500 mt-1 text-sm hover:underline"
          >
            Read more
          </button>
        )}
      </div>

      {/* ✅ Tags */}
      <ul className="flex gap-1 mt-2 flex-wrap">
        {post.tags.map((tag: string, index: number) => (
          <li key={`${tag}${index}`} className="text-light-3 small-regular">
            #{tag}
          </li>
        ))}
      </ul>
{/* ✅ Post Image / Video */}
{post.videoUrl ? (
  <div className="relative w-full rounded-xl overflow-hidden group">
    <video
      src={post.videoUrl}
      ref={(el: HTMLVideoElement | null) => {
        if (!el) return;
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const video = entry.target as HTMLVideoElement;
              if (entry.isIntersecting) video.play().catch(() => {});
              else video.pause();
            });
          },
          { threshold: 0.5 }
        );
        observer.observe(el);
      }}
      muted
      loop
      playsInline
      className="w-full object-contain rounded-xl cursor-pointer"
      onClick={(e) => {
        const video = e.currentTarget as HTMLVideoElement;
        if (video.paused) video.play();
        else video.pause();
      }}
    />

    {/* Play/Pause Overlay */}
    <button
      onClick={(e) => {
        e.preventDefault();
        const video = e.currentTarget.parentElement?.querySelector(
          "video"
        ) as HTMLVideoElement | null;
        if (!video) return;
        if (video.paused) video.play();
        else video.pause();
      }}
      className="absolute inset-0 flex items-center justify-center pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-16 h-16 text-white drop-shadow-lg"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
      </svg>
    </button>
  </div>
) : (
  <img
    src={post.thumbnailUrl || post.imageUrl}
    alt="post"
    className="w-full rounded-xl object-cover"
  />
)}





      {/* ✅ Post Stats + Comment Count */}
      <PostStats post={post} userId={user.id} commentCount={commentCount} />
    </div>
  );
};

export default PostCard;
