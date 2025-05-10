import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTask } from '../context/TaskContext';
import { formatDate, formatDateTime, formatDurationHuman } from '../utils/formatters';
import axios from 'axios';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    updateTask, 
    deleteTask, 
    startTimeTracking, 
    pauseTimeTracking, 
    activeTimeLogs 
  } = useTask();
  
  const [task, setTask] = useState(null);
  const [timeLogs, setTimeLogs] = useState([]);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '',
    status: '',
    deadline: '',
    remarks: '',
  });
  
  const isTaskActive = activeTimeLogs.some(log => log.task._id === id);
  const activeTimeLog = activeTimeLogs.find(log => log.task._id === id);
  
  // Fetch task details
  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const { data } = await axios.get(`/api/tasks/${id}`);
        setTask(data.data);
        setTimeLogs(data.timeLogs || []);
        
        // Calculate total time spent
        let total = 0;
        if (data.timeLogs) {
          total = data.timeLogs.reduce((sum, log) => {
            return sum + (log.duration || 0);
          }, 0);
        }
        setTotalTimeSpent(total);
        
        // Initialize form data
        setFormData({
          title: data.data.title || '',
          description: data.data.description || '',
          priority: data.data.priority || 'Medium',
          status: data.data.status || 'Pending',
          deadline: data.data.deadline ? new Date(data.data.deadline).toISOString().substring(0, 16) : '',
          remarks: '',
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching task details:', error);
        navigate('/');
      }
    };
    
    fetchTaskDetails();
  }, [id, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const updatedTask = await updateTask(id, formData);
      setTask(updatedTask);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await deleteTask(id);
        navigate('/');
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };
  
  const handleStartTracking = async () => {
    try {
      await startTimeTracking(id);
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
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-button"></div>
      </div>
    );
  }
  
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
          Back
        </button>
        
        <div className="flex gap-2">
          {isEditing ? (
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
            >
              Cancel
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Edit Task</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-button focus:border-transparent"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-button focus:border-transparent"
                rows="3"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-button focus:border-transparent"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-button focus:border-transparent"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline (optional)
                </label>
                <input
                  type="datetime-local"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-button focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                Add Remark
              </label>
              <textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-button focus:border-transparent"
                rows="2"
                placeholder="Optional: Add a new remark"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-button hover:bg-button-hover text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-button focus:ring-opacity-50 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">{task.title}</h1>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[task.status]}`}>
              {task.status}
            </span>
            
            <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            
            {task.deadline && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                new Date(task.deadline) < new Date() ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                Due: {formatDateTime(task.deadline)}
              </span>
            )}
          </div>
          
          {task.description && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-1">Description</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-semibold text-gray-700">Time Tracking</h2>
              <div className="text-sm">
                Total: <span className="font-semibold">{formatDurationHuman(totalTimeSpent)}</span>
              </div>
            </div>
            
            <div className="flex gap-2 mb-4">
              {!isTaskActive ? (
                <button
                  onClick={handleStartTracking}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                  disabled={task?.status === 'Completed' || task?.status === 'Cancelled'}
                >
                  Start Tracking
                </button>
              ) : (
                <button
                  onClick={handlePauseTracking}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                >
                  Pause Tracking
                </button>
              )}
            </div>
            
            {timeLogs.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {timeLogs.map((log) => (
                      <tr key={log._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(log.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(log.startTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.endTime ? formatDateTime(log.endTime) : 'Active'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.duration ? formatDurationHuman(log.duration) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No time logs yet.</p>
            )}
          </div>
          
          {task.remarks && task.remarks.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Remarks</h2>
              <div className="space-y-2">
                {task.remarks.map((remark, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">{remark.text}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDateTime(remark.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {task.statusHistory && task.statusHistory.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-2">Status History</h2>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Changed At</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {task.statusHistory.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {formatDateTime(item.changedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {task.priorityHistory && task.priorityHistory.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-2">Priority History</h2>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Changed At</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {task.priorityHistory.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[item.priority]}`}>
                              {item.priority}
                            </span>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {formatDateTime(item.changedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetails; 