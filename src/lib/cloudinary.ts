import { v2 as cloudinary } from "cloudinary";

// Configured from env vars. If any are missing the client is still created but
// uploads will fail at request time (we surface a clear error from the route).
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET,
);

export { cloudinary };

/**
 * Upload a buffer to Cloudinary and return the secure URL.
 * Uses the "soha/products" folder so uploaded assets are easy to manage.
 */
export async function uploadImage(buffer: Buffer, filename = "product"): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "soha/products",
        public_id: `${filename}-${Date.now()}`,
        resource_type: "auto",
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve(result.secure_url);
      },
    );
    uploadStream.end(buffer);
  });
}
