import { CheckCircle2 } from 'lucide-react'

interface StepIndicatorProps {
    currentStep: 1 | 2 | 3
}

const steps = [
    { number: 1, label: 'Compose' },
    { number: 2, label: 'Review' },
    { number: 3, label: 'Sent' },
]

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
    return (
        <div className="flex items-center gap-2">
            {steps.map((step, index) => {
                const isDone = currentStep > step.number
                const isActive = currentStep === step.number

                return (
                    <div key={step.number} className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            {/* Circle */}
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{
                                    backgroundColor:
                                        isDone ? '#059669' : isActive ? '#0e7490' : '#e2e8f0',
                                    color: isDone || isActive ? '#fff' : '#94a3b8',
                                }}
                            >
                                {isDone ? <CheckCircle2 size={13} /> : step.number}
                            </div>

                            {/* Label */}
                            <span
                                className="text-sm"
                                style={{
                                    fontWeight: isActive ? 600 : 400,
                                    color: isActive
                                        ? '#0f172a'
                                        : isDone
                                            ? '#0f172a'
                                            : '#94a3b8',
                                }}
                            >
                                {step.label}
                            </span>
                        </div>

                        {/* Connector line */}
                        {index < steps.length - 1 && (
                            <div
                                className="w-8 h-px mx-1"
                                style={{
                                    backgroundColor:
                                        currentStep > step.number ? '#0e7490' : '#e2e8f0',
                                }}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}