import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', value: 18000, growth: 2.5 },
  { month: 'Feb', value: 19200, growth: 6.7 },
  { month: 'Mar', value: 20100, growth: 4.7 },
  { month: 'Apr', value: 21500, growth: 7.0 },
  { month: 'May', value: 22800, growth: 6.0 },
  { month: 'Jun', value: 24600, growth: 7.9 },
  { month: 'Jul', value: 25200, growth: 2.4 },
  { month: 'Aug', value: 24900, growth: -1.2 },
  { month: 'Sep', value: 26100, growth: 4.8 },
  { month: 'Oct', value: 27300, growth: 4.6 },
  { month: 'Nov', value: 26800, growth: -1.8 },
  { month: 'Dec', value: 28500, growth: 6.3 },
];

export default function PortfolioChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 20,
        }}
      >
        <defs>
          <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity={0.8} />
            <stop offset="50%" stopColor="rgb(147, 51, 234)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="rgb(236, 72, 153)" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" />
            <stop offset="50%" stopColor="rgb(147, 51, 234)" />
            <stop offset="100%" stopColor="rgb(236, 72, 153)" />
          </linearGradient>
        </defs>
        
        <CartesianGrid 
          strokeDasharray="2 4" 
          stroke="hsl(var(--border))"
          strokeOpacity={0.3}
          horizontal={true}
          vertical={false}
        />
        
        <XAxis 
          dataKey="month" 
          axisLine={false}
          tickLine={false}
          tick={{ 
            fontSize: 11, 
            fill: 'hsl(var(--muted-foreground))',
            fontWeight: 500 
          }}
          dy={10}
        />
        
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ 
            fontSize: 11, 
            fill: 'hsl(var(--muted-foreground))',
            fontWeight: 500 
          }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          dx={-10}
        />
        
        <Tooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-card border border-border rounded-lg p-4 shadow-lg backdrop-blur-sm">
                  <h4 className="font-semibold text-foreground mb-2">{label} 2024</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-sm text-muted-foreground">Portfolio Value</span>
                      <span className="font-bold text-lg">${payload[0].value?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-sm text-muted-foreground">Growth</span>
                      <span className={`font-semibold ${data.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.growth >= 0 ? '+' : ''}{data.growth}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke="url(#strokeGradient)"
          fill="url(#portfolioGradient)"
          strokeWidth={3}
          dot={{ fill: 'rgb(59, 130, 246)', strokeWidth: 2, r: 4 }}
          activeDot={{ 
            r: 6, 
            fill: 'rgb(59, 130, 246)', 
            strokeWidth: 3,
            stroke: 'white',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
