import React from 'react';
import { useStore } from '../lib/store';
import { Button } from '../components/common/Button';
import { Download, BarChart2 } from 'lucide-react';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { differenceInDays, subDays, subMonths, subQuarters, subYears, isWithinInterval } from 'date-fns';

export default function Reports() {
  const [dateRange, setDateRange] = React.useState('month');
  const [reportType, setReportType] = React.useState('revenue');
  const rentals = useStore((state) => state.rentals);
  const products = useStore((state) => state.products);
  const customers = useStore((state) => state.customers);

  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'week':
        return { start: subDays(now, 7), end: now };
      case 'month':
        return { start: subMonths(now, 1), end: now };
      case 'quarter':
        return { start: subQuarters(now, 1), end: now };
      case 'year':
        return { start: subYears(now, 1), end: now };
      case 'all':
        // Find the earliest date among rentals and customers
        const dates = [
          ...rentals.map(r => new Date(r.startDate)),
          ...customers.map(c => new Date(c.joinDate))
        ];
        const earliestDate = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : now;
        return { start: earliestDate, end: now };
      default:
        return { start: subMonths(now, 1), end: now };
    }
  };

  const calculateMetrics = () => {
    const range = getDateRange();
    const filteredRentals = dateRange === 'all' 
      ? rentals 
      : rentals.filter((rental) => isWithinInterval(new Date(rental.startDate), range));

    // Calculate total rented items
    const rentedItems = rentals.reduce((acc, rental) => {
      if (rental.status === 'active' || rental.status === 'overdue') {
        rental.items.forEach(item => {
          acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
        });
      }
      return acc;
    }, {} as { [key: string]: number });

    const totalRevenue = filteredRentals.reduce((sum, rental) => sum + rental.totalPrice, 0);
    const activeRentals = rentals.filter((rental) => rental.status === 'active').length;
    const newCustomers = dateRange === 'all'
      ? customers.length
      : customers.filter((customer) => isWithinInterval(new Date(customer.joinDate), range)).length;
    const inventoryValue = products.reduce(
      (sum, product) => sum + (product.price.daily || 0) * product.stockTotal,
      0
    );

    return {
      totalRevenue,
      activeRentals,
      newCustomers,
      inventoryValue,
      rentedItems,
    };
  };

  const metrics = calculateMetrics();

  const renderReportContent = () => {
    switch (reportType) {
      case 'revenue':
        return (
          <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                Revenue Overview
              </h2>
              <RevenueChart dateRange={dateRange} />
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                Revenue Metrics
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    ${metrics.totalRevenue.toFixed(2)}
                  </p>
                </div>
                {dateRange !== 'all' && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Daily Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      ${(metrics.totalRevenue / differenceInDays(getDateRange().end, getDateRange().start)).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        );

      case 'inventory':
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
              Inventory Report
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {products.length}
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Stock Value</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  ${metrics.inventoryValue.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Available Items</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {products.reduce((sum, product) => sum + (product.stockAvailable || 0), 0)}
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Currently Rented Items</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {Object.values(metrics.rentedItems).reduce((sum, count) => sum + count, 0)}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                Product Details
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Available
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rented
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {product.stockTotal}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {product.stockAvailable}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {metrics.rentedItems[product.id] || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'rentals':
        const range = getDateRange();
        const filteredRentals = dateRange === 'all'
          ? rentals
          : rentals.filter((rental) => isWithinInterval(new Date(rental.startDate), range));

        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
              Rental Activity Report
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Rentals</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {filteredRentals.length}
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Rentals</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {filteredRentals.filter(r => r.status === 'active').length}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed Rentals</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {filteredRentals.filter(r => r.status === 'completed').length}
                </p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Overdue Rentals</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {filteredRentals.filter(r => r.status === 'overdue').length}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const generateReport = () => {
    const report = {
      type: reportType,
      dateRange,
      metrics,
      generatedAt: new Date().toISOString(),
    };
    
    // Convert to CSV
    const csvContent = `data:text/csv;charset=utf-8,${Object.entries(metrics)
      .map(([key, value]) => `${key},${value}`)
      .join('\n')}`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportType}-report-${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Reports
        </h1>
        <Button icon={Download} onClick={generateReport}>
          Export Report
        </Button>
      </div>

      <div className="flex space-x-4">
        <select
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
          <option value="all">All Time</option>
        </select>
        <select
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
        >
          <option value="revenue">Revenue Report</option>
          <option value="inventory">Inventory Report</option>
          <option value="rentals">Rental Activity Report</option>
        </select>
      </div>

      <div className="space-y-6">
        {renderReportContent()}
      </div>
    </div>
  );
}