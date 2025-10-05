import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Comment from "@/components/shared/comment";
import { Button } from "@/components/ui";
import { Loader } from "@/components/shared";
import { GridPostList, PostStats } from "@/components/shared";

import {
  useGetPostById,
  useGetUserPosts,
  useDeletePost,
  useAddComment,
  useGetCommentsForPost,
  useAddCommentOrReply,
} from "@/lib/react-query/queries";

import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import { CommentType } from "@/types";

const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUserContext();

  const { data: post, isLoading } = useGetPostById(id);
  const { data: userPosts, isLoading: isUserPostLoading } = useGetUserPosts(
    post?.creator.$id
  );
  const { mutate: deletePost } = useDeletePost();

  const relatedPosts = userPosts?.documents.filter(
    (userPost) => userPost.$id !== id
  );

  // Comments state
  const [newComment, setNewComment] = useState("");
  const [activeReply, setActiveReply] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});
  const [commentsList, setCommentsList] = useState<CommentType[]>([]);



  const handleReplyChange = (commentId: string, value: string) => {
  setReplyTexts((prev) => ({ ...prev, [commentId]: value }));
};

  const { mutate: addComment, isLoading: isAddingComment } = useAddComment({
  onSuccess: (newComment) => {
   const newCommentObj: CommentType = {
  $id: crypto.randomUUID(),
  $collectionId: "",
  $databaseId: "",
  $createdAt: new Date().toISOString(),
  $updatedAt: new Date().toISOString(),
  $permissions: [],
  content: newComment,
  user: {
    name: user.name,
    imageUrl: user.imageUrl,
  },
  replies: [],
};
    // Instantly update local comment list
setCommentsList((prev) => [...prev, newCommentObj]);
    setNewComment("");
  },
});
  const { mutate: addReply } = useAddCommentOrReply();
  const { data: commentDocs, isLoading: isCommentsLoading } = useGetCommentsForPost(id ?? "");
  // ✅ Sync fetched comments into local state whenever Appwrite data changes
useEffect(() => {
  if (commentDocs) {
    setCommentsList(commentDocs);
  }
}, [commentDocs]);

  const comments: CommentType[] = (commentDocs ?? []).map((doc: any) => ({
    $id: doc.$id,
    $collectionId: doc.$collectionId,
    $databaseId: doc.$databaseId,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
    $permissions: doc.$permissions,
    content: doc.content ?? "",
    postId: doc.postId,
    user: doc.user
      ? {
          name: doc.user.name ?? "Unknown User",
          imageUrl: doc.user.imageUrl ?? "/assets/icons/profile-placeholder.svg",
        }
      : undefined,
    replies: doc.replies ?? [],
  }));

  const handleDeletePost = () => {
    deletePost({ postId: id, imageId: post?.imageId });
    navigate(-1);
  };

const handleAddComment = (newComment: string) => {
  if (!newComment.trim()) return;

  // 👇 Create a local comment immediately
  const tempComment = {
    $id: `temp-${Date.now()}`, // temporary ID
    content: newComment,
    user: {
      name: user.name,
      imageUrl: user.imageUrl || "/assets/icons/profile-placeholder.svg",
    },
    replies: [],
  };

  // Update local state instantly
  setCommentsList((prev) => [...prev, tempComment]);
  setNewComment("");

  // 👇 Then send to Appwrite in the background
  addComment({
    postId: id ?? "",
    content: newComment,
    userId: user.id,
  });
};

  const handleReplySubmit = (e: React.FormEvent, parentId: string) => {
  e.preventDefault();

  const text = replyTexts[parentId] || "";
  if (!text.trim()) return;

  addReply({
    postId: id ?? "",
    content: text,
    parentId,
    userId: user.id,
  });

  // clear only that reply field
  setReplyTexts((prev) => ({ ...prev, [parentId]: "" }));
  setActiveReply(null);
};


// Removed handleDeleteReply because setComments does not exist


/*  const Comment = React.memo(({ comment }: { comment: CommentType }) => {
  const { data: replies } = useGetRepliesForComment(comment.$id);

    return (
      <div className="bg-dark-4 rounded-lg p-3 flex gap-3">
        <img
          src={comment.user?.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt={comment.user?.name}
          className="w-8 h-8 rounded-full"
        />
        <div>
          <p className="small-bold">{comment.user?.name}</p>
          <p className="small-regular text-light-2">{comment.content}</p>

          {/* Reply button *}
          <button
            onClick={() =>
              setActiveReply(activeReply === comment.$id ? null : comment.$id)
            }
            className="text-primary-500 small-medium"
          >
            Reply
          </button>

          {/* Reply form *}
          {activeReply === comment.$id && (
           
              <div className="flex items-center gap-3 mb-6 ">
              <input
               key={`reply-${comment.$id}`}   // 🔑 stable key so React reuses it
               id={`reply-input-${comment.$id}`}
                type="text"
                placeholder="Write a reply..."
                value={replyTexts[comment.$id] || ""}
                onChange={(e) => handleReplyChange(comment.$id, e.target.value)}
                 className="flex-1 bg-dark-4 rounded-sm px-2 py-2 text-light-1 focus:outline-none"
              />
              <button type="button"
              onClick={(e) => handleReplySubmit(e, comment.$id)}
      disabled={!replyTexts[comment.$id]?.trim()} className="shad-button_primary px-4 rounded-sm"
              >
                Reply</button>
              </div>
            
          )}

          {/* Show replies *}
          {replies?.map((reply: any) => (
            <div key={reply.$id} className="ml-8 mt-2 flex gap-2">
              <img
                src={
                  reply.user?.imageUrl ||
                  "/assets/icons/profile-placeholder.svg"
                }
                alt={reply.user?.name}
                className="w-6 h-6 rounded-full"
              />
              <p className="small-regular">{reply.content}</p>
            </div>
          ))}
        </div>
      </div>
    );
  });*/

