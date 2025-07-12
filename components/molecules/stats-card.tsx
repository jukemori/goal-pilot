import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'blue' | 'purple' | 'green' | 'orange'
  subtitle?: string
  progress?: number
}

export function StatsCard({
  title,
  value,
  icon,
  color,
  subtitle,
  progress,
}: StatsCardProps) {
  const cardStyles = {
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
    green: 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20',
    orange: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200',
  }

  const iconStyles = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-primary/10 text-primary',
    orange: 'bg-orange-100 text-orange-600',
  }

  const progressBarStyles = {
    blue: 'bg-blue-600',
    purple: 'bg-purple-600', 
    green: 'bg-primary',
    orange: 'bg-orange-600',
  }

  const statusIndicatorLabels = {
    blue: 'Learning streak',
    purple: 'Study time',
    green: 'Achievement rate',
    orange: 'Daily focus',
  }

  return (
    <Card className={cn(
      "relative overflow-hidden",
      cardStyles[color]
    )}>
      <CardContent className="p-3 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs md:text-sm font-medium text-gray-700">{title}</p>
            <p className="text-2xl md:text-3xl font-bold mt-0.5 md:mt-1 text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={cn(
            "p-2 md:p-3 rounded-full ml-2 flex-shrink-0",
            iconStyles[color]
          )}>
            {icon}
          </div>
        </div>
        
        {progress !== undefined ? (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={cn("h-1.5 rounded-full transition-all duration-300", progressBarStyles[color])}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="mt-2 md:mt-3 flex items-center text-xs text-gray-600">
            <div className={cn(
              "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mr-1 md:mr-2",
              color === 'blue' && "bg-blue-600",
              color === 'purple' && "bg-purple-600", 
              color === 'green' && "bg-primary",
              color === 'orange' && "bg-orange-600"
            )}></div>
            <span className="truncate">
              {statusIndicatorLabels[color]}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}