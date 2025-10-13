import { Helmet} from "react-helmet-async";
import PostForm from "@/components/forms/PostForm";

const CreatePost = () => {
  return (
    <>
      <Helmet>
        <title>Create Post | Viewify</title>
        <meta name="description" content="Create and share your post on Viewify — a GenZ social media platform." />
        <meta property="og:title" content="Create Post | Viewify" />
        <meta property="og:description" content="Share your thoughts and connect with others on Viewify." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="flex flex-1">
        <div className="common-container">
          <div className="max-w-5xl flex-start gap-3 justify-start w-full">
            <img
              src="/assets/icons/add-post.svg"
              width={36}
              height={36}
              alt="add"
            />
            <h2 className="h3-bold md:h2-bold text-left w-full">Create Post</h2>
          </div>

          <PostForm action="Create" />
        </div>
      </div>
    </>
  );
};

export default CreatePost;
