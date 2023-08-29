import { BsCheck } from "react-icons/bs";

type Props = {
  items: {
    label: string;
    description: string;
  }[];
};

function Roadmap({ items }: Props) {
  return (
    <ul>
      {items.map(({ label, description }, index) => (
        <li className="relative group/item" key={index}>
          <div className="flex items-center">
            <div className="absolute dark:bg-slate-700 left-0 h-full group-last-of-type/item:hidden w-0.5 bg-slate-200 self-start ml-2.5 -translate-x-1/2 translate-y-3" />

            <div className="absolute left-0 rounded-full">
              <span className="flex-center w-5 h-5 rounded-full bg-indigo-500">
                <BsCheck className="text-white fill-current" />
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-800 pl-9 dark:text-slate-100">{label}</h3>
          </div>
          <div className="pl-9 mb-3 group-last-of-type/item:mb-0 text-sm">
            {description}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default Roadmap;
