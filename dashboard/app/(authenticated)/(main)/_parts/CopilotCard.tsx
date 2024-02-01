import { Stack } from "@/components/ui/Stack";
import { CopilotType } from "@/data/copilot";
import { Link } from "@/lib/router-events";
import { motion } from "framer-motion";
import { GalleryHorizontalEnd } from "lucide-react";
import { format } from "timeago.js";

const IsoMorphicAnimatedLink = (animated:boolean) => animated ? motion(Link) : Link;

export function CopilotCard(
    {
        copilot,
        index,
        animated = true
    }:{
        copilot: CopilotType,
        index: number
        animated?: boolean
    }
) {
    const copilotUrl = `/copilot/${copilot.id}`;
    const AnimatedLink = IsoMorphicAnimatedLink(animated);
  return (
    <AnimatedLink
    key={copilot.id}
    href={copilotUrl}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    initial={{
      opacity: 0, y: 50,
      filter: "blur(10px)"
    }}
    exit={{
      opacity: 0, y: 50,
      filter: "blur(10px)"
    }}
    transition={{ duration: 0.2, delay: 0.1 * index }}
    className="group col-span-full lg:col-span-6 xl:col-span-3 copilot"
  >
    <div
      style={{
        transitionDelay: `max(0.1s, ${0.1 * index}ms)`,
      }}
      className="group relative flex h-56 items-center justify-center rounded-lg border-2 transition-colors box">
      <div className="flex-center size-20 shadow-lg group-hover:scale-95 transition-transform rounded-lg bg-primary text-gray-100">
        <GalleryHorizontalEnd className="size-12" />
      </div>
    </div>
    <Stack className="mt-1.5 ps-1 justify-between" gap={10} fluid>
      <h2 className="flex-1 text-sm font-semibold line-clamp-1" title={copilot.name}>
        {copilot.name}
      </h2>
      <p className="text-xs text-black">
        Created{" "}
        <span className="font-semibold">{format(copilot.created_at)}</span>
      </p>
    </Stack>
  </AnimatedLink>
  )
}
