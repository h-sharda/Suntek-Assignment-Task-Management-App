import { useState } from 'react';
import { useTask } from '../context/TaskContext';

const TaskForm = ({ onSuccess }) => {
  const { createTask, createTaskWithAI } = useTask();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    deadline: '',
  });
  const [userInput, setUserInput] = useState('');
  const [isUsingAI, setIsUsingAI] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUserInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isUsingAI) {
        await createTaskWithAI(userInput);
        setUserInput('');
      } else {
        await createTask(formData);
        setFormData({
          title: '',
          description: '',
          priority: 'Medium',
          deadline: '',
        });
      }
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFormMode = () => {
    setIsUsingAI(!isUsingAI);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Create New Task</h2>
        <button
          onClick={toggleFormMode}
          className="text-sm bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1 rounded-full flex items-center gap-1"
        >
          {isUsingAI ? 'Switch to Manual' : 'Use AI Assistant'}
          {isUsingAI && (
            <span className="inline-flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {isUsingAI ? (
          <div className="mb-4">
            <label htmlFor="userInput" className="block text-sm font-medium text-gray-700 mb-1">
              Describe your task in natural language
            </label>
            <textarea
              id="userInput"
              name="userInput"
              value={userInput}
              onChange={handleUserInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-button focus:border-transparent"
              rows="3"
              placeholder="E.g., Follow up with designer about the wireframes by tomorrow"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              AI will generate a clear title and structured description for your task.
            </p>
          </div>
        ) : (
          <>
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
                placeholder="Task title"
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
                placeholder="Task description"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
          </>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-button hover:bg-button-hover text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-button focus:ring-opacity-50 transition-colors"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : (
              `Create ${isUsingAI ? 'with AI' : 'Task'}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm; 