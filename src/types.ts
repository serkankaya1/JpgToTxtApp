export type OcrTextBlock = {
  id: string;
  text: string;
  bounds?: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
};
