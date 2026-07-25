import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'

interface DocType {
    label: string
    value: number
    max: number
}

interface DocTypesChartProps {
    data: DocType[]
}

export default function DocTypesChart({ data }: DocTypesChartProps) {
    // Recharts needs 'type' and 'count' keys
    const chartData = data.map((item) => ({
        type: item.label,
        count: item.value,
    }))

    return (
        <ResponsiveContainer width="100%" height={180}>
            <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 4, left: 0, bottom: 0 }}
            >
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    horizontal={false}
                />
                <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    type="category"
                    dataKey="type"
                    tick={{ fontSize: 11, fill: '#0f172a' }}
                    axisLine={false}
                    tickLine={false}
                    width={75}
                />
                <Tooltip
                    contentStyle={{
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: 12,
                    }}
                />
                <Bar
                    dataKey="count"
                    fill="#0e7490"
                    radius={[0, 4, 4, 0]}
                    name="Count"
                />
            </BarChart>
        </ResponsiveContainer>
    )
}