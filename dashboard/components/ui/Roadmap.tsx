import type { ReactNode } from "react";
import { Check } from "lucide-react";

type Props = {
  items: {
    label: ReactNode;
    description: string;
  }[];
};

function Roadmap({ items }: Props) {
  return (
    <ul>
      {items.map(({ label, description }, index) => (
        <li className="group/item relative" key={index}>
          <div className="flex items-center">
            <div className="absolute left-0 ml-2.5 h-full w-0.5 translate-x-px translate-y-3 self-start bg-accent group-last-of-type/item:hidden" />

            <div className="absolute left-0 rounded-full">
              <span className="flex-center p-1 rounded-full bg-primary">
                <Check className="h-4 w-4 text-white" />
              </span>
            </div>

            <h3 className="pl-9 text-base font-bold text-slate-800 ">
              {label}
            </h3>
          </div>
          <div className="pl-9 mb-3 text-sm group-last-of-type/item:mb-0">
            {description}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default Roadmap;
