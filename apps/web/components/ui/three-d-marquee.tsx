"use client";

import { cn } from "@/lib/utils";

interface ThreeDMarqueeProps {
  images: string[];
  className?: string;
}

export function ThreeDMarquee({ images, className }: ThreeDMarqueeProps) {
  // Split images into rows of ~5-6
  const chunkSize = Math.ceil(images.length / 5);
  const rows: string[][] = [];
  for (let i = 0; i < images.length; i += chunkSize) {
    rows.push(images.slice(i, i + chunkSize));
  }

  return (
    <div
      className={cn(
        "relative h-[500px] w-full overflow-hidden [perspective:600px]",
        className
      )}
    >
      <div className="absolute inset-0 flex flex-col gap-4 [transform:rotateX(30deg)_scale(1.2)] [transform-origin:center_center]">
        {rows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="flex gap-4"
            style={{
              animation: `marquee-scroll-${rowIdx % 2 === 0 ? "left" : "right"} ${20 + rowIdx * 3}s linear infinite`,
            }}
          >
            {[...row, ...row].map((src, imgIdx) => (
              <img
                key={imgIdx}
                src={src}
                alt=""
                className="h-24 w-36 flex-shrink-0 rounded-lg object-cover md:h-28 md:w-44"
              />
            ))}
          </div>
        ))}
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes marquee-scroll-left {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            @keyframes marquee-scroll-right {
              0% { transform: translateX(-50%); }
              100% { transform: translateX(0); }
            }
          `,
        }}
      />
    </div>
  );
}
