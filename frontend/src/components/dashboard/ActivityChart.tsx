import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'

interface ActivityData {
    day: string
    sent: number
    received: number
}

interface ActivityChartProps {
    data: ActivityData[]
}

export default function ActivityChart({ data }: ActivityChartProps) {
    return (
        <div>
            <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0e7490" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#0e7490" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="recvGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

                    <XAxis
                        dataKey="day"
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                    />

                    <Tooltip
                        contentStyle={{
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: 8,
                            fontSize: 12,
                        }}
                        labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                    />

                    <Area
                        type="monotone"
                        dataKey="sent"
                        stroke="#0e7490"
                        strokeWidth={2}
                        fill="url(#sentGrad)"
                        name="Sent"
                    />
                    <Area
                        type="monotone"
                        dataKey="received"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        fill="url(#recvGrad)"
                        name="Received"
                    />
                </AreaChart>
            </ResponsiveContainer>

            <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                    <span
                        className="rounded-full"
                        style={{ width: 8, height: 8, background: '#0e7490', display: 'inline-block' }}
                    />
                    <span className="text-xs text-slate-500">Sent</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span
                        className="rounded-full"
                        style={{ width: 8, height: 8, background: '#06b6d4', display: 'inline-block' }}
                    />
                    <span className="text-xs text-slate-500">Received</span>
                </div>
            </div>
        </div>
    )
}