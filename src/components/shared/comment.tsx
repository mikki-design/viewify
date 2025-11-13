import React, { useState } from "react";
import { CommentType } from "@/types";
import { useUserContext } from "@/context/AuthContext";
import { useGetRepliesForComment } from "@/lib/react-query/queries";
import { useUpdateComment, useDeleteComment } from "@/lib/react-query/queries";

interface CommentProps {
  comment: CommentType;
  activeReply: string | null;
  setActiveReply: (id: string | null) => void;
  replyTexts: { [key: string]: string };
  handleReplyChange: (id: string, value: string) => void;
  handleReplySubmit: (e: React.FormEvent, parentId: string) => void;
  depth?: number;
}

const Comment = ({
  comment,
  activeReply,
  setActiveReply,
  replyTexts,
  handleReplyChange,
  handleReplySubmit,
  depth = 0,
}: CommentProps) => {
  const { user } = useUserContext();
  const { data: replies } = useGetRepliesForComment(comment.$id);

  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  const handleReplyClick = () => {
    const tag = `@${comment.user?.name || "Unknown User"} `;
    setActiveReply(comment.$id);

    if (!replyTexts[comment.$id]?.startsWith(tag)) {
      handleReplyChange(comment.$id, tag);
    }
  };

  // ⭐ FIXED: COMMENT OWNER CHECK FOR BOTH COMMENTS & REPLIES
  const commentOwnerId =
    comment.userId ||                           // top-level
    comment.user?.$id ||                       // nested replies
    comment.user?.id ||                        // fallback
    null;

  const isOwner = user?.id === commentOwnerId;

  return (
    <div className="flex flex-col">
      <div className="relative flex items-start gap-3 py-3">
        {depth > 0 && (
          <div className="absolute left-[14px] top-0 bottom-0 w-px bg-dark-3"></div>
        )}

        <img
          src={comment.user?.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt={comment.user?.name || "User"}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover z-10"
        />

        <div className="flex-1 bg-dark-3 rounded-xl p-3 sm:p-4 border border-dark-3">
          <p className="text-xs sm:text-sm md:text-base font-semibold text-light-1">
            {comment.user?.name || "Unknown User"}
          </p>

          {isEditing ? (
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="bg-dark-4 rounded px-2 py-1 w-full text-light-1 mt-1"
            />
          ) : (
            <p className="text-[11px] sm:text-sm md:text-[15px] text-light-2 leading-relaxed whitespace-pre-wrap mt-1">
              {comment.content}
            </p>
          )}

          <div className="flex gap-3 mt-2 text-xs">
            <button
              onClick={handleReplyClick}
              className="text-primary-500 font-medium hover:underline"
            >
              Reply
            </button>

            {/* ⭐ FIXED: NOW WORKS FOR BOTH COMMENTS AND REPLIES */}
            {isOwner && (
              <>
                {isEditing ? (
                 <button
  onClick={() => {
    updateCommentMutation.mutate(
      { commentId: comment.$id, content: editText },
      {
        onSuccess: () => {
          comment.content = editText;  // ✅ Forces UI to update instantly
          setIsEditing(false);
        },
      }
    );
  }}
  className="text-green-400 font-medium"
>
  Save
</button>

                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-yellow-400 font-medium"
                  >
                    Edit
                  </button>
                )}

                <button
                  onClick={() =>
                    deleteCommentMutation.mutate({ commentId: comment.$id })
                  }
                  className="text-red-400 font-medium"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reply form */}
      {activeReply === comment.$id && (
        <form
          onSubmit={(e) => handleReplySubmit(e, comment.$id)}
          className="ml-1 mt-1 flex flex-col gap-2"
        >
          <textarea
            placeholder="Write a reply..."
            value={replyTexts[comment.$id] || ""}
            onChange={(e) => handleReplyChange(comment.$id, e.target.value)}
            className="w-full min-h-[60px] bg-dark-3 rounded-lg px-3 py-2 text-light-1"
          />
          <button
            type="submit"
            disabled={!replyTexts[comment.$id]?.trim()}
            className="self-end px-4 py-2 bg-primary-500 text-white rounded disabled:opacity-50"
          >
            Reply
          </button>
        </form>
      )}

      {/* Nested replies */}
      {replies && replies.length > 0 && (
        <div className="ml-4 border-l border-dark-3 pl-5 flex flex-col gap-3">
          {replies.map((reply) => (
            <Comment
              key={reply.$id}
              comment={reply}
              activeReply={activeReply}
              setActiveReply={setActiveReply}
              replyTexts={replyTexts}
              handleReplyChange={handleReplyChange}
              handleReplySubmit={handleReplySubmit}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
