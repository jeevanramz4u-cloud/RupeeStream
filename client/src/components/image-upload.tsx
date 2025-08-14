import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Image, FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  currentImages?: string[];
}

export function ImageUpload({ onImagesChange, maxImages = 3, currentImages = [] }: ImageUploadProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>(currentImages);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - uploadedImages.length;
    if (files.length > remainingSlots) {
      toast({
        title: "Too many files",
        description: `You can only upload ${remainingSlots} more image(s)`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type", 
            description: `${file.name} is not an image file`,
            variant: "destructive"
          });
          continue;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than 5MB`,
            variant: "destructive"
          });
          continue;
        }

        // Convert to base64 for now (in production, this would upload to object storage)
        const base64 = await convertToBase64(file);
        newImages.push(base64);
      }

      const updatedImages = [...uploadedImages, ...newImages];
      setUploadedImages(updatedImages);
      onImagesChange(updatedImages);

      toast({
        title: "Images uploaded",
        description: `${newImages.length} image(s) uploaded successfully`
      });

    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const removeImage = (index: number) => {
    const updatedImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(updatedImages);
    onImagesChange(updatedImages);
    
    toast({
      title: "Image removed",
      description: "Screenshot has been removed"
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">
          Upload Screenshots
        </label>
        <Badge variant="secondary" className="text-xs">
          {uploadedImages.length}/{maxImages} images
        </Badge>
      </div>

      {/* Upload Area */}
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          uploadedImages.length >= maxImages 
            ? 'border-gray-200 bg-gray-50' 
            : 'border-gray-300 hover:border-primary cursor-pointer'
        }`}
        onClick={() => {
          if (uploadedImages.length < maxImages) {
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={uploadedImages.length >= maxImages}
        />
        
        {uploadedImages.length >= maxImages ? (
          <div className="text-gray-500">
            <FileImage className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Maximum images uploaded</p>
          </div>
        ) : (
          <div className="text-gray-600">
            <Upload className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Click to upload screenshots</p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG up to 5MB ({maxImages - uploadedImages.length} remaining)
            </p>
          </div>
        )}
      </div>

      {/* Uploaded Images Grid */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {uploadedImages.map((image, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={image}
                  alt={`Screenshot ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                  data-testid={`remove-image-${index}`}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-600 truncate">
                  Screenshot {index + 1}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {uploading && (
        <div className="text-center text-sm text-gray-600">
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full inline-block mr-2" />
          Uploading images...
        </div>
      )}
    </div>
  );
}