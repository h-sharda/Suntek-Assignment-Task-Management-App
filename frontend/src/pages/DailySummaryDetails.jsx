import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTask } from '../context/TaskContext';
import { formatDate, formatDateTime, formatDurationHuman } from '../utils/formatters';
import axios from 'axios';

const DailySummaryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { generateSummary } = useTask();
  
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  
  // Fetch summary details
  useEffect(() => {
    const fetchSummaryDetails = async () => {
      try {
        const { data } = await axios.get(`/api/daily-summaries/${id}`);
        setSummary(data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching daily summary:', error);
        navigate('/dashboard');
      }
    };
    
    fetchSummaryDetails();
  }, [id, navigate]);
  
  const handleGenerateSummary = async () => {
    setAiLoading(true);
    try {
      const result = await generateSummary(id);
      setSummary(result.data);
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setAiLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-button"></div>
      </div>
    );
  }
  
  // Sort tasks by time spent (descending)
  const sortedTasks = [...summary.tasks].sort((a, b) => b.timeSpent - a.timeSpent);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">Daily Summary: {formatDate(summary.date)}</h1>
          
          <button
            onClick={handleGenerateSummary}
            className="flex items-center gap-1 bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1 rounded-md text-sm"
            disabled={aiLoading}
          >
            {aiLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-purple-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Summary
              </>
            )}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-600 mb-1">Total Time</p>
            <p className="text-xl font-bold">{formatDurationHuman(summary.totalTimeSpent)}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-green-600 mb-1">Completed</p>
            <p className="text-xl font-bold">{summary.completedTasks}</p>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-sm text-yellow-600 mb-1">In Progress</p>
            <p className="text-xl font-bold">{summary.inProgressTasks}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-xl font-bold">{summary.pendingTasks}</p>
          </div>
        </div>
        
        {summary.summary && (
          <div className="mb-6 bg-purple-50 p-4 rounded-lg">
            <h2 className="text-sm font-semibold text-purple-800 mb-2">Summary</h2>
            <p className="text-gray-700">{summary.summary}</p>
          </div>
        )}
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Tasks</h2>
          
          {sortedTasks.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Spent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedTasks.map((taskItem) => (
                    <tr key={taskItem.task?._id || taskItem._id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {taskItem.task?.title || 'Unknown Task'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          taskItem.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          taskItem.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          taskItem.status === 'On Hold' ? 'bg-gray-100 text-gray-800' :
                          taskItem.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {taskItem.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDurationHuman(taskItem.timeSpent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {taskItem.task && (
                          <Link 
                            to={`/tasks/${taskItem.task._id}`}
                            className="text-button hover:underline"
                          >
                            View Details
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No tasks recorded for this day.</p>
          )}
        </div>
        
        <div className="text-sm text-gray-500">
          <p>Summary created: {formatDateTime(summary.createdAt)}</p>
          <p>Last updated: {formatDateTime(summary.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
};

export default DailySummaryDetails; 