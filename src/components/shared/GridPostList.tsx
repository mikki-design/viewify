import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { PostStats } from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";

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
  const { user } = useUserContext();

  if (!posts || posts.length === 0) {
    return (
      <p className="text-center text-light-3 w-full">No posts to display</p>
    );
  }

  return (
    <ul className="grid-container">
      {posts.map((post) => {
        // Guard against missing or malformed data
        if (!post) return null;

        const imageUrl =
          post?.imageUrl || "/assets/icons/image-placeholder.svg";

        const creator = post?.creator || {};
        const creatorImage =
          creator?.imageUrl || "/assets/icons/profile-placeholder.svg";
        const creatorName = creator?.name || "Unknown User";

        return (
          <li key={post.$id} className="relative min-w-80 h-80">
            <Link to={`/posts/${post.$id}`} className="grid-post_link">
              <img
                src={imageUrl}
                alt="post"
                className="h-full w-full object-cover"
                onError={(e) =>
                  (e.currentTarget.src = "/assets/icons/image-placeholder.svg")
                }
              />
            </Link>

            <div className="grid-post_user">
              {showUser && (
                <div className="flex items-center justify-start gap-2 flex-1">
                  <img
                    src={creatorImage}
                    alt={creatorName}
                    className="w-8 h-8 rounded-full"
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
