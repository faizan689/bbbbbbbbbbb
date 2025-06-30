import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', value: 18000 },
  { month: 'Feb', value: 19200 },
  { month: 'Mar', value: 20100 },
  { month: 'Apr', value: 21500 },
  { month: 'May', value: 22800 },
  { month: 'Jun', value: 24600 },
  { month: 'Jul', value: 25200 },
  { month: 'Aug', value: 24900 },
  { month: 'Sep', value: 26100 },
  { month: 'Oct', value: 27300 },
  { month: 'Nov', value: 26800 },
  { month: 'Dec', value: 28500 },
];

export default function PortfolioChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 20,
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="month" 
          className="text-xs"
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
        />
        <YAxis 
          className="text-xs"
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip 
          formatter={(value) => [`$${value?.toLocaleString()}`, 'Portfolio Value']}
          labelFormatter={(label) => `Month: ${label}`}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            borderColor: 'hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--foreground))',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
        />
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke="hsl(var(--primary))" 
          fill="hsl(var(--primary))"
          fillOpacity={0.2}
          strokeWidth={3}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
