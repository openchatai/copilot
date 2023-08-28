export default function Logo({ withname = false }) {
  return (
    <div className="flex items-center flex-row-reverse">
      {withname && <span className="font-semibold dark:text-white text-slate-600 first-letter:text-indigo-500 ms-1 text-base">OpenCopilot</span>}
      <div>
        <svg
          className="w-8 h-8"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient
              cx="21.152%"
              cy="86.063%"
              fx="21.152%"
              fy="86.063%"
              r="79.941%"
              id="header-logo"
            >
              <stop stopColor="#4FD1C5" offset="0%"></stop>
              <stop stopColor="#81E6D9" offset="25.871%"></stop>
              <stop stopColor="#338CF5" offset="100%"></stop>
            </radialGradient>
          </defs>
          <rect
            width="32"
            height="32"
            rx="16"
            fill="url(#header-logo)"
            fillRule="nonzero"
          ></rect>
        </svg>
      </div>
    </div>
  );
}
