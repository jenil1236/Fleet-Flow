'use client';

import { useEffect, useState } from 'react';
import { Plus, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses/list');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to fetch expenses');
      
      if (data.success) {
        setExpenses(data.data);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.totalCost), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-600 dark:text-red-400 mb-4">Error: {error}</div>
        <button
          onClick={fetchExpenses}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Expenses
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage fleet expenses
          </p>
        </div>
        <Link
          href="/dashboard/expenses/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          Log Expense
        </Link>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-8 h-8" />
          <h2 className="text-lg font-medium">Total Expenses</h2>
        </div>
        <p className="text-4xl font-bold">${totalExpenses.toLocaleString()}</p>
        <p className="text-blue-100 mt-2">{expenses.length} expense records</p>
      </div>

      {/* Expenses List */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        {expenses.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No expenses recorded</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Vehicle</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Driver</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Fuel Cost</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Misc Cost</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(expense => (
                  <tr key={expense.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      {new Date(expense.expenseDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {expense.vehicle?.licensePlate || 'N/A'}
                      <div className="text-xs text-gray-500">{expense.vehicle?.model}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {expense.driver?.user?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      ${Number(expense.fuelCost).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      ${Number(expense.miscCost).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      ${Number(expense.totalCost).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        expense.status === 'APPROVED' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : expense.status === 'PENDING'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                      }`}>
                        {expense.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
