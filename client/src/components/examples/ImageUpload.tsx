import { ImageUpload } from "../ImageUpload";

export default function ImageUploadExample() {
  return (
    <div className="w-full max-w-2xl">
      <ImageUpload
        onImagesChange={(files) => console.log("Imagens selecionadas:", files)}
        maxImages={5}
      />
    </div>
  );
}
