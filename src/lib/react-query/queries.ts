import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/react-query/queryKeys";
import {
  createUserAccount,
  signInAccount,
  getCurrentUser,
  signOutAccount,
  getUsers,
  createPost,
  getPostById,
  updatePost,
  getUserPosts,
  deletePost,
  likePost,
  getUserById,
  updateUser,
  getRecentPosts,
  getInfinitePosts,
  searchPosts,
  savePost,
  deleteSavedPost,
} from "@/lib/appwrite/api";
import { INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";
import { databases } from '@/lib/appwrite/config';
import { ID, Query } from 'appwrite';
//import { CommentType } from "@/types";
import { ReplyWithUser } from "@/types";
import { appwriteConfig } from "@/lib/appwrite/config";
const DATABASE_ID = appwriteConfig.databaseId;
const FOLLOWERS_COLLECTION_ID = appwriteConfig.followersCollectionId;
const COMMENTS_COLLECTION_ID = appwriteConfig.commentsCollectionId;
const USERS_COLLECTION_ID = appwriteConfig.userCollectionId;

// ============================================================
// AUTH QUERIES
// ============================================================

export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: (user: INewUser) => createUserAccount(user),
  });
};

export const useSignInAccount = () => {
  return useMutation({
    mutationFn: (user: { email: string; password: string }) =>
      signInAccount(user),
  });
};

export const useSignOutAccount = () => {
  return useMutation({
    mutationFn: signOutAccount,
  });
};

// ============================================================
// POST QUERIES
// ============================================================

export const useGetPosts = () => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
    queryFn: getInfinitePosts as any,
    getNextPageParam: (lastPage: any) => {
      // If there's no data, there are no more pages.
      if (lastPage && lastPage.documents.length === 0) {
        return null;
      }

      // Use the $id of the last document as the cursor.
      const lastId = lastPage.documents[lastPage.documents.length - 1].$id;
      return lastId;
    },
  });
};

export const useSearchPosts = (searchTerm: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
    queryFn: () => searchPosts(searchTerm),
    enabled: !!searchTerm,
  });
};

export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: getRecentPosts,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: INewPost) => createPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};

export const useGetPostById = (postId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });
};

export const useGetUserPosts = (userId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
    queryFn: () => getUserPosts(userId),
    enabled: !!userId,
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: IUpdatePost) => updatePost(post),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
      });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, imageId }: { postId?: string; imageId: string }) =>
      deletePost(postId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      likesArray,
    }: {
      postId: string;
      likesArray: string[];
    }) => likePost(postId, likesArray),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

export const useSavePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, postId }: { userId: string; postId: string }) =>
      savePost(userId, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

export const useDeleteSavedPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

// ============================================================
// USER QUERIES
// ============================================================

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER],
    queryFn: getCurrentUser,
  });
};

export const useGetUsers = (limit?: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USERS],
    queryFn: () => getUsers(limit),
  });
};

export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: IUpdateUser) => updateUser(user),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
      });
    },
  });
};

export const useIsFollowing = (followerId: string, followedId: string) => {
  return useQuery({
    queryKey: ['isFollowing', followerId, followedId],
    queryFn: async () => {
      const result = await databases.listDocuments(
        DATABASE_ID,
        FOLLOWERS_COLLECTION_ID,
        [
          Query.equal('followerId', followerId),
          Query.equal('followedId', followedId),
        ]
      );
      return result.documents[0]; // return the follow doc if exists
    },
    enabled: !!followerId && !!followedId && followerId !== followedId,
  });
};


export const useAddComment = () => {
  return useMutation({
    mutationFn: async ({
      postId,
      userId,
      content,
    }: { postId: string; userId: string; content: string }) => {
      const res = await databases.createDocument(
        DATABASE_ID,
        COMMENTS_COLLECTION_ID,
        ID.unique(),
        {
          postId: postId,
          userId: userId,
          content,
        }
      );
      return res;
    },
  });
};

