import { Models } from "appwrite";
import { Helmet } from "react-helmet-async";
import { GridPostList, Loader } from "@/components/shared";
import { useGetCurrentUser } from "@/lib/react-query/queries";

const LikedPosts = () => {
  const { data: currentUser, isLoading } = useGetCurrentUser();

  // 🧩 Process liked posts safely
  const likedPosts =
    currentUser?.liked
      ?.map((like: Models.Document) => {
        const post = like.post || like;
        if (!post) return null;

        const user = post.user || currentUser;

        return {
          ...post,
          creator: {
            name: user?.name || "Unknown User",
            username: user?.username || "unknown",
            imageUrl:
              user?.imageUrl || "/assets/icons/profile-placeholder.svg",
          },
        };
      })
      .filter(
        (p: Models.Document | null): p is Models.Document => p !== null
      )
      .reverse() || [];

  return (
    <>
      <Helmet>
        <title>Liked Posts | Viewify</title>
        <meta
          name="description"
          content="See all the posts you’ve liked on Viewify — your favorite content in one place."
        />
        <meta property="og:title" content="Liked Posts | Viewify" />
        <meta
          property="og:description"
          content="View and revisit all your liked posts on Viewify."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="flex flex-col items-center w-full">
        {isLoading ? (
          <Loader />
        ) : likedPosts.length === 0 ? (
          <p className="text-light-4 mt-10">No liked posts</p>
        ) : (
          <GridPostList posts={likedPosts} showStats={false} />
        )}
      </div>
    </>
  );
};

export default LikedPosts;
