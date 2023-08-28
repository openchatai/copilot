"use client";
import {
  Chart,
  LineController,
  LineElement,
  Filler,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import type { ChartData } from "chart.js";
import "chartjs-adapter-moment";
import { useTheme } from "next-themes";
import { formatValue } from "@/ui/utils/format";
import { chartColors } from "../chartjs-config";
import { Line } from "react-chartjs-2";
Chart.register(
  LineController,
  LineElement,
  Filler,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip
);
interface LineChart01Props {
  data: ChartData<"line">;
  width: number;
  height: number;
}

export default function LineChart01({ data, width, height }: LineChart01Props) {
  const { theme } = useTheme();
  const darkMode = theme === "dark";
  const { tooltipBodyColor, tooltipBgColor, tooltipBorderColor, chartAreaBg } =
    chartColors;

  const options: ChartOptions<"line"> = {
    layout: {
      padding: 20,
    },
    scales: {
      y: {
        display: false,
        beginAtZero: true,
      },
      x: {
        type: "time",
        time: {
          parser: "MM-DD-YYYY",
          unit: "month",
        },
        display: false,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: () => "", // Disable tooltip title
          label: (context) => formatValue(context.parsed.y),
        },
        bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
        backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
        borderColor: darkMode
          ? tooltipBorderColor.dark
          : tooltipBorderColor.light,
      },
      legend: {
        display: false,
      },
      chartArea: {
        backgroundColor: darkMode ? chartAreaBg.dark : chartAreaBg.light,
      },
    },
    interaction: {
      intersect: false,
      mode: "nearest",
    },
    maintainAspectRatio: false,
    resizeDelay: 200,
  };

  return <Line options={options} data={data} width={width} height={height} />;
}