// ✅ Get comments for a post
// ✅ Fetch comments + attach user info dynamically
export const useGetCommentsForPost = (postId: string) => {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const res = await databases.listDocuments(
        DATABASE_ID,
        COMMENTS_COLLECTION_ID,
        [
          Query.equal("postId", postId),
          Query.isNull("parentId"),
          Query.orderAsc("$createdAt"),
          Query.limit(50),
        ]
      );

      // 🔹 Map each comment to include its user info
      const commentsWithUser = await Promise.all(
        res.documents.map(async (comment) => {
          try {
            const userRes = await databases.getDocument(
              DATABASE_ID,
              USERS_COLLECTION_ID,
              comment.userId
            );

            return {
              ...comment,
              user: {
                name: userRes.name ?? "Unknown User",
                imageUrl:
                  userRes.imageUrl ?? "/assets/icons/profile-placeholder.svg",
              },
            };
          } catch {
            return {
              ...comment,
              user: {
                name: "Unknown User",
                imageUrl: "/assets/icons/profile-placeholder.svg",
              },
            };
          }
        })
      );

      return commentsWithUser;
    },
     staleTime: 0, // ✅ forces query to refetch on invalidate
  });
};


// ✅ Fetch replies for a comment
export const useGetRepliesForComment = (commentId: string) => {
  return useQuery<ReplyWithUser[]>(["replies", commentId], async () => {
    const res = await databases.listDocuments(
      DATABASE_ID,
      COMMENTS_COLLECTION_ID,
      [
        Query.equal("parentId", commentId),
        Query.orderAsc("$createdAt"),
        Query.limit(50),
      ]
    );

    const repliesWithUser: ReplyWithUser[] = await Promise.all(
      res.documents.map(async (reply) => {
        try {
          const userRes = await databases.getDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            reply.userId
          );

          return {
            ...reply,
            user: {
              name: userRes.name ?? "Unknown user",
              imageUrl: userRes.imageUrl ?? "",
            },
          } as ReplyWithUser;
        } catch {
          return {
            ...reply,
            user: { name: "Unknown user", imageUrl: "" },
          } as ReplyWithUser;
        }
      })
    );

    return repliesWithUser;
  });
};



// ✅ Add comment or reply
export const useAddCommentOrReply = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ postId, content, parentId = null, userId }: { postId: string; content: string; parentId?: string | null; userId: string }) => {
      return await databases.createDocument(DATABASE_ID, COMMENTS_COLLECTION_ID, ID.unique(), {
        postId,
        content,
        parentId,
        userId,
      });
    },
    {
      onSuccess: (_, { postId, parentId }) => {
        if (parentId) {
          queryClient.invalidateQueries(["replies", parentId]);
        } else {
          queryClient.invalidateQueries(["comments", postId]);
        }
      },
    }
  );
};

// Delete a comment
/*export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_COMMENTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_COMMENTS_FOR_POST],
      });
    },
  });
};


// Delete a reply
export const useDeleteReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (replyId: string) => deleteReply(replyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_REPLIES_FOR_COMMENT],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_COMMENTS_FOR_POST],
      });
    },
  });
};
*/

export const updateComment = async (commentId: string, content: string) => {
  return await databases.updateDocument(
    DATABASE_ID,
    COMMENTS_COLLECTION_ID,
    commentId,
    { content }  // <-- IMPORTANT
  );
};
export const deleteComment = async (commentId: string) => {
  const comment = await databases.getDocument(
    DATABASE_ID,
    COMMENTS_COLLECTION_ID,
    commentId
  );
  await databases.deleteDocument(DATABASE_ID, COMMENTS_COLLECTION_ID, commentId);
  return comment; // return so we can invalidate queries properly
};

// ✅ Update a comment or reply
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ commentId, content }: { commentId: string; content: string }) => {
      return await updateComment(commentId, content);
    },
    {
      onSuccess: (updatedComment) => {
        const postId = updatedComment.postId;
        const parentId = updatedComment.parentId;

        if (parentId) {
          // Refresh replies for parent
          queryClient.invalidateQueries(["replies", parentId]);
        } else {
          // Refresh top-level comments for post
          queryClient.invalidateQueries(["comments", postId]);
        }
      },
    }
  );
};






// ✅ Delete a comment or reply
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ commentId }: { commentId: string }) => {
      return await deleteComment(commentId);
    },
    {
      onSuccess: (deletedComment) => {
        const postId = deletedComment?.postId;
        const parentId = deletedComment?.parentId;

        if (parentId) {
          queryClient.invalidateQueries(["replies", parentId]);
        } else if (postId) {
          queryClient.invalidateQueries(["comments", postId]);
        }
      },
    }
  );
};
