import { useState, useEffect } from 'react'
import { BarChart2 } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { aiApi } from '../../api'

// Shape of one entry from GET /ai/categories
type ApiCategory = {
    type: string
    count: number
}

const categoryDisplay: Record<string, { label: string; color: string }> = {
    lab_result: { label: 'Laboratory', color: '#059669' },
    referral: { label: 'Referral', color: '#7c3aed' },
    discharge_summary: { label: 'Discharge', color: '#0e7490' },
    insurance_form: { label: 'Insurance', color: '#d97706' },
    imaging: { label: 'Imaging', color: '#0284c7' },
    other: { label: 'Other', color: '#64748b' },
}

export default function AIDonutChart() {
    const [categories, setCategories] = useState<ApiCategory[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchCategories() {
            try {
                const data: ApiCategory[] = await aiApi.getCategories()
                setCategories(data ?? [])
            } catch {
                setCategories([])
            } finally {
                setIsLoading(false)
            }
        }
        fetchCategories()
    }, [])

    const chartData = categories.map((c) => {
        const display = categoryDisplay[c.type] ?? { label: c.type, color: '#94a3b8' }
        return { name: display.label, value: c.count, color: display.color }
    })

    return (
        <div className="rounded-xl p-5 bg-white border border-slate-200">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <BarChart2 size={15} style={{ color: '#0e7490' }} />
                <h3 className="text-sm font-semibold text-slate-800">
                    Document Categories
                </h3>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center" style={{ height: 200 }}>
                    <div
                        className="animate-spin rounded-full h-6 w-6 border-b-2"
                        style={{ borderColor: '#0e7490' }}
                    />
                </div>
            ) : chartData.length === 0 ? (
                <div className="flex items-center justify-center text-xs text-slate-400" style={{ height: 200 }}>
                    No categorized documents yet
                </div>
            ) : (
                <>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
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
                        {chartData.map((c) => (
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
                </>
            )}
        </div>
    )
}
