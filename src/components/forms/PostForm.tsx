import * as z from "zod";
import { Models } from "appwrite";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
  Input,
  Textarea,
} from "@/components/ui";
import { PostValidation } from "@/lib/validation";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import { FileUploader, Loader } from "@/components/shared";
import { useCreatePost, useUpdatePost } from "@/lib/react-query/queries";
import { uploadVideoToCloudinary } from "@/lib/cloudinary";

type PostFormProps = {
  post?: Models.Document;
  action: "Create" | "Update";
};

const PostForm = ({ post, action }: PostFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUserContext();
  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post ? post?.caption : "",
      file: [],
      location: post ? post.location : "",
      tags: post ? post.tags.join(",") : "",
    },
  });

  const { mutateAsync: createPost, isLoading: isLoadingCreate } = useCreatePost();
  const { mutateAsync: updatePost, isLoading: isLoadingUpdate } = useUpdatePost();

  const handleSubmit = async (value: z.infer<typeof PostValidation>) => {
    try {
      let imageUrl = "";
      let imageId = "";
      let videoUrl = "";
      let thumbnailUrl = "";

      const file = value.file?.[0];

      if (file) {
        const fileType = file.type.split("/")[0];

        if (fileType === "video") {
          // ⏳ Limit video duration (short clip only)
          const video = document.createElement("video");
          video.preload = "metadata";

          const checkDuration = new Promise<void>((resolve, reject) => {
            video.onloadedmetadata = () => {
             if (video.duration > 120) { // 120 seconds = 2 minutes
  reject(new Error("Video too long. Max 2 minutes allowed."));
} else {
                resolve();
              }
            };
            video.src = URL.createObjectURL(file);
          });

          await checkDuration;

          // Upload to Cloudinary
          const uploadResult = await uploadVideoToCloudinary(file);
          videoUrl = uploadResult.secure_url;
          thumbnailUrl = uploadResult.secure_url.replace(
            "/upload/",
            "/upload/w_400,h_400,c_fill/"
          );
        } else {
          // Image upload (Appwrite)
          imageUrl = post?.imageUrl || "";
          imageId = post?.imageId || "";
        }
      }

      if (post && action === "Update") {
        const updatedPost = await updatePost({
          ...value,
          postId: post.$id,
          imageId,
          imageUrl,
          videoUrl,
          thumbnailUrl,
        });

        if (!updatedPost)
          return toast({ title: `${action} post failed. Please try again.` });

        navigate(`/posts/${post.$id}`);
        return;
      }

      const newPost = await createPost({
        ...value,
        userId: user.id,
        imageUrl,
        imageId,
        videoUrl,
        thumbnailUrl,
      });

      if (!newPost)
        toast({ title: `${action} post failed. Please try again.` });

      navigate("/");
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-9 w-full max-w-5xl"
      >
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">What's on your mind?</FormLabel>
              <FormControl>
                <Textarea className="shad-textarea custom-scrollbar" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">
                Add Photo or Short Video (max 2 minutes)
              </FormLabel>
              <FormControl>
                <FileUploader fieldChange={field.onChange} mediaUrl={post?.imageUrl} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Location</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">
                Add Tags (separated by comma)
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Travel, Lifestyle, Sports, Tech"
                  type="text"
                  className="shad-input"
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <div className="flex gap-4 items-center justify-end">
          <Button
            type="button"
            className="shad-button_dark_4"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoadingCreate || isLoadingUpdate}
          >
            {(isLoadingCreate || isLoadingUpdate) && <Loader />}
            {action} Post
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;
