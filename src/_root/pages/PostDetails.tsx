import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Comment from "@/components/shared/comment";
import { Button } from "@/components/ui";
import { Loader, GridPostList, PostStats } from "@/components/shared";

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

  // 🧩 Local comment states
  const [newComment, setNewComment] = useState("");
  const [commentsList, setCommentsList] = useState<CommentType[]>([]);
  const [activeReply, setActiveReply] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});

  const { mutate: addComment, isLoading: isAddingComment } = useAddComment();
  const { mutate: addReply } = useAddCommentOrReply();
  const { data: commentDocs, isLoading: isCommentsLoading } =
    useGetCommentsForPost(id ?? "");

  // 🧩 Sync comments from Appwrite when loaded
  useEffect(() => {
    if (commentDocs) {
      const formatted = commentDocs.map((doc: any) => ({
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
              imageUrl:
                doc.user.imageUrl ?? "/assets/icons/profile-placeholder.svg",
            }
          : undefined,
        replies: doc.replies ?? [],
      }));

      setCommentsList((prev) => {
        if (
          JSON.stringify(prev.map((c) => c.$id)) ===
          JSON.stringify(formatted.map((c) => c.$id))
        ) {
          return prev;
        }
        return formatted;
      });
    }
  }, [commentDocs]);

  const handleReplyChange = (commentId: string, value: string) => {
    setReplyTexts((prev) => ({ ...prev, [commentId]: value }));
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !user?.name) return;

    const tempId = crypto.randomUUID();

    // 🟩 Create temp comment for instant display
    const tempComment: CommentType = {
      $id: tempId,
      $collectionId: "",
      $databaseId: "",
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
      $permissions: [],
      content: newComment,
      postId: id ?? "",
      user: {
        name: user.name,
        imageUrl: user.imageUrl || "/assets/icons/profile-placeholder.svg",
      },
      replies: [],
    };

    // 🟩 Show immediately in UI
    setCommentsList((prev) => [...prev, tempComment]);
    setNewComment("");

    // 🟩 Save to Appwrite in background
    addComment(
      { postId: id ?? "", userId: user.id, content: newComment },
      {
        onSuccess: (savedComment: any) => {
          setCommentsList((prev) =>
            prev.map((c) =>
              c.$id === tempId
                ? {
                    ...savedComment,
                    user: {
                      name: user.name,
                      imageUrl:
                        user.imageUrl ||
                        "/assets/icons/profile-placeholder.svg",
                    },
                  }
                : c
            )
          );
        },
        onError: () => {
          setCommentsList((prev) => prev.filter((c) => c.$id !== tempId));
        },
      }
    );
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

    setReplyTexts((prev) => ({ ...prev, [parentId]: "" }));
    setActiveReply(null);
  };

  const handleDeletePost = () => {
    deletePost({ postId: id, imageId: post?.imageId });
    navigate(-1);
  };

  return (
    <div className="post_details-container">
      <div className="flex items-center max-w-5xl w-full mb-4">
  <Button
    onClick={() => navigate(-1)}
    variant="ghost"
    className="shad-button_ghost flex items-center gap-2"
  >
    <img src={"/assets/icons/back.svg"} alt="back" width={20} height={20} />
    <p className="hidden sm:block small-medium lg:base-medium">Back</p>
  </Button>
</div>


      {isLoading || !post ? (
        <Loader />
      ) : (
        <div className="post_details-card">
          {/* Display Image or Video */}
{post?.videoUrl ? (
  <video
    src={post.videoUrl}
    poster={post.thumbnailUrl}
    controls
    className="post_details-img rounded-xl"
  />
) : (
  <img
    src={post?.imageUrl}
    alt="post"
    className="post_details-img rounded-xl"
  />
)}

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

              {user.id === post?.creator.$id && (
                <Button
                  onClick={handleDeletePost}
                  variant="ghost"
                  className="post_details-delete_btn"
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
              <PostStats
                post={post}
                userId={user.id}
                commentCount={commentsList.length}
              />
            </div>

            {/* 🗨️ Comment Section */}
            <div id="comments" className="mt-8 w-full">
              <h3 className="body-bold mb-4">Comments</h3>

              {/* Add Comment Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddComment();
                }}
                className="flex items-center gap-3 mb-6"
              >
                <textarea
                  
                  id="comment"
                  name="comment"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-dark-4 rounded-lg px-4 py-2 text-light-1 focus:outline-none"
                />
                <Button type="submit" disabled={!newComment.trim() || isAddingComment}>
                  Post
                </Button>
              </form>

              {/* Render Comments */}
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
        <h3 className="body-bold md:h3-bold w-full my-10">More Related Posts</h3>
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