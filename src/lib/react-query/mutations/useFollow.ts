// lib/react-query/mutations/useFollow.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { databases } from '@/lib/appwrite/config';
import { ID } from 'appwrite';
import { appwriteConfig } from "@/lib/appwrite/config";

const DATABASE_ID = appwriteConfig.databaseId;
const FOLLOWERS_COLLECTION_ID = appwriteConfig.followersCollectionId;

// Follow User
export const useFollowUser = ({ onSuccess, onError }: {
  onSuccess?: () => void;
  onError?: (err: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ followerId, followedId }: { followerId: string; followedId: string }) => {
      return await databases.createDocument(
        DATABASE_ID,
        FOLLOWERS_COLLECTION_ID,
        ID.unique(),
        { followerId, followedId }
      );
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries(); // Or use specific keys
      onSuccess?.(); // ✅ call user-provided success callback
    },
    onError: (error) => {
      console.error("Follow failed", error);
      onError?.(error); // ✅ call user-provided error callback
    }
  });
};

// Unfollow User
export const useUnfollowUser = ({ onSuccess, onError }: {
  onSuccess?: () => void;
  onError?: (err: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (followDocId: string) => {
      return await databases.deleteDocument(
        DATABASE_ID,
        FOLLOWERS_COLLECTION_ID,
        followDocId
      );
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries(); // Or use specific keys
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Unfollow failed", error);
      onError?.(error);
    }
  });
};
