import { Readable } from "stream";
import { cloudinary } from "../../config/cloudinary";
import type {
  UploadApiResponse,
  UploadApiErrorResponse,
} from "cloudinary";
import type { Multer } from "multer";

export const uploadImageToCloudinary = (
  file: Express.Multer.File,
  folder = "blogs/covers"
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        quality: "auto:best",
        fetch_format: "auto",
      },
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined
      ) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary upload failed"));
        resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(stream);
  });
};
