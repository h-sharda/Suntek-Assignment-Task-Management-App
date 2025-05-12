import { useState, useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import DailySummaryCard from '../components/DailySummaryCard';
import { formatDate } from '../utils/formatters';

const Dashboard = () => {
  const { dailySummaries, loading, fetchDailySummaries } = useTask();
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredSummaries, setFilteredSummaries] = useState([]);
  
  // Filter summaries when date changes
  useEffect(() => {
    if (selectedDate) {
      const filtered = dailySummaries.filter(summary => {
        const summaryDate = new Date(summary.date);
        const selected = new Date(selectedDate);
        return (
          summaryDate.getFullYear() === selected.getFullYear() &&
          summaryDate.getMonth() === selected.getMonth() &&
          summaryDate.getDate() === selected.getDate()
        );
      });
      setFilteredSummaries(filtered);
    } else {
      setFilteredSummaries(dailySummaries);
    }
  }, [selectedDate, dailySummaries]);

  // Calculate productivity stats
  const calculateStats = () => {
    if (!dailySummaries.length) return { totalTasks: 0, completedTasks: 0, totalTime: 0 };
    
    return dailySummaries.reduce((stats, summary) => {
      return {
        totalTasks: stats.totalTasks + summary.tasks.length,
        completedTasks: stats.completedTasks + summary.completedTasks,
        totalTime: stats.totalTime + summary.totalTimeSpent,
      };
    }, { totalTasks: 0, completedTasks: 0, totalTime: 0 });
  };
  
  const stats = calculateStats();
  const completionRate = stats.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        <div className="flex items-center gap-3">
          <label htmlFor="dateFilter" className="text-sm font-medium text-gray-700">
            Filter by date:
          </label>
          <input
            type="date"
            id="dateFilter"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-button text-white rounded-md focus:outline-none focus:ring-2 focus:ring-button"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Tasks</h3>
          <p className="text-3xl font-bold">{stats.totalTasks}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Completion Rate</h3>
          <p className="text-3xl font-bold">{completionRate}%</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Time Tracked</h3>
          <p className="text-3xl font-bold">
            {Math.floor(stats.totalTime / (1000 * 60 * 60))}h {Math.floor((stats.totalTime % (1000 * 60 * 60)) / (1000 * 60))}m
          </p>
        </div>
      </div>
      
      <h2 className="text-2xl font-semibold mb-4">Daily Summaries</h2>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-button"></div>
        </div>
      ) : filteredSummaries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSummaries.map((summary) => (
            <DailySummaryCard key={summary._id} summary={summary} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            {selectedDate 
              ? `No summaries found for ${formatDate(selectedDate)}.` 
              : 'No daily summaries yet. Start tracking time on tasks to generate summaries!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 