import { Models } from "appwrite";
import { Helmet } from "react-helmet-async";

import { GridPostList, Loader } from "@/components/shared";
import { useGetCurrentUser } from "@/lib/react-query/queries";

const Saved = () => {
  const { data: currentUser } = useGetCurrentUser();

  // Filter out deleted or missing posts
  const savePosts =
    currentUser?.save
      ?.filter((savePost: Models.Document) => savePost?.post) // only valid posts
     .map((savePost: Models.Document) => ({
  ...savePost.post,
  creator: {
    name: currentUser.name,
    username: currentUser.username,
    imageUrl: currentUser.imageUrl,
  },
}))

      .reverse() || [];

  return (
    <>
      <Helmet>
        <title>Saved Posts | Viewify</title>
        <meta
          name="description"
          content="View all the posts you've saved on Viewify — revisit your favorite moments and inspirations anytime."
        />
        <meta property="og:title" content="Saved Posts | Viewify" />
        <meta
          property="og:description"
          content="Revisit and explore your saved posts on Viewify — your personalized collection of great content."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="saved-container">
        <div className="flex gap-2 w-full max-w-5xl">
          <img
            src="/assets/icons/save.svg"
            width={36}
            height={36}
            alt="save icon"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Saved Posts</h2>
        </div>

        {!currentUser ? (
          <Loader />
        ) : (
          <ul className="w-full flex justify-center max-w-5xl gap-9">
            {savePosts.length === 0 ? (
              <p className="text-light-4">No available posts</p>
            ) : (
              <GridPostList posts={savePosts} showStats={false} />
            )}
          </ul>
        )}
      </div>
    </>
  );
};

export default Saved;
