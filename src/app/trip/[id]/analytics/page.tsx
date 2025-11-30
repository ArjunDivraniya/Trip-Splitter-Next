// placeholder for `trip/[id]/analytics/page.tsx` (migrated from Analytics.tsx)
// File intentionally left without component code.
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, PieChart as PieChartIcon, BarChart3, LineChart as LineChartIcon } from "lucide-react";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Mock data for analytics
const categoryData = [
  { name: "Food", value: 9200, percentage: 36.8 },
  { name: "Hotel", value: 15000, percentage: 60 },
  { name: "Travel", value: 800, percentage: 3.2 },
];

const memberSpendingData = [
  { name: "You", amount: 5700 },
  { name: "Arjun", amount: 15000 },
  { name: "Priya", amount: 800 },
  { name: "Krish", amount: 3500 },
  { name: "Neha", amount: 0 },
];

const dailySpendingData = [
  { date: "Nov 15", amount: 17500 },
  { date: "Nov 16", amount: 4000 },
  { date: "Nov 17", amount: 3500 },
  { date: "Nov 18", amount: 0 },
  { date: "Nov 19", amount: 0 },
  { date: "Nov 20", amount: 0 },
];

// Colors from design system
const COLORS = {
  food: "hsl(142 71% 45%)", // success green
  hotel: "hsl(43 96% 56%)", // warning yellow
  travel: "hsl(217 91% 60%)", // primary blue
  shopping: "hsl(0 84% 60%)", // destructive red
};

const CHART_COLORS = [
  "hsl(142 71% 45%)",
  "hsl(43 96% 56%)",
  "hsl(217 91% 60%)",
  "hsl(0 84% 60%)",
  "hsl(221 83% 48%)",
];

const Analytics = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const totalExpenses = categoryData.reduce((sum, item) => sum + item.value, 0);
  const highestSpender = memberSpendingData.reduce((max, member) => 
    member.amount > max.amount ? member : max
  );

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">
            ₹{payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/trip/${id}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Trip
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8 animate-fade-in">
          {/* Page Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              Trip Analytics
            </h1>
            <p className="text-muted-foreground">Visual insights into your spending patterns</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-float border-0 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Total Expenses</p>
                <p className="text-3xl font-bold text-foreground">₹{totalExpenses.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card className="shadow-float border-0 bg-gradient-to-br from-success/5 to-success/10">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Highest Spender</p>
                <p className="text-3xl font-bold text-foreground">{highestSpender.name}</p>
                <p className="text-sm text-muted-foreground mt-1">₹{highestSpender.amount.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card className="shadow-float border-0 bg-gradient-to-br from-warning/5 to-warning/10">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Categories</p>
                <p className="text-3xl font-bold text-foreground">{categoryData.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart - Category Breakdown */}
            <Card className="shadow-float border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-primary" />
                  Expense Categories
                </CardTitle>
                <CardDescription>Breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CHART_COLORS[index % CHART_COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="mt-4 space-y-2">
                  {categoryData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CHART_COLORS[index] }}
                        />
                        <span className="text-sm text-foreground">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        ₹{item.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bar Chart - Member Spending */}
            <Card className="shadow-float border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Member Spending
                </CardTitle>
                <CardDescription>Who spent the most</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={memberSpendingData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="amount" 
                      fill="hsl(217 91% 60%)"
                      radius={[8, 8, 0, 0]}
                    >
                      {memberSpendingData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Top Spender Badge */}
                <div className="mt-4 p-3 bg-success/10 rounded-lg border border-success/20">
                  <p className="text-sm text-center">
                    <span className="font-semibold text-success">🏆 {highestSpender.name}</span>
                    {" "}contributed the most with{" "}
                    <span className="font-semibold">₹{highestSpender.amount.toLocaleString()}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Line Chart - Daily Spending */}
          <Card className="shadow-float border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="h-5 w-5 text-primary" />
                Daily Spending Trend
              </CardTitle>
              <CardDescription>Track expenses over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={dailySpendingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="hsl(217 91% 60%)"
                    strokeWidth={3}
                    dot={{ fill: "hsl(217 91% 60%)", r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>

              {/* Insight */}
              <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-center text-foreground">
                  💡 <span className="font-semibold">Peak spending</span> occurred on{" "}
                  <span className="font-semibold">Nov 15</span> with ₹17,500 in expenses
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-float border-0 bg-gradient-to-br from-muted/30 to-muted/10">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  📊 Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average per person</span>
                    <span className="font-semibold text-foreground">
                      ₹{(totalExpenses / memberSpendingData.length).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Days tracked</span>
                    <span className="font-semibold text-foreground">6 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total transactions</span>
                    <span className="font-semibold text-foreground">5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-float border-0 bg-gradient-to-br from-muted/30 to-muted/10">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  💰 Budget Tips
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>Hotel expenses are 60% of total - consider budget options</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>Food spending is well balanced across the trip</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>Travel costs are minimal - great cost management!</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
