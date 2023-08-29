import { hexToRGB } from '../utils/hex-to-RGB'
import {
  Chart,
  BarController,
  BarElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend, ChartType
} from 'chart.js'
Chart.register(
  Tooltip,
  BarController,
  BarElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend
);

// Define Chart.js default settings
Chart.defaults.font.family = '"Inter", var(--font-inter) , sans-serif'
Chart.defaults.font.weight = '500'
Chart.defaults.plugins.tooltip.borderWidth = 1
Chart.defaults.plugins.tooltip.displayColors = false
Chart.defaults.plugins.tooltip.mode = 'nearest'
Chart.defaults.plugins.tooltip.intersect = false
Chart.defaults.plugins.tooltip.position = 'nearest'
Chart.defaults.plugins.tooltip.caretSize = 0
Chart.defaults.plugins.tooltip.caretPadding = 20
Chart.defaults.plugins.tooltip.cornerRadius = 4
Chart.defaults.plugins.tooltip.padding = 8
Chart.defaults.responsive = true
// Register Chart.js plugin to add a bg option for chart area
declare module 'chart.js' {
  interface PluginOptionsByType<TType extends ChartType = ChartType> {
    chartArea?: {
      backgroundColor?: string
    }
  }
}

Chart.register({
  id: 'chartArea',
  beforeDraw: (chart, args, options) => {
    if (options && options.backgroundColor) {
      const { ctx } = chart
      const { chartArea } = chart
      ctx.save()
      ctx.globalCompositeOperation = 'destination-over'
      ctx.fillStyle = options.backgroundColor
      ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top)
      ctx.restore()
    }
  },
})

export const chartColors = {
  textColor: {
    light: "#94a3b8",
    dark: "#64748b"
  },
  gridColor: {
    light: "#f1f5f9",
    dark: "#334155"
  },
  backdropColor: {
    light: "#ffffff",
    dark: "#1e293b"
  },
  tooltipTitleColor: {
    light: "#1e293b",
    dark: "#f1f5f9"
  },
  tooltipBodyColor: {
    light: "#1e293b",
    dark: "#f1f5f9"
  },
  tooltipBgColor: {
    light: "#ffffff",
    dark: "#334155"
  },
  tooltipBorderColor: {
    light: "#e2e8f0",
    dark: "#475569"
  },
  chartAreaBg: {
    light: "#f8fafc",
    dark: `rgba(${hexToRGB("#0f172a")}, 0.24)`
  },
}
