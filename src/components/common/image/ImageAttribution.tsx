interface ImageAttributionProps {
  photographer: string;
  source?: string;
}

export function ImageAttribution({
  photographer,
  source = "via Unsplash",
}: ImageAttributionProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
      <p className="text-xs font-medium">Photo by {photographer}</p>
      <p className="text-[10px] text-gray-300">{source}</p>
    </div>
  );
}
