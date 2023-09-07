"use client";
import { type ChartData } from "chart.js";
import BarChart02 from "./bar-chart-01";
const messages = [
  {
    total_messages: 3,
    date: "2023-02-19",
  },
  {
    total_messages: 1,
    date: "2023-02-21",
  },
  {
    total_messages: 1,
    date: "2023-02-22",
  },
  {
    total_messages: 1,
    date: "2023-02-23",
  },
  {
    total_messages: 3,
    date: "2023-02-24",
  },
  {
    total_messages: 1,
    date: "2023-02-25",
  },
  {
    total_messages: 1,
    date: "2023-02-26",
  },
  {
    total_messages: 1,
    date: "2023-02-27",
  },
  {
    total_messages: 1,
    date: "2023-02-28",
  },
  {
    total_messages: 1,
    date: "2023-03-03",
  },
  {
    total_messages: 3,
    date: "2023-03-04",
  },
  {
    total_messages: 1,
    date: "2023-03-05",
  },
  {
    total_messages: 1,
    date: "2023-03-08",
  },
  {
    total_messages: 3,
    date: "2023-03-09",
  },
  {
    total_messages: 2,
    date: "2023-03-14",
  },
  {
    total_messages: 1,
    date: "2023-03-15",
  },
  {
    total_messages: 3,
    date: "2023-03-16",
  },
  {
    total_messages: 1,
    date: "2023-03-17",
  },
  {
    total_messages: 1,
    date: "2023-03-18",
  },
  {
    total_messages: 2,
    date: "2023-03-19",
  },
  {
    total_messages: 3,
    date: "2023-03-20",
  },
  {
    total_messages: 1,
    date: "2023-03-21",
  },
  {
    total_messages: 2,
    date: "2023-03-22",
  },
  {
    total_messages: 3,
    date: "2023-03-23",
  },
  {
    total_messages: 1,
    date: "2023-03-24",
  },
  {
    total_messages: 1,
    date: "2023-03-25",
  },
  {
    total_messages: 1,
    date: "2023-03-26",
  },
  {
    total_messages: 1,
    date: "2023-03-28",
  },
  {
    total_messages: 1,
    date: "2023-03-29",
  },
  {
    total_messages: 1,
    date: "2023-03-30",
  },
  {
    total_messages: 3,
    date: "2023-03-31",
  },
  {
    total_messages: 2,
    date: "2023-04-02",
  },
  {
    total_messages: 2,
    date: "2023-04-03",
  },
  {
    total_messages: 2,
    date: "2023-04-04",
  },
  {
    total_messages: 1,
    date: "2023-04-07",
  },
  {
    total_messages: 2,
    date: "2023-04-08",
  },
  {
    total_messages: 2,
    date: "2023-04-09",
  },
  {
    total_messages: 1,
    date: "2023-04-10",
  },
  {
    total_messages: 2,
    date: "2023-04-12",
  },
  {
    total_messages: 1,
    date: "2023-04-13",
  },
  {
    total_messages: 3,
    date: "2023-04-14",
  },
  {
    total_messages: 1,
    date: "2023-04-16",
  },
  {
    total_messages: 1,
    date: "2023-04-17",
  },
  {
    total_messages: 1,
    date: "2023-04-18",
  },
  {
    total_messages: 1,
    date: "2023-04-20",
  },
  {
    total_messages: 1,
    date: "2023-04-21",
  },
  {
    total_messages: 1,
    date: "2023-04-22",
  },
  {
    total_messages: 1,
    date: "2023-04-23",
  },
  {
    total_messages: 1,
    date: "2023-04-25",
  },
  {
    total_messages: 1,
    date: "2023-04-30",
  },
  {
    total_messages: 3,
    date: "2023-05-01",
  },
  {
    total_messages: 2,
    date: "2023-05-03",
  },
  {
    total_messages: 1,
    date: "2023-05-04",
  },
  {
    total_messages: 1,
    date: "2023-05-05",
  },
  {
    total_messages: 4,
    date: "2023-05-06",
  },
  {
    total_messages: 1,
    date: "2023-05-08",
  },
  {
    total_messages: 1,
    date: "2023-05-09",
  },
  {
    total_messages: 1,
    date: "2023-05-10",
  },
  {
    total_messages: 1,
    date: "2023-05-11",
  },
  {
    total_messages: 1,
    date: "2023-05-13",
  },
  {
    total_messages: 2,
    date: "2023-05-14",
  },
  {
    total_messages: 3,
    date: "2023-05-15",
  },
  {
    total_messages: 1,
    date: "2023-05-16",
  },
  {
    total_messages: 2,
    date: "2023-05-18",
  },
  {
    total_messages: 1,
    date: "2023-05-19",
  },
  {
    total_messages: 1,
    date: "2023-05-20",
  },
  {
    total_messages: 1,
    date: "2023-05-21",
  },
  {
    total_messages: 1,
    date: "2023-05-25",
  },
  {
    total_messages: 1,
    date: "2023-05-27",
  },
  {
    total_messages: 4,
    date: "2023-05-28",
  },
  {
    total_messages: 2,
    date: "2023-05-29",
  },
  {
    total_messages: 2,
    date: "2023-06-03",
  },
  {
    total_messages: 2,
    date: "2023-06-05",
  },
  {
    total_messages: 1,
    date: "2023-06-06",
  },
  {
    total_messages: 2,
    date: "2023-06-07",
  },
  {
    total_messages: 2,
    date: "2023-06-08",
  },
  {
    total_messages: 1,
    date: "2023-06-10",
  },
  {
    total_messages: 1,
    date: "2023-06-11",
  },
  {
    total_messages: 1,
    date: "2023-06-12",
  },
  {
    total_messages: 2,
    date: "2023-06-13",
  },
  {
    total_messages: 1,
    date: "2023-06-16",
  },
  {
    total_messages: 1,
    date: "2023-06-17",
  },
  {
    total_messages: 1,
    date: "2023-06-18",
  },
  {
    total_messages: 1,
    date: "2023-06-19",
  },
  {
    total_messages: 1,
    date: "2023-06-20",
  },
  {
    total_messages: 1,
    date: "2023-06-21",
  },
  {
    total_messages: 1,
    date: "2023-06-22",
  },
  {
    total_messages: 2,
    date: "2023-06-24",
  },
  {
    total_messages: 3,
    date: "2023-06-28",
  },
  {
    total_messages: 2,
    date: "2023-06-29",
  },
  {
    total_messages: 1,
    date: "2023-06-30",
  },
  {
    total_messages: 2,
    date: "2023-07-03",
  },
  {
    total_messages: 2,
    date: "2023-07-05",
  },
  {
    total_messages: 2,
    date: "2023-07-06",
  },
  {
    total_messages: 3,
    date: "2023-07-08",
  },
  {
    total_messages: 1,
    date: "2023-07-10",
  },
  {
    total_messages: 1,
    date: "2023-07-11",
  },
  {
    total_messages: 4,
    date: "2023-07-12",
  },
  {
    total_messages: 1,
    date: "2023-07-16",
  },
  {
    total_messages: 2,
    date: "2023-07-18",
  },
  {
    total_messages: 1,
    date: "2023-07-19",
  },
  {
    total_messages: 1,
    date: "2023-07-20",
  },
  {
    total_messages: 3,
    date: "2023-07-21",
  },
  {
    total_messages: 1,
    date: "2023-07-23",
  },
  {
    total_messages: 1,
    date: "2023-07-25",
  },
  {
    total_messages: 1,
    date: "2023-07-26",
  },
  {
    total_messages: 1,
    date: "2023-07-28",
  },
  {
    total_messages: 1,
    date: "2023-07-30",
  },
  {
    total_messages: 2,
    date: "2023-08-01",
  },
  {
    total_messages: 2,
    date: "2023-08-02",
  },
  {
    total_messages: 1,
    date: "2023-08-03",
  },
  {
    total_messages: 2,
    date: "2023-08-04",
  },
  {
    total_messages: 2,
    date: "2023-08-05",
  },
  {
    total_messages: 3,
    date: "2023-08-06",
  },
  {
    total_messages: 3,
    date: "2023-08-07",
  },
  {
    total_messages: 1,
    date: "2023-08-09",
  },
  {
    total_messages: 1,
    date: "2023-08-10",
  },
  {
    total_messages: 3,
    date: "2023-08-13",
  },
  {
    total_messages: 3,
    date: "2023-08-14",
  },
  {
    total_messages: 2,
    date: "2023-08-15",
  },
  {
    total_messages: 1,
    date: "2023-08-16",
  },
  {
    total_messages: 2,
    date: "2023-08-17",
  },
];
const labels = messages.map((item) => item.date);
const messageCounts = messages.map((item) => item.total_messages);
const total_messages = messages.reduce(
  (acc, item) => acc + item.total_messages,
  0
);

const chartData: ChartData<"bar"> = {
  labels: labels,
  datasets: [
    {
      label: "Total Messages",
      data: messageCounts,
      backgroundColor: "#6366f1",
      hoverBackgroundColor: "#4f46e5",
    },
  ],
};

export default function DashboardCard09() {
  return (
    <div className="flex flex-col col-span-full sm:col-span-6 bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
      <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">
          Messages
        </h2>
      </header>
      <div className="px-5 py-3">
        <div className="flex items-start">
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mr-2">
            {total_messages}
          </div>
          <div className="text-sm font-semibold text-white px-1.5 bg-amber-500 rounded-full hidden"></div>
        </div>
      </div>
      {/* Chart built with Chart.js 3 */}
      <div className="grow">
        {/* Change the height attribute to adjust the chart height */}
        <BarChart02 data={chartData} width={595} height={248} />
      </div>
    </div>
  );
}
