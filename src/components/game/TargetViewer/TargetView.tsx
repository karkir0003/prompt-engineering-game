import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface TargetViewerProps {
  imageUrl: string;
  photographer: string;
}

export function TargetViewer({ imageUrl, photographer }: TargetViewerProps) {
  return (
    <Card className="relative overflow-hidden aspect-square h-full max-h-[600px] group border-border/50">
      <div className="relative w-full h-full">
        {/* Priority=true tells Next.js to load this image immediately */}
        <Image
          src={imageUrl}
          alt="Target to replicate"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Overlay Info */}
      <div className="absolute top-4 left-4">
        <Badge
          variant="secondary"
          className="bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
        >
          Daily Target #104
        </Badge>
      </div>

      {/* Photographer Credit (Fades in on hover) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-xs font-medium">Photo by {photographer}</p>
        <p className="text-[10px] text-gray-300">via Unsplash</p>
      </div>
    </Card>
  );
}
