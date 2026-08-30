/**
 * Safely compresses and resizes high-resolution smartphone photo & WebP uploads on the client side
 * before sending to the backend, preventing canvas errors and ensuring instant compatibility.
 */
export async function compressImageForUpload(file: File, maxWidth = 1600, maxHeight = 1600, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    try {
      // If file is already small (< 400KB), return original file immediately
      if (!file || file.size < 400 * 1024) {
        return resolve(file);
      }

      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        try {
          URL.revokeObjectURL(url);
          let { width, height } = img;

          if (width <= 0 || height <= 0) {
            return resolve(file);
          }

          // Calculate aspect-ratio preserved downscaled bounds
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                  });
                  resolve(compressedFile);
                } else {
                  resolve(file);
                }
              },
              'image/jpeg',
              quality
            );
          } else {
            resolve(file);
          }
        } catch (innerErr) {
          console.warn("Canvas compression notice:", innerErr);
          resolve(file);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };

      img.src = url;
    } catch (err) {
      console.warn("Image compressor error:", err);
      resolve(file);
    }
  });
}
