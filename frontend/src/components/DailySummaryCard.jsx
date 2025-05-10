import { Link } from 'react-router-dom';
import { formatDate, formatDurationHuman } from '../utils/formatters';
import { useTask } from '../context/TaskContext';

const DailySummaryCard = ({ summary }) => {
  const { generateSummary } = useTask();
  
  const handleGenerateSummary = async () => {
    try {
      await generateSummary(summary._id);
    } catch (error) {
      console.error('Error generating summary:', error);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <Link to={`/daily-summaries/${summary._id}`} className="text-lg font-semibold hover:text-button">
          {formatDate(summary.date)}
        </Link>
        
        <div className="flex gap-2">
          <button
            onClick={handleGenerateSummary}
            className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 px-2 py-1 rounded flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Summary
          </button>
        </div>
      </div>
      
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="bg-blue-50 rounded-lg p-2">
          <p className="text-xs text-blue-600">Total Time</p>
          <p className="font-semibold">{formatDurationHuman(summary.totalTimeSpent)}</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-2">
          <p className="text-xs text-green-600">Completed</p>
          <p className="font-semibold">{summary.completedTasks || 0}</p>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-2">
          <p className="text-xs text-yellow-600">In Progress</p>
          <p className="font-semibold">{summary.inProgressTasks || 0}</p>
        </div>
      </div>
      
      {summary.summary && (
        <div className="mt-3 text-sm text-gray-600 border-t pt-2">
          <p className="font-medium text-xs text-gray-500 mb-1">Summary:</p>
          <p>{summary.summary}</p>
        </div>
      )}
      
      <div className="mt-3">
        <p className="font-medium text-xs text-gray-500 mb-1">Tasks ({summary.tasks.length}):</p>
        <div className="max-h-32 overflow-y-auto">
          {summary.tasks.map((taskItem, index) => (
            <div key={index} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-sm truncate">
                  {taskItem.task?.title || 'Unknown Task'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  taskItem.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  taskItem.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  taskItem.status === 'On Hold' ? 'bg-gray-100 text-gray-800' :
                  taskItem.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {taskItem.status || 'Pending'}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {formatDurationHuman(taskItem.timeSpent)}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-3 text-right">
        <Link 
          to={`/daily-summaries/${summary._id}`}
          className="text-sm text-button hover:underline"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default DailySummaryCard; 