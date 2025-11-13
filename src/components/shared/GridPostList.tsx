import { useEffect, useRef } from "react";
import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { PostStats } from "@/components/shared";
import { Play } from "lucide-react";

type GridPostListProps = {
  posts: Models.Document[];
  showUser?: boolean;
  showStats?: boolean;
  onUnsave?: (savedId: string) => void;
};

const GridPostList = ({
  posts,
  showUser = true,
  showStats = true,
}: GridPostListProps) => {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // 🎥 Handle autoplay/pause depending on visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => {}); // Play when visible
          } else {
            video.pause(); // Pause when off-screen
          }
        });
      },
      { threshold: 0.5 } // 50% visible before playing
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [posts]);

  if (!posts || posts.length === 0) {
    return (
      <p className="text-center text-light-3 w-full">No posts to display</p>
    );
  }

  return (
    <ul className="grid-container">
      {posts.map((post, index) => {
        if (!post) return null;

        const fileUrl = post?.imageUrl || post?.videoUrl || "";
        const fileType = post?.fileType || "";
        const isVideo =
          fileType.includes("video") ||
          fileUrl.endsWith(".mp4") ||
          fileUrl.endsWith(".webm") ||
          fileUrl.endsWith(".ogg");

        const user = post?.creator || {};
        const creatorImage =
          user?.imageUrl || "/assets/icons/profile-placeholder.svg";
        const creatorName = user?.username || "Unknown User";

        return (
          <li
            key={post.$id}
            className="relative min-w-80 h-80 group overflow-hidden rounded-[10px]"
          >
            <Link to={`/posts/${post.$id}`} className="grid-post_link block w-full h-full">
              {isVideo ? (
                <div className="relative w-full h-full">
                  <video
                    ref={(el) => (videoRefs.current[index] = el)}
                    src={fileUrl}
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover"
                    onError={(e) =>
                      (e.currentTarget.poster =
                        "/assets/icons/image-placeholder.svg")
                    }
                  />
                  {/* Play Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Play className="w-16 h-16 text-white drop-shadow-lg" />
                  </div>
                </div>
              ) : (
                <img
                  src={fileUrl || "/assets/icons/image-placeholder.svg"}
                  alt="post"
                  className="h-full w-full object-cover"
                  onError={(e) =>
                    (e.currentTarget.src =
                      "/assets/icons/image-placeholder.svg")
                  }
                />
              )}
            </Link>

            <div className="grid-post_user absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
              {showUser && (
                <div className="flex items-center justify-start gap-2 flex-1 text-white">
                  <img
                    src={creatorImage}
                    alt={creatorName}
                    className="w-8 h-8 rounded-full border border-white/40"
                  />
                  <p className="line-clamp-1">{creatorName}</p>
                </div>
              )}
              {showStats && (
                <PostStats
                  post={post}
                  userId={user?.id}
                  commentCount={post?.commentCount || 0}
                />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default GridPostList;
