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
}: {
  comment: CommentType;
  activeReply: string | null;
  setActiveReply: (id: string | null) => void;
  replyTexts: { [key: string]: string };
  handleReplyChange: (id: string, value: string) => void;
  handleReplySubmit: (e: React.FormEvent, parentId: string) => void;
}) => {
  // Fetch replies for this comment
  const { data: replies } = useGetRepliesForComment(comment.$id);

  return (
    <div className="bg-dark-4 rounded-xl p-3 sm:p-4 md:p-5 flex gap-3 sm:gap-4 flex-col">
      {/* Comment Section */}
      <div className="flex gap-3 sm:gap-4">
        {/* avatar */}
        <img
          src={comment.user?.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt={comment.user?.name}
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover"
        />

        <div className="flex-1">
          {/* username */}
          <p className="text-xs sm:text-sm md:text-base font-semibold text-light-1">
            {comment.user?.name}
          </p>

          {/* comment content */}
          <p className="text-[11px] sm:text-sm md:text-[15px] text-light-2 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>

          {/* Reply button */}
          <button
            onClick={() =>
              setActiveReply(activeReply === comment.$id ? null : comment.$id)
            }
            className="text-primary-500 text-xs sm:text-sm font-medium mt-1 hover:underline"
          >
            Reply
          </button>
        </div>
      </div>

      {/* Reply input box */}
      {activeReply === comment.$id && (
        <form
          onSubmit={(e) => handleReplySubmit(e, comment.$id)}
          className="flex flex-col gap-2 mt-3"
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

      {/* Replies section (no indentation) */}
      <div className="flex flex-col gap-3 mt-3">
        {(replies as CommentType[] | undefined)?.map((reply) => (
          <div key={reply.$id}>
            <Comment
              comment={reply}
              activeReply={activeReply}
              setActiveReply={setActiveReply}
              replyTexts={replyTexts}
              handleReplyChange={handleReplyChange}
              handleReplySubmit={handleReplySubmit}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comment;
