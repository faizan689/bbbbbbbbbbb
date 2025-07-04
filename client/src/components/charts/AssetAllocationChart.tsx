import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AssetAllocationChartProps {
  totalValue: number;
}

const data = [
  { 
    name: 'Residential', 
    value: 45, 
    amount: 158625,
    color: 'rgb(59, 130, 246)',
    gradient: 'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(99, 102, 241) 100%)'
  },
  { 
    name: 'Commercial', 
    value: 30, 
    amount: 106125,
    color: 'rgb(147, 51, 234)',
    gradient: 'linear-gradient(135deg, rgb(147, 51, 234) 0%, rgb(168, 85, 247) 100%)'
  },
  { 
    name: 'Industrial', 
    value: 15, 
    amount: 53063,
    color: 'rgb(236, 72, 153)',
    gradient: 'linear-gradient(135deg, rgb(236, 72, 153) 0%, rgb(251, 113, 133) 100%)'
  },
  { 
    name: 'Mixed-Use', 
    value: 10, 
    amount: 35375,
    color: 'rgb(34, 197, 94)',
    gradient: 'linear-gradient(135deg, rgb(34, 197, 94) 0%, rgb(74, 222, 128) 100%)'
  },
];

export default function AssetAllocationChart({ totalValue }: AssetAllocationChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <defs>
              {data.map((entry, index) => (
                <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={130}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#gradient-${index})`}
                  className="hover:opacity-80 transition-opacity duration-200"
                />
              ))}
            </Pie>
            <Tooltip 
              wrapperStyle={{ zIndex: 1000 }}
              position={{ x: 0, y: 0 }}
              allowEscapeViewBox={{ x: false, y: false }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-xl backdrop-blur-sm z-50 max-w-xs">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{data.name}</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center gap-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Allocation</span>
                          <span className="font-bold text-lg text-gray-900 dark:text-white">{data.value}%</span>
                        </div>
                        <div className="flex justify-between items-center gap-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Value</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(data.amount)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Properties</span>
                          <span className="font-medium text-gray-900 dark:text-white">{Math.floor(data.value / 5)} assets</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center value display */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {formatCurrency(totalValue)}
            </div>
            <div className="text-sm text-muted-foreground font-medium mt-1">Total Portfolio</div>
            <div className="text-xs text-muted-foreground">4 Asset Types</div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Legend */}
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-3 flex-shrink-0 shadow-sm" 
                style={{ backgroundColor: item.color }}
              />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.name}
                </span>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.floor(item.value / 5)} properties
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {item.value}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatCurrency(item.amount)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
