const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1400;
const MAX_GALLERY_IMAGE_DATA_SIZE = 120 * 1024;
const MAX_GALLERY_IMAGE_DIMENSION = 900;
const MAX_GEM_VIDEO_FILE_SIZE = 1024 * 1024;

export const prepareProductImage = (file) => new Promise((resolve, reject) => {
  if (!file) {
    reject(new Error("Choose an image file first."));
    return;
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    reject(new Error("Choose a JPEG, PNG, or WebP image."));
    return;
  }

  if (file.size > MAX_IMAGE_FILE_SIZE) {
    reject(new Error("Choose an image smaller than 10 MB."));
    return;
  }

  const reader = new FileReader();
  reader.onerror = () => reject(new Error("The selected image could not be read."));
  reader.onload = () => {
    const image = new Image();
    image.onerror = () => reject(new Error("The selected file is not a valid image."));
    image.onload = () => {
      const scale = Math.min(
        1,
        MAX_IMAGE_DIMENSION / Math.max(image.width, image.height)
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("The browser could not process the selected image."));
        return;
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    image.src = String(reader.result);
  };
  reader.readAsDataURL(file);
});

export const prepareGemGalleryImage = (file) => new Promise((resolve, reject) => {
  if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    reject(new Error("Choose a JPEG, PNG, or WebP image."));
    return;
  }
  if (file.size > MAX_IMAGE_FILE_SIZE) {
    reject(new Error("Choose an image smaller than 10 MB."));
    return;
  }

  const reader = new FileReader();
  reader.onerror = () => reject(new Error("The selected image could not be read."));
  reader.onload = () => {
    const image = new Image();
    image.onerror = () => reject(new Error("The selected file is not a valid image."));
    image.onload = () => {
      const initialScale = Math.min(
        1,
        MAX_GALLERY_IMAGE_DIMENSION / Math.max(image.width, image.height)
      );
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("The browser could not process the selected image."));
        return;
      }

      let dimensionScale = initialScale;
      let dataUrl = "";
      while (dimensionScale >= 0.35) {
        canvas.width = Math.max(1, Math.round(image.width * dimensionScale));
        canvas.height = Math.max(1, Math.round(image.height * dimensionScale));
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        let quality = 0.72;
        dataUrl = canvas.toDataURL("image/jpeg", quality);
        while (dataUrl.length * 0.75 > MAX_GALLERY_IMAGE_DATA_SIZE && quality > 0.4) {
          quality -= 0.08;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        if (dataUrl.length * 0.75 <= MAX_GALLERY_IMAGE_DATA_SIZE) break;
        dimensionScale *= 0.8;
      }

      if (dataUrl.length * 0.75 > MAX_GALLERY_IMAGE_DATA_SIZE) {
        reject(new Error("The selected image could not be compressed enough. Choose a smaller image."));
        return;
      }
      resolve(dataUrl);
    };
    image.src = String(reader.result);
  };
  reader.readAsDataURL(file);
});

export const readGemInspectionVideo = (file) => new Promise((resolve, reject) => {
  if (!file || !["video/mp4", "video/webm"].includes(file.type)) {
    reject(new Error("Choose an MP4 or WebM video."));
    return;
  }
  if (file.size > MAX_GEM_VIDEO_FILE_SIZE) {
    reject(new Error("Choose a video smaller than 1 MB."));
    return;
  }

  const reader = new FileReader();
  reader.onerror = () => reject(new Error("The selected video could not be read."));
  reader.onload = () => resolve(String(reader.result));
  reader.readAsDataURL(file);
});
