declare module 'react-native-image-to-pdf' {
  export interface ImageToPdfOptions {
    imagePaths: string[];
    name: string;
    maxSize?: {
      width: number;
      height: number;
    };
    quality?: number;
  }

  const RNImageToPdf: {
    createPDFbyImages: (options: ImageToPdfOptions) => Promise<{ filePath: string }>;
  };

  export default RNImageToPdf;
}
