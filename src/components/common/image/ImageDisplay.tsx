import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageDisplayProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}

export function ImageDisplay({
  src,
  alt,
  priority = false,
  className,
}: ImageDisplayProps) {
  return (
    <div
      className={cn(
        "relative aspect-square w-full rounded-lg overflow-hidden bg-muted",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority={priority}
      />
    </div>
  );
}
