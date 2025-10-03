import { useMutation, useQueryClient } from "@tanstack/react-query";
import { databases } from "@/lib/appwrite/config";
import { ID, Permission, Role } from "appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";

const DATABASE_ID = appwriteConfig.databaseId;
const COMMENTS_COLLECTION_ID = appwriteConfig.commentsCollectionId;

export const useAddComment = () => {
  const queryClient = useQueryClient();

   return useMutation({
    mutationFn: async ({ postId, content, userId }: { postId: string; content: string; userId: string }) => {
      return await databases.createDocument(
        DATABASE_ID,
        COMMENTS_COLLECTION_ID,
        ID.unique(),
        { post: postId, content, user: userId }
      );
    },
    onSuccess: (_, variables) => {
      // Refresh comments list
      queryClient.invalidateQueries(["comments", variables.postId]);
    },
  });
};