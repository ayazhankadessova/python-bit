import { cn } from "@/lib/utils";

export default function AnimatedGradientText({
  text
}: {
  text:string
}) {
  return (
    <span
      className={cn(
        `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
      )}
    >
      {text}
    </span>
  );
}