/*<Comment
  key={comment.$id}
  comment={comment}
  activeReply={activeReply}
  setActiveReply={setActiveReply}
  replyTexts={replyTexts}
  handleReplyChange={handleReplyChange}
  handleReplySubmit={handleReplySubmit}
/>*/

  return (
    <div className="post_details-container">
      <div className="hidden md:flex max-w-5xl w-full">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="shad-button_ghost"
        >
          <img src={"/assets/icons/back.svg"} alt="back" width={24} height={24} />
          <p className="small-medium lg:base-medium">Back</p>
        </Button>
      </div>

      {isLoading || !post ? (
        <Loader />
      ) : (
        <div className="post_details-card">
          <img src={post?.imageUrl} alt="creator" className="post_details-img" />

          <div className="post_details-info">
            <div className="flex-between w-full">
              <Link
                to={`/profile/${post?.creator.$id}`}
                className="flex items-center gap-3"
              >
                <img
                  src={
                    post?.creator.imageUrl ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                  alt="creator"
                  className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
                />
                <div className="flex gap-1 flex-col">
                  <p className="base-medium lg:body-bold text-light-1">
                    {post?.creator.name}
                  </p>
                  <div className="flex-center gap-2 text-light-3">
                    <p className="subtle-semibold lg:small-regular ">
                      {multiFormatDateString(post?.$createdAt)}
                    </p>
                    •
                    <p className="subtle-semibold lg:small-regular">
                      {post?.location}
                    </p>
                  </div>
                </div>
              </Link>

              <div className="flex-center gap-4">
                <Link
                  to={`/update-post/${post?.$id}`}
                  className={`${user.id !== post?.creator.$id && "hidden"}`}
                >
                  
                </Link>
{user.id === post?.creator.$id && (
                <Button
                  onClick={handleDeletePost}
                  variant="ghost"
                  className={`post_details-delete_btn ${
                    user.id !== post?.creator.$id && "hidden"
                  }`}
                >
                   <img
                    src={"/assets/icons/delete.svg"}
                    alt="delete"
                    width={24}
                    height={24}
                  />
                </Button>
                )}
              </div>
            </div>

            <hr className="border w-full border-dark-4/80" />

            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
              <p>{post?.caption}</p>
              <ul className="flex gap-1 mt-2">
                {post?.tags.map((tag: string, index: number) => (
                  <li
                    key={`${tag}${index}`}
                    className="text-light-3 small-regular"
                  >
                    #{tag}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full">
              <PostStats post={post} userId={user.id} commentCount={comments.length} />
            </div>

            {/* Comment Section */}
            <div id="comments" className="mt-8 w-full">
              <h3 className="body-bold mb-4">Comments</h3>

              {/* Comment Form */}
              <form
  onSubmit={(e) => {
    e.preventDefault();
    handleAddComment();
  }}
             className="flex items-center gap-3 mb-6" >
                <input
                  type="text"
                  name="comment" // <-- helps mobile keyboards
    id="comment"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-dark-4 rounded-lg px-4 py-2 text-light-1 focus:outline-none"
                />
                <Button
                  type="submit"
                  
                  disabled={!newComment.trim() || isAddingComment}
                  
                >
              
                  Post
                </Button>
                </form>
             

              {/* Comment List */}
              {isCommentsLoading ? (
  <Loader />
) : commentsList.length > 0 ? (
  <div className="flex flex-col gap-4">
    {commentsList.map((comment) => (
      <Comment
        key={comment.$id}
        comment={comment}
        activeReply={activeReply}
        setActiveReply={setActiveReply}
        replyTexts={replyTexts}
        handleReplyChange={handleReplyChange}
        handleReplySubmit={handleReplySubmit}
      />
    ))}
  </div>
) : (
  <p className="text-light-3">No comments yet. Be the first!</p>
)}

            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl">
        <hr className="border w-full border-dark-4/80" />

        <h3 className="body-bold md:h3-bold w-full my-10">
          More Related Posts
        </h3>
        {isUserPostLoading || !relatedPosts ? (
          <Loader />
        ) : (
          <GridPostList posts={relatedPosts} />
        )}
      </div>
    </div>
  );
};

export default PostDetails;
