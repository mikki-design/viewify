import { useState } from "react";
import { useComments } from "@/lib/react-query/queries/useComments";
import { useAddComment } from "@/lib/react-query/mutations/useAddComment";

const CommentSection = ({ postId, user }: { postId: string; user: any }) => {
  const { data: comments, isLoading } = useComments(postId);
  const { mutate: addComment } = useAddComment();
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment({ postId, userId: user.id, content: newComment });
    setNewComment("");
  };

  const renderComments = (parentId: string | null = null) => {
    return comments
      ?.filter((c) => c.parentId === parentId)
      .map((comment) => (
        <div key={comment.$id} className="mb-4 ml-4">
          <div className="bg-dark-4 p-3 rounded-lg">
            <p className="text-light-1">{comment.content}</p>
            <p className="text-light-3 text-sm mt-1">By {comment.userId}</p>
          </div>
          {/* Recursive rendering for replies */}
          <div className="ml-4 border-l border-dark-4 mt-2 pl-2">
            {renderComments(comment.$id)}
          </div>
        </div>
      ));
  };

  return (
    <div className="w-full mt-4">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          className="flex-1 bg-dark-3 text-light-1 p-2 rounded"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button type="submit" className="shad-button_primary px-4">Post</button>
      </form>

      {isLoading ? <p>Loading...</p> : renderComments()}
    </div>
  );
};

export default CommentSection;
