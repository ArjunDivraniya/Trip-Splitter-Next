"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, PieChart as PieChartIcon, BarChart3, LineChart as LineChartIcon, Loader2 } from "lucide-react";
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

// Colors from design system
const CHART_COLORS = [
  "hsl(142 71% 45%)", // Success Green
  "hsl(43 96% 56%)",  // Warning Yellow
  "hsl(217 91% 60%)", // Primary Blue
  "hsl(0 84% 60%)",   // Destructive Red
  "hsl(221 83% 48%)", // Dark Blue
];

const Analytics = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [memberSpendingData, setMemberSpendingData] = useState<any[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  
  // Default values to prevent crashes if data is empty
  const [highestSpender, setHighestSpender] = useState({ name: "N/A", amount: 0 });

  // 1. Fetch Real Analytics Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/trips/${id}/analytics`);
        const result = await res.json();
        
        if (result.success) {
          const { pieData, barData, totalSpent } = result.data;
          
          setCategoryData(pieData);
          setMemberSpendingData(barData);
          setTotalExpenses(totalSpent);

          // Calculate Highest Spender
          if (barData.length > 0) {
            const max = barData.reduce((prev: any, current: any) => 
              (prev.amount > current.amount) ? prev : current
            );
            setHighestSpender(max);
          }
        }
      } catch (error) {
        console.error("Failed to load analytics", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // Custom Tooltip Component
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

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/trip/${id}`)}
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
                <div className="h-[300px]">
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name} ${((value / totalExpenses) * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        No expenses to show
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="mt-4 space-y-2">
                  {categoryData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
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
                <div className="h-[300px]">
                  {memberSpendingData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
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
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        No spending data
                    </div>
                  )}
                </div>

                {/* Top Spender Badge */}
                {highestSpender.amount > 0 && (
                    <div className="mt-4 p-3 bg-success/10 rounded-lg border border-success/20">
                    <p className="text-sm text-center">
                        <span className="font-semibold text-success">🏆 {highestSpender.name}</span>
                        {" "}contributed the most with{" "}
                        <span className="font-semibold">₹{highestSpender.amount.toLocaleString()}</span>
                    </p>
                    </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Line Chart - Daily Spending Trend */}
          {/* Note: Requires complex DB aggregation, for now keeping static mock or placeholder if empty */}
          <Card className="shadow-float border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="h-5 w-5 text-primary" />
                Daily Spending Trend
              </CardTitle>
              <CardDescription>Track expenses over time</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] flex items-center justify-center bg-muted/10 rounded-lg border border-dashed">
                    <p className="text-muted-foreground">Trend data will appear here after more expenses are added.</p>
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
                      ₹{memberSpendingData.length > 0 ? (totalExpenses / memberSpendingData.length).toFixed(0) : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Categories</span>
                    <span className="font-semibold text-foreground">{categoryData.length}</span>
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
                    <span>Review your highest category to save money.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>Settle debts early to avoid confusion later.</span>
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