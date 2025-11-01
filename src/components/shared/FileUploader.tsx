import { useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Button } from "@/components/ui";
import { convertFileToUrl } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

type FileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl?: string;
};

const FileUploader = ({ fieldChange, mediaUrl = "" }: FileUploaderProps) => {
  const [fileUrl, setFileUrl] = useState<string>(mediaUrl);
  const [fileType, setFileType] = useState<string>("");
  const { toast } = useToast();

  const onDrop = useCallback(
    async (acceptedFiles: FileWithPath[]) => {
      const selectedFile = acceptedFiles[0];
      if (!selectedFile) return;

      const type = selectedFile.type.split("/")[0];

     // ✅ If it's a video, check duration first
if (type === "video") {
  const video = document.createElement("video");
  video.preload = "metadata";

  const durationCheck = new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      if (video.duration > 120) { // ✅ allow up to 2 minutes
        reject(new Error("Video too long. Maximum 2 minutes allowed."));
      } else {
        resolve();
      }
    };
    video.src = URL.createObjectURL(selectedFile);
  });

  try {
    await durationCheck;
  } catch (error: any) {
    toast({
      title: "Video too long",
      description: error.message || "Please upload a video under 2 minutes.",
      variant: "destructive",
    });
    return; // ❌ stop upload
  }
}


      // ✅ Continue upload
      setFileType(type);
      fieldChange([selectedFile]);
      setFileUrl(convertFileToUrl(selectedFile));
    },
    [fieldChange, toast]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg"],
      "video/*": [".mp4", ".mov", ".webm"],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className="flex flex-center flex-col bg-dark-3 rounded-xl cursor-pointer"
    >
      <input {...getInputProps()} className="cursor-pointer" />

      {fileUrl ? (
        <>
          <div className="flex flex-1 justify-center w-full p-5 lg:p-10">
            {fileType === "video" ? (
              <video
                src={fileUrl}
                controls
                className="max-h-[400px] rounded-xl object-cover"
              />
            ) : (
              <img
                src={fileUrl}
                alt="uploaded file"
                className="file_uploader-img"
              />
            )}
          </div>
          <p className="file_uploader-label">
            Click or drag {fileType === "video" ? "video" : "photo"} to replace
          </p>
        </>
      ) : (
        <div className="file_uploader-box">
          <img
            src="/assets/icons/file-upload.svg"
            width={96}
            height={77}
            alt="file upload"
          />

          <h3 className="base-medium text-light-2 mb-2 mt-6">
            Drag photo or short video here
          </h3>
          <p className="text-light-4 small-regular mb-6">
            JPG, PNG, MP4, MOV, WEBM (max 2 minutes)
          </p>

          <Button type="button" className="shad-button_dark_4">
            Select from computer
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
