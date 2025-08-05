"use client"

import { PieChart as PieChartIcon } from "lucide-react"
import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/registry/new-york-v4/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/registry/new-york-v4/ui/chart"

export const description = "A donut chart"

const chartConfig = {
  visitors: {
    label: "QC per Jenis Bahan",
  },
  PET: {
    label: "PET",
    color: "var(--chart-1)",
  },
  HDPE: {
    label: "HDPE",
    color: "var(--chart-2)",
  },
  PE: {
    label: "PE",
    color: "var(--chart-3)",
  },
  PP: {
    label: "PP",
    color: "var(--chart-4)",
  },
  
} satisfies ChartConfig

export function KuantitasBahan({bahan}: { bahan: any }) {
    console.log("bahan", bahan);
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="flex items-center gap-2"><PieChartIcon size={20} /> Kuantitas per Jenis Bahan</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-md"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={bahan}
              dataKey="total"
              nameKey="name"
              innerRadius={60}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      
    </Card>
  )
}
