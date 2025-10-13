import React from "react";
import { CommentType } from "@/types";
import { useGetRepliesForComment } from "@/lib/react-query/queries";

const Comment = ({
  comment,
  activeReply,
  setActiveReply,
  replyTexts,
  handleReplyChange,
  handleReplySubmit,
  depth = 0,
}: {
  comment: CommentType;
  activeReply: string | null;
  setActiveReply: (id: string | null) => void;
  replyTexts: { [key: string]: string };
  handleReplyChange: (id: string, value: string) => void;
  handleReplySubmit: (e: React.FormEvent, parentId: string) => void;
  depth?: number;
}) => {
  const { data: replies } = useGetRepliesForComment(comment.$id);

  // Function to open reply box and prefill mention
  const handleReplyClick = () => {
    const tag = `@${comment.user?.name || "Unknown User"} `;
    setActiveReply(comment.$id);

    // If not already prefixed with the tag, prefill it
    if (!replyTexts[comment.$id]?.startsWith(tag)) {
      handleReplyChange(comment.$id, tag);
    }
  };

  return (
    <div className="flex flex-col">
      {/* --- Comment Block --- */}
      <div className="relative flex items-start gap-3 py-3">
        {/* Vertical line for grouping replies */}
        {depth > 0 && (
          <div className="absolute left-[14px] top-0 bottom-0 w-px bg-dark-3"></div>
        )}

        {/* Avatar */}
        <img
          src={comment.user?.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt={comment.user?.name}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover z-10"
        />

        {/* Comment content */}
        <div className="flex-1 bg-dark-3 rounded-xl p-3 sm:p-4 border border-dark-3">
          {/* Username */}
          <p className="text-xs sm:text-sm md:text-base font-semibold text-light-1">
            {comment.user?.name || "Unknown User"}
          </p>

          {/* Content */}
          <p className="text-[11px] sm:text-sm md:text-[15px] text-light-2 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>

          {/* Reply button */}
          <button
            onClick={handleReplyClick}
            className="text-primary-500 text-xs sm:text-sm font-medium mt-1 hover:underline"
          >
            Reply
          </button>
        </div>
      </div>

      {/* --- Reply Input --- */}
      {activeReply === comment.$id && (
        <form
          onSubmit={(e) => handleReplySubmit(e, comment.$id)}
          className="flex flex-col gap-2 ml-1 mt-1"
        >
          <textarea
            placeholder="Write a reply..."
            value={replyTexts[comment.$id] || ""}
            onChange={(e) => handleReplyChange(comment.$id, e.target.value)}
            className="w-full min-h-[60px] bg-dark-3 rounded-lg px-3 py-2 text-xs sm:text-sm md:text-base text-light-1 placeholder:text-light-3 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
          <button
            type="submit"
            disabled={!replyTexts[comment.$id]?.trim()}
            className="self-end px-4 py-2 text-xs sm:text-sm font-medium rounded-lg bg-primary-500 text-white disabled:opacity-50 hover:bg-primary-600 transition"
          >
            Reply
          </button>
        </form>
      )}

      {/* --- Recursive Replies --- */}
      {replies && replies.length > 0 && (
        <div className="ml-1 sm:ml-1 border-l border-dark-3 pl-5 flex flex-col gap-3">
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