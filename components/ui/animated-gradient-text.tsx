import { cn } from "@/lib/utils";

export default function AnimatedGradientText({
  text
}: {
  text:string
}) {
  return (
    <span
      className={cn(
        `inline animate-gradient bg-gradient-to-r from-[#E08FA0] via-[#A68FE0] to-[#E08FA0] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
      )}
    >
      {text}
    </span>
  )
}
