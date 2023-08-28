'use client'

import Badge from '@/ui/components/Badge'
import LineChart01 from '../BaseLineChart01'
import { hexToRGB } from '@/ui/utils/hex-to-RGB'

export default function DashboardCard02() {

  const chartData = {
    labels: [
      '12-01-2020', '01-01-2021', '02-01-2021',
      '03-01-2021', '04-01-2021', '05-01-2021',
      '06-01-2021', '07-01-2021', '08-01-2021',
      '09-01-2021', '10-01-2021', '11-01-2021',
      '12-01-2021', '01-01-2022', '02-01-2022',
      '03-01-2022', '04-01-2022', '05-01-2022',
      '06-01-2022', '07-01-2022', '08-01-2022',
      '09-01-2022', '10-01-2022', '11-01-2022',
      '12-01-2022', '01-01-2023',
    ],
    datasets: [
      // Indigo line
      {
        data: [
          622, 622, 426, 471, 365, 365, 238,
          324, 288, 206, 324, 324, 500, 409,
          409, 273, 232, 273, 500, 570, 767,
          808, 685, 767, 685, 685,
        ],
        fill: true,
        backgroundColor: `rgba(${hexToRGB("#3b82f6")}, 0.08)`,
        borderColor: "#6366f1",
        borderWidth: 2,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: "#6366f1",
        pointHoverBackgroundColor: "#6366f1",
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,
        clip: 20,
      },
      // Gray line
      {
        data: [
          732, 610, 610, 504, 504, 504, 349,
          349, 504, 342, 504, 610, 391, 192,
          154, 273, 191, 191, 126, 263, 349,
          252, 423, 622, 470, 532,
        ],
        borderColor: `rgba(${hexToRGB("#64748b")}, 0.25)`,
        borderWidth: 2,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: `rgba(${hexToRGB("#64748b")}, 0.25)`,
        pointHoverBackgroundColor: `rgba(${hexToRGB("#64748b")}, 0.25)`,
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,        
        clip: 20,
      },
    ],
  }

  return(
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
      <div className="px-5 pt-5">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">New Conversations</h2>
        <div className="flex items-start">
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mr-2">200</div>
          <Badge intent='secondary' size='sm' className="font-semibold px-1.5 py-0">+14%</Badge>
        </div>
      </div>
      {/* Chart built with Chart.js 3 */}
      <div className="grow max-sm:max-h-[128px] xl:max-h-[128px]">
        {/* Change the height attribute to adjust the chart height */}
        <LineChart01 data={chartData} width={389} height={128} />
      </div>
    </div>
  )
}
