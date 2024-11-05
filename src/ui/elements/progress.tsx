import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { gsap } from "gsap"

import { cn } from "@/ui/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  const indicatorRef = React.useRef(null);

  React.useEffect(() => {
    if (indicatorRef.current) {
      gsap.to(indicatorRef.current, {
        x: `-${100 - (value || 0) + 5}%`,
        duration: 0.5,
        yoyo: true,
        repeat: 0,
        ease: "power1.inOut",
        onComplete: () => {
          gsap.to(indicatorRef.current, {
            x: `-${100 - (value || 0)}%`,
            duration: 0.5,
            ease: "power1.inOut",
          });
        },
      });
    }
  }, [value]);

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        ref={indicatorRef}
        className="h-full w-full flex-1 bg-primary"
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
