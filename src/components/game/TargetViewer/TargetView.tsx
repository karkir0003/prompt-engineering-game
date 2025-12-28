import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ImageAttribution } from "@/components/common/image/ImageAttribution";
import { ImageDisplay } from "@/components/common/image/ImageDisplay";

interface TargetViewerProps {
  imageUrl: string;
  photographer: string;
}

export function TargetViewer({ imageUrl, photographer }: TargetViewerProps) {
  return (
    <Card className="relative overflow-hidden aspect-square h-full max-h-[600px] group border-border/50 p-0">
      <ImageDisplay
        src={imageUrl}
        alt="Target to replicate"
        priority
      />

      {/* Overlay Info */}
      <div className="absolute top-4 left-4">
        <Badge
          variant="secondary"
          className="bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
        >
          Daily Target #104
        </Badge>
      </div>

      {/* Photographer Credit */}
      <ImageAttribution photographer={photographer} />
    </Card>
  );
}
