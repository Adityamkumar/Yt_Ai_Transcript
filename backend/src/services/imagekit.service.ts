import ImageKit from "imagekit";

let _imagekit: ImageKit | null = null;

function getImageKit(): ImageKit {
  if (!_imagekit) {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || "";
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "";
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || "";

    if (!publicKey || !privateKey || !urlEndpoint) {
      throw new Error(
        "ImageKit environment variables (IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT) are not configured. " +
        "Please add them to your .env file."
      );
    }

    _imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });
  }
  return _imagekit;
}

export const uploadPdf = async (
  fileBuffer: Buffer,
  fileName: string,
  userId: string
): Promise<{ url: string; fileId: string }> => {
  const response = await getImageKit().upload({
    file: fileBuffer,
    fileName: fileName,
    folder: `/pdfs/${userId}`,
  });
  return {
    url: response.url,
    fileId: response.fileId,
  };
};

export const deletePdf = async (fileId: string): Promise<void> => {
  await getImageKit().deleteFile(fileId);
};


