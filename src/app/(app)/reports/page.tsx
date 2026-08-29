'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, getMonthName } from '@/lib/utils';

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });

export default function ReportsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [compareDate, setCompareDate] = useState<Date | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      try {
        let url = `/api/reports?month=${month}&year=${year}`;
        if (compareDate) {
          url += `&compareMonth=${compareDate.getMonth()}&compareYear=${compareDate.getFullYear()}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        setReportData(data);
      } catch (error) {
        console.error('Error fetching report:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [month, year, compareDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  if (isLoading && !reportData) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>Loading reports...</div>;
  }

  const {
    totalExpenses = 0,
    budget = 0,
    averageDailyExpense = 0,
    highestSpendingDay = { date: 1, amount: 0 },
    categoryBreakdown = [],
    dailySpendingData = [],
    comparisonData = null,
    milkReport = { totalQuantity: 0, totalSpent: 0, daysDelivered: 0, daysMissed: 0, currentPrice: 0 }
  } = reportData || {};

  return (
    <div className="page-container" style={{ padding: '16px', paddingBottom: '80px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Reports</h1>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: 'var(--color-surface)', padding: '12px 16px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <button onClick={handlePrevMonth} style={{ padding: '8px', background: 'transparent', border: 'none' }}>
          <ChevronLeft size={24} />
        </button>
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{getMonthName(month)} {year}</span>
        <button onClick={handleNextMonth} style={{ padding: '8px', background: 'transparent', border: 'none' }}>
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="report-card" style={{ background: 'var(--color-surface)', padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '16px', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>MONTHLY SUMMARY</h2>
        <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          {formatCurrency(totalExpenses)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          <span>Budget: {formatCurrency(budget)}</span>
          <span style={{ color: totalExpenses > budget ? 'var(--color-danger)' : 'var(--color-secondary)' }}>
            Remaining: {formatCurrency(budget - totalExpenses)}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Avg Daily</div>
            <div style={{ fontWeight: 'bold' }}>{formatCurrency(averageDailyExpense)}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Highest Day (Day {highestSpendingDay.date})</div>
            <div style={{ fontWeight: 'bold' }}>{formatCurrency(highestSpendingDay.amount)}</div>
          </div>
        </div>
      </div>

      {categoryBreakdown.length > 0 && (
        <div className="report-card" style={{ background: 'var(--color-surface)', padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>CATEGORY BREAKDOWN</h2>
          <div className="chart-container" style={{ height: '250px', marginBottom: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryBreakdown} dataKey="amount" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                  {categoryBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || 'var(--color-primary)'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(Number(value || 0))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            {categoryBreakdown.map((cat: any) => (
              <div key={cat.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{cat.icon}</span>
                  <span>{cat.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold' }}>{formatCurrency(cat.amount)}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{cat.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="report-card" style={{ background: 'var(--color-surface)', padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '16px', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>DAILY SPENDING</h2>
        <div className="chart-container" style={{ height: '250px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailySpendingData}>
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis hide />
              <Tooltip formatter={(value: any) => formatCurrency(Number(value || 0))} cursor={{ fill: 'var(--color-bg)' }} />
              <Bar dataKey="amount" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="report-card" style={{ background: 'var(--color-surface)', padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '16px', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>COMPARE MONTHS</h2>
        <select 
          onChange={(e) => {
            const val = e.target.value;
            if (!val) setCompareDate(null);
            else {
              const [cM, cY] = val.split('-').map(Number);
              setCompareDate(new Date(cY, cM, 1));
            }
          }}
          style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '16px' }}
          value={compareDate ? `${compareDate.getMonth()}-${compareDate.getFullYear()}` : ''}
        >
          <option value="">Select Month to Compare</option>
          <option value={`${(month - 1 + 12) % 12}-${month === 0 ? year - 1 : year}`}>Previous Month</option>
          <option value={`${(month - 2 + 12) % 12}-${month <= 1 ? year - 1 : year}`}>2 Months Ago</option>
        </select>

        {comparisonData && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>{getMonthName(month)} {year}</span>
              <strong>{formatCurrency(totalExpenses)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span>{getMonthName(comparisonData.month)} {comparisonData.year}</span>
              <strong>{formatCurrency(comparisonData.totalExpenses)}</strong>
            </div>
            <div style={{ padding: '12px', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              {totalExpenses <= comparisonData.totalExpenses ? (
                <span style={{ color: 'var(--color-secondary)', fontWeight: 'bold' }}>
                  Saved {formatCurrency(comparisonData.totalExpenses - totalExpenses)} vs compared month!
                </span>
              ) : (
                <span style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>
                  Spent {formatCurrency(totalExpenses - comparisonData.totalExpenses)} more than compared month.
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="report-card" style={{ background: 'var(--color-surface)', padding: '20px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>MILK REPORT</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Quantity</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{milkReport.totalQuantity} L</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Spent</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatCurrency(milkReport.totalSpent)}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Delivered/Missed</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{milkReport.daysDelivered} / {milkReport.daysMissed}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Price/Litre</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatCurrency(milkReport.currentPrice)}</div>
          </div>
        </div>
      </div>

    </div>
  );
}
