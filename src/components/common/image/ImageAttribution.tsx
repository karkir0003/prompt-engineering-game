import { UNSPLASH_REFERRAL_URL } from "@/constants/image";

interface ImageAttributionProps {
  photographer: string;
  photographerUrl: string;
}

export function ImageAttribution({
  photographer,
  photographerUrl,
}: ImageAttributionProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
      <p className="text-xs font-medium">
        Photo by{" "}
        <a
          href={photographerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-200"
        >
          {photographer}
        </a>
      </p>
      <p className="text-[10px] text-gray-300">
        via{" "}
        <a
          href={UNSPLASH_REFERRAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-200"
        >
          Unsplash
        </a>
      </p>
    </div>
  );
}
