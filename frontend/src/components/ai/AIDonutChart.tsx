import { BarChart2 } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const categoryData = [
    { name: 'Laboratory', value: 142, color: '#059669' },
    { name: 'Referral', value: 98, color: '#7c3aed' },
    { name: 'Discharge', value: 67, color: '#0e7490' },
    { name: 'Insurance', value: 53, color: '#d97706' },
    { name: 'Imaging', value: 41, color: '#0284c7' },
    { name: 'Other', value: 28, color: '#64748b' },
]

export default function AIDonutChart() {
    return (
        <div className="rounded-xl p-5 bg-white border border-slate-200">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <BarChart2 size={15} style={{ color: '#0e7490' }} />
                <h3 className="text-sm font-semibold text-slate-800">
                    Document Categories
                </h3>
                <span className="ml-auto text-xs text-slate-400 font-mono">
                    This month
                </span>
            </div>

            {/* Donut chart */}
            <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                    >
                        {categoryData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: 8,
                            fontSize: 12,
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-1.5 mt-2">
                {categoryData.map((c) => (
                    <div key={c.name} className="flex items-center gap-2">
                        <span
                            className="rounded-full shrink-0"
                            style={{
                                width: 8,
                                height: 8,
                                backgroundColor: c.color,
                                display: 'inline-block',
                            }}
                        />
                        <span className="text-xs text-slate-500">{c.name}</span>
                        <span className="text-xs font-mono text-slate-700 ml-auto">
                            {c.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}