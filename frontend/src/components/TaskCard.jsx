import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTask } from '../context/TaskContext';
import { formatDistanceToNow, isPast, format } from 'date-fns';

const TaskCard = ({ task }) => {
  const { 
    startTimeTracking, 
    pauseTimeTracking, 
    updateTaskStatus, 
    updateTaskPriority, 
    activeTimeLogs 
  } = useTask();
  const navigate = useNavigate();
  
  const [showActions, setShowActions] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  const isTaskActive = activeTimeLogs.some(log => log.task._id === task._id);
  const activeTimeLog = activeTimeLogs.find(log => log.task._id === task._id);
  
  const priorityColors = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-blue-100 text-blue-800',
    High: 'bg-orange-100 text-orange-800',
    Urgent: 'bg-red-100 text-red-800'
  };
  
  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    Completed: 'bg-green-100 text-green-800',
    'On Hold': 'bg-gray-100 text-gray-800',
    Cancelled: 'bg-red-100 text-red-800'
  };

  const handleStartTracking = async () => {
    try {
      await startTimeTracking(task._id);
      // The state will be updated by the context
    } catch (error) {
      console.error('Error starting tracking:', error);
    }
  };

  const handlePauseTracking = async () => {
    try {
      if (activeTimeLog) {
        await pauseTimeTracking(activeTimeLog._id);
        // The state will be updated by the context
      }
    } catch (error) {
      console.error('Error pausing tracking:', error);
    }
  };

  const handleStatusChange = (status) => {
    updateTaskStatus(task._id, status);
    setShowStatusDropdown(false);
  };

  const handlePriorityChange = (priority) => {
    updateTaskPriority(task._id, priority);
    setShowPriorityDropdown(false);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 hover:shadow-lg transition-shadow relative"
      style={{ borderLeftColor: task.priority === 'Urgent' ? '#ef4444' : task.priority === 'High' ? '#f97316' : task.priority === 'Medium' ? '#3b82f6' : '#22c55e' }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowStatusDropdown(false);
        setShowPriorityDropdown(false);
      }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Link to={`/tasks/${task._id}`} className="text-lg font-semibold hover:text-button">
              {task.title}
            </Link>
            
            {/* Active timer indicator */}
            {isTaskActive && (
              <div className="flex items-center text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                Active
              </div>
            )}
          </div>

          <div className="mt-2 text-sm text-gray-600 line-clamp-2">
            {task.description || "No description provided"}
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[task.status]}`}>
              {task.status}
            </span>
            
            <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            
            {task.deadline && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                isPast(new Date(task.deadline)) ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                Due: {format(new Date(task.deadline), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </div>
        
        {/* Time tracking buttons */}
        <div className={`flex gap-2 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}>
          {!isTaskActive ? (
            <button 
              onClick={handleStartTracking}
              className="bg-green-500 hover:bg-green-600 hover:text-white text-white px-3 py-1 rounded text-sm"
              disabled={task.status === 'Completed' || task.status === 'Cancelled'}
            >
              Start
            </button>
          ) : (
            <button 
              onClick={handlePauseTracking}
              className="bg-yellow-500 hover:bg-yellow-600 hover:text-white text-white px-3 py-1 rounded text-sm"
            >
              Pause
            </button>
          )}
        </div>
      </div>
      
      {/* Status and Priority dropdowns */}
      <div className="flex gap-2 mt-3">
        <div className="relative">
          <button 
            onClick={() => {
              setShowStatusDropdown(!showStatusDropdown);
              setShowPriorityDropdown(false);
            }}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded flex items-center gap-1"
          >
            Status
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showStatusDropdown && (
            <div className="absolute left-0 mt-1 w-24 bg-white rounded-md shadow-lg py-1 z-10">
              {['Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled'].map((status) => (
                <button 
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className="w-full bg-white text-blue-500 text-left text-xs px-2 py-1"
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="relative">
          <button 
            onClick={() => {
              setShowPriorityDropdown(!showPriorityDropdown);
              setShowStatusDropdown(false);
            }}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded flex items-center gap-1"
          >
            Priority
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showPriorityDropdown && (
            <div className="absolute left-0 mt-1 w-24 bg-white rounded-md shadow-lg py-1 z-10">
              {['Low', 'Medium', 'High', 'Urgent'].map((priority) => (
                <button 
                  key={priority}
                  onClick={() => handlePriorityChange(priority)}
                  className="w-full bg-white text-blue-500 text-left text-xs px-2 py-1"
                >
                  {priority}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard; 