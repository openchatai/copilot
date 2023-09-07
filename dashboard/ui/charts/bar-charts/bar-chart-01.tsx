"use client";
import { useTheme } from "next-themes";
import { Bar } from "react-chartjs-2";
import "../chartjs-config";
import { type ChartOptions } from "chart.js";
import type { ChartData } from "chart.js";
import "chartjs-adapter-moment";
import { chartColors } from "../chartjs-config";
import { useMemo } from "react";

interface BarChart02Props {
  data: ChartData<"bar">;
  width: number;
  height: number;
}

export default function BarChart02({ data, width, height }: BarChart02Props) {
  const { theme } = useTheme();
  const darkMode = theme === "dark";
  const { tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors;

  const options: ChartOptions<"bar"> = useMemo(
    () => ({
      layout: {
        padding: {
          top: 12,
          bottom: 16,
          left: 20,
          right: 20,
        },
      },
      scales: {
        x: {
          type: "time",
          time: {
            unit: "day",
          },
        },
        y: {
          ticks: {
            stepSize: 1,
            precision: 0,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => context.parsed.y.toString(),
          },
          bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
          backgroundColor: darkMode
            ? tooltipBgColor.dark
            : tooltipBgColor.light,
          borderColor: darkMode
            ? tooltipBorderColor.dark
            : tooltipBorderColor.light,
        },
      },
      interaction: {
        intersect: false,
        mode: "nearest",
      },
      animation: {
        duration: 200,
      },
      maintainAspectRatio: false,
      resizeDelay: 200,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [darkMode]
  );
  return <Bar data={data} width={width} height={height} options={options} />;
}
