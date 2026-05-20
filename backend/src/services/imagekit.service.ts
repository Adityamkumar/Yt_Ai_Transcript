import ImageKit from "imagekit";

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || "";
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "";
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || "";

if (!publicKey || !privateKey || !urlEndpoint) {
  console.warn("WARNING: ImageKit environment variables are missing from your configuration.");
}

export const imagekit = new ImageKit({
  publicKey,
  privateKey,
  urlEndpoint,
});

export const uploadPdf = async (
  fileBuffer: Buffer,
  fileName: string,
  userId: string
): Promise<{ url: string; fileId: string }> => {
  const response = await imagekit.upload({
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
  await imagekit.deleteFile(fileId);
};
