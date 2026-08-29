'use client';

import { useState, useEffect } from 'react';
import { Save, AlertTriangle, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function BudgetPage() {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [categoryBudgets, setCategoryBudgets] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [budgetRes, expensesRes, categoriesRes] = await Promise.all([
        fetch(`/api/budgets?month=${month}&year=${year}`),
        fetch(`/api/expenses?month=${month}&year=${year}`),
        fetch('/api/categories')
      ]);
      const bData = await budgetRes.json();
      setTotalBudget(bData.totalBudget || 0);
      setCategoryBudgets(bData.categoryBudgets || []);
      
      const cData = await categoriesRes.json();
      setCategories(cData);
      
      const eData = await expensesRes.json();
      setExpenses(eData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveBudget = async () => {
    await fetch('/api/budgets', {
      method: 'POST',
      body: JSON.stringify({
        month,
        year,
        totalBudget,
        categoryBudgets: categoryBudgets.map((c) => ({
          categoryId: c.categoryId,
          amount: c.amount
        }))
      })
    });
    alert('Budget saved');
  };

  const handleAddCategory = () => {
    if (categories.length > 0) {
      setCategoryBudgets([...categoryBudgets, { categoryId: categories[0].id, amount: 0, category: categories[0] }]);
    }
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const percent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const colorClass = percent > 100 ? 'bg-[var(--color-danger)]' : percent > 80 ? 'bg-[var(--color-warning)]' : percent > 50 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-secondary)]';

  return (
    <div className="p-4 max-w-4xl mx-auto pb-24">
      <h1 className="text-2xl font-bold mb-6">Monthly Budget</h1>
      
      <div className="flex gap-4 mb-6">
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="input">
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i} value={i}>{new Date(0, i).toLocaleString('en', { month: 'long' })}</option>
          ))}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="input">
          {[year - 1, year, year + 1].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="card p-6 mb-8">
        <h2 className="text-xl mb-4 font-semibold">Overall Budget</h2>
        <div className="flex items-center gap-2 text-3xl font-bold mb-4">
          ₹ <input type="number" value={totalBudget} onChange={e => setTotalBudget(Number(e.target.value))} className="input text-3xl w-full max-w-[200px]" />
        </div>
        
        <div className="w-full h-4 bg-[var(--color-border)] rounded-full overflow-hidden mb-2">
          <div className={`h-full ${colorClass}`} style={{ width: `${Math.min(percent, 100)}%` }}></div>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Spent: {formatCurrency(totalSpent)}</span>
          <span>Remaining: {formatCurrency(totalBudget - totalSpent)}</span>
        </div>
        
        {percent > 100 && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center gap-2">
            <AlertTriangle size={20} /> Budget Exceeded!
          </div>
        )}
      </div>

      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Category Budgets</h2>
          <button onClick={handleAddCategory} className="btn-secondary text-sm flex items-center gap-1"><Plus size={16}/> Add Category</button>
        </div>
        
        <div className="space-y-6">
          {categoryBudgets.map((cb, idx) => {
            const catSpent = expenses.filter(e => e.categoryId === cb.categoryId).reduce((acc, curr) => acc + curr.amount, 0);
            const catPercent = cb.amount > 0 ? (catSpent / cb.amount) * 100 : 0;
            const catColorClass = catPercent > 100 ? 'bg-[var(--color-danger)]' : catPercent > 80 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-secondary)]';

            return (
              <div key={idx} className="flex flex-col gap-2 border-b pb-4">
                <div className="flex items-center gap-4">
                  <select value={cb.categoryId} onChange={(e) => {
                    const newCats = [...categoryBudgets];
                    newCats[idx].categoryId = e.target.value;
                    setCategoryBudgets(newCats);
                  }} className="input flex-1">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <div className="flex items-center gap-1">
                    ₹ <input type="number" value={cb.amount} onChange={(e) => {
                      const newCats = [...categoryBudgets];
                      newCats[idx].amount = Number(e.target.value);
                      setCategoryBudgets(newCats);
                    }} className="input w-24" />
                  </div>
                </div>
                
                <div className="w-full h-2 bg-[var(--color-border)] rounded-full overflow-hidden mt-1">
                  <div className={`h-full ${catColorClass}`} style={{ width: `${Math.min(catPercent, 100)}%` }}></div>
                </div>
                <div className="text-xs text-[var(--color-text-secondary)] text-right">
                  Spent: {formatCurrency(catSpent)} / {formatCurrency(cb.amount)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button onClick={saveBudget} className="btn-primary flex items-center gap-2 px-8 py-3"><Save /> Save Budget</button>
      </div>
    </div>
  );
}
