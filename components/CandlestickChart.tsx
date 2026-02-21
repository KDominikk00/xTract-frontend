"use client";

import { useRef, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  ColorType,
} from "lightweight-charts";
import type { CandlestickData, UTCTimestamp, ISeriesApi } from "lightweight-charts";
import { getHistory, Candle } from "@/lib/fetchStock";

export default function CandlestickChart() {
  const params = useParams();
  const symbolParam = Array.isArray(params.symbol) ? params.symbol[0] : params.symbol;
  const stockSymbol = symbolParam?.toUpperCase() ?? "AAPL";

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const [interval, setInterval] = useState("1d");
  const [period, setPeriod] = useState("1mo");
  const [chartType, setChartType] = useState<"candlestick" | "line">("candlestick");
  const [selectedIntervalLabel, setSelectedIntervalLabel] = useState("1D");

  const intervalOptions = [
    { label: "1D", period: "1mo", interval: "1d" },
    { label: "1W", period: "3mo", interval: "1wk" },
    { label: "1M", period: "6mo", interval: "1wk" },
    { label: "YTD", period: "ytd", interval: "1d" },
    { label: "1Y", period: "1y", interval: "1wk" },
  ];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create the chart instance once; later updates only mutate series data/options.
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: "#131722" },
        textColor: "#d1d4dc",
      },
      grid: {
        vertLines: { color: "#1f2943" },
        horzLines: { color: "#1f2943" },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: "#758696", labelBackgroundColor: "#4c525e" },
        horzLine: { color: "#758696", labelBackgroundColor: "#4c525e" },
      },
      timeScale: { timeVisible: true, secondsVisible: false, rightOffset: 10 },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderUpColor: "#26a69a",
      borderDownColor: "#ef5350",
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    const lineSeries = chart.addSeries(LineSeries, {
      color: "#4299e1",
      lineWidth: 2,
    });

    candleSeriesRef.current = candleSeries;
    lineSeriesRef.current = lineSeries;
    chartRef.current = chart;

    const handleResize = () => {
      if (!chartContainerRef.current || !chartRef.current) return;
      chartRef.current.applyOptions({
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
      });
      chartRef.current.timeScale().fitContent();
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      chart.remove();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    async function fetchCandles() {
      if (!candleSeriesRef.current || !lineSeriesRef.current) return;

      try {
        const data: Candle[] = await getHistory(stockSymbol, period, interval);

        const formatted: CandlestickData[] = data.map((d) => ({
          time: d.time as UTCTimestamp,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }));

        candleSeriesRef.current.setData(formatted);
        // Keep both series in sync so toggling chart type is instant.
        lineSeriesRef.current.setData(
          formatted.map((d) => ({ time: d.time, value: d.close }))
        );

        candleSeriesRef.current.applyOptions({ visible: chartType === "candlestick" });
        lineSeriesRef.current.applyOptions({ visible: chartType === "line" });

        chartRef.current?.timeScale().fitContent();
      } catch (err) {
        console.error("Error fetching historical data:", err);
      }
    }

    fetchCandles();
  }, [stockSymbol, interval, period, chartType]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-4">
        <div className="hidden items-center gap-2 sm:flex">
          {intervalOptions.map((opt) => (
            <button
              key={opt.label}
              className={`cursor-pointer rounded-md px-4 py-2 text-base font-semibold leading-none ${
                selectedIntervalLabel === opt.label
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
              onClick={() => {
                setInterval(opt.interval);
                setPeriod(opt.period);
                setSelectedIntervalLabel(opt.label);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="relative hidden h-10 w-44 cursor-pointer select-none rounded-full bg-gray-700 sm:flex"
          onClick={() =>
            setChartType((prev) => (prev === "candlestick" ? "line" : "candlestick"))
          }
        >
          <div
            className={`absolute left-0 h-10 w-1/2 rounded-full bg-blue-500 transition-transform duration-200 ${
              chartType === "line" ? "translate-x-full" : "translate-x-0"
            }`}
          />
          <div className="z-10 flex h-full w-full">
            <div className="flex w-1/2 items-center justify-center font-semibold text-white">
              Candle
            </div>
            <div className={`flex w-1/2 items-center justify-center font-semibold transition-colors duration-200 ${
              chartType === "line" ? "text-black" : "text-white"
            }`}>
              Line
            </div>
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:hidden">
          <select
            aria-label="Select interval"
            className="w-full rounded bg-gray-700 px-3 py-2 text-sm text-white"
            value={selectedIntervalLabel}
            onChange={(e) => {
              const selected = intervalOptions.find((opt) => opt.label === e.target.value);
              if (selected) {
                setInterval(selected.interval);
                setPeriod(selected.period);
                setSelectedIntervalLabel(selected.label);
              }
            }}
          >
            {intervalOptions.map((opt) => (
              <option key={opt.label} value={opt.label}>{opt.label}</option>
            ))}
          </select>

          <select
            aria-label="Select chart type"
            className="w-full rounded bg-gray-700 px-3 py-2 text-sm text-white"
            value={chartType}
            onChange={(e) => setChartType(e.target.value as "candlestick" | "line")}
          >
            <option value="candlestick">Candle</option>
            <option value="line">Line</option>
          </select>
        </div>
      </div>

      <div
        ref={chartContainerRef}
        className="min-h-0 w-full flex-1 overflow-hidden rounded-xl border border-blue-500 shadow-md"
      />
    </div>
  );
}
