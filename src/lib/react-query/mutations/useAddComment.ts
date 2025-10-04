import { useMutation, useQueryClient } from "@tanstack/react-query";
import { databases } from "@/lib/appwrite/config";
import { ID } from "appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";

const DATABASE_ID = appwriteConfig.databaseId;
const COMMENTS_COLLECTION_ID = appwriteConfig.commentsCollectionId;

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // 🧠 1️⃣ Create the comment in Appwrite
    mutationFn: async ({
      postId,
      content,
      userId,
    }: {
      postId: string;
      content: string;
      userId: string;
    }) => {
      return await databases.createDocument(
        DATABASE_ID,
        COMMENTS_COLLECTION_ID,
        ID.unique(),
        { post: postId, content, user: userId }
      );
    },

    // ⚡ 2️⃣ Show comment instantly (optimistic update)
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ["comments", variables.postId],
      });

      const previousComments = queryClient.getQueryData(["comments", variables.postId]);

      const optimisticComment = {
        $id: `temp-${Date.now()}`,
        content: variables.content,
        user: {
          name: "You",
          imageUrl: "/assets/icons/profile-placeholder.svg",
        },
        isOptimistic: true,
      };

      queryClient.setQueryData(["comments", variables.postId], (old: any) =>
        old ? [...old, optimisticComment] : [optimisticComment]
      );

      return { previousComments };
    },

    // 🟢 3️⃣ Replace the optimistic comment with the real one from Appwrite
    onSuccess: async (newComment, variables) => {
      queryClient.setQueryData(["comments", variables.postId], (old: any) => {
        if (!old) return [newComment];
        // Remove optimistic comment before adding the real one
        return [
          ...old.filter((c: any) => !c.isOptimistic),
          { ...newComment },
        ];
      });

      // Refetch comments from Appwrite to ensure accuracy
      await queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });

      await queryClient.refetchQueries({
        queryKey: ["comments", variables.postId],
        exact: true,
      });
    },

    // 🔴 4️⃣ Rollback if something fails
    onError: (error, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["comments", variables.postId],
          context.previousComments
        );
      }
      console.error("Failed to add comment:", error);
    },
  });
};
