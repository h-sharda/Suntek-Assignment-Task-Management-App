import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export const useTask = () => {
  return useContext(TaskContext);
};

export const TaskProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [ongoingTasks, setOngoingTasks] = useState([]);
  const [activeTimeLogs, setActiveTimeLogs] = useState([]);
  const [dailySummaries, setDailySummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);

  // Fetch ongoing tasks
  const fetchOngoingTasks = async () => {
    try {
      const { data } = await axios.get('/api/tasks/ongoing');
      setOngoingTasks(sortTasksByPriority(data.data));
    } catch (error) {
      console.error('Error fetching ongoing tasks:', error);
      toast.error('Failed to fetch ongoing tasks');
    }
  };

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      const { data } = await axios.get('/api/tasks');
      setTasks(sortTasksByPriority(data.data));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    }
  };

  // Fetch active time logs
  const fetchActiveTimeLogs = async () => {
    try {
      const { data } = await axios.get('/api/time-logs/active');
      if (data.data) {
        setActiveTimeLogs(data.data);
        // Update task status in the tasks list
        setTasks(prevTasks => 
          prevTasks.map(task => {
            const isActive = data.data.some(log => log.task._id === task._id);
            return isActive ? { ...task, status: 'In Progress' } : task;
          })
        );
        // Update task status in ongoing tasks
        setOngoingTasks(prevTasks => 
          prevTasks.map(task => {
            const isActive = data.data.some(log => log.task._id === task._id);
            return isActive ? { ...task, status: 'In Progress' } : task;
          })
        );
      } else {
        setActiveTimeLogs([]);
      }
    } catch (error) {
      console.error('Error fetching active time logs:', error);
      setActiveTimeLogs([]);
    }
  };

  // Fetch daily summaries
  const fetchDailySummaries = async () => {
    try {
      const { data } = await axios.get('/api/daily-summaries');
      setDailySummaries(data.data);
    } catch (error) {
      console.error('Error fetching daily summaries:', error);
      toast.error('Failed to fetch daily summaries');
    }
  };

  // Create a new task
  const createTask = async (taskData) => {
    try {
      const { data } = await axios.post('/api/tasks', taskData);
      setTasks(prevTasks => sortTasksByPriority([data.data, ...prevTasks]));
      fetchOngoingTasks();
      toast.success('Task created successfully');
      return data.data;
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      throw error;
    }
  };

  // Create task with AI
  const createTaskWithAI = async (userInput) => {
    try {
      const { data } = await axios.post('/api/tasks/ai', { userInput });
      setTasks([data.data, ...tasks]);
      fetchOngoingTasks();
      toast.success('Task created with AI assistance');
      return data;
    } catch (error) {
      console.error('Error creating task with AI:', error);
      toast.error('Failed to create task with AI');
      throw error;
    }
  };

  // Update task
  const updateTask = async (taskId, updates) => {
    try {
      const { data } = await axios.put(`/api/tasks/${taskId}`, updates);
      
      // If status is completed, remove from ongoing tasks
      if (updates.status === 'Completed') {
        setOngoingTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
      } else {
        // Update the task in ongoing tasks
        setOngoingTasks(prevTasks => {
          const updatedTasks = prevTasks.map(task => 
            task._id === taskId ? data.data : task
          );
          return sortTasksByPriority(updatedTasks);
        });
      }
      
      // Update in all tasks list
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(task => 
          task._id === taskId ? data.data : task
        );
        return sortTasksByPriority(updatedTasks);
      });
      
      // Refresh daily summaries when a task is updated
      await fetchDailySummaries();
      toast.success('Task updated successfully');
      return data.data;
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      throw error;
    }
  };

  // Sort tasks by priority
  const sortTasksByPriority = (tasks) => {
    const priorityOrder = {
      'Urgent': 0,
      'High': 1,
      'Medium': 2,
      'Low': 3
    };
    
    return [...tasks].sort((a, b) => {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  // Delete task
  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      // Remove task from active time logs if it was being tracked
      setActiveTimeLogs(prev => prev.filter(log => log.task._id !== taskId));
      // Remove task from tasks list
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
      // Remove task from ongoing tasks
      setOngoingTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
      // Refresh daily summaries to update task counts
      fetchDailySummaries();
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      throw error;
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId, status) => {
    try {
      const { data } = await axios.put(`/api/tasks/${taskId}/status`, { status });
      
      // Update task status in both lists immediately
      const updateTaskStatus = (task) => {
        if (task._id === taskId) {
          return { ...task, status };
        }
        return task;
      };
      
      setTasks(prevTasks => prevTasks.map(updateTaskStatus));
      setOngoingTasks(prevTasks => prevTasks.map(updateTaskStatus));
      
      // Refresh data in the background
      Promise.all([
        fetchOngoingTasks(),
        fetchDailySummaries(),
        fetchActiveTimeLogs()
      ]).catch(error => {
        console.error('Error refreshing data:', error);
      });
      
      toast.success('Task status updated');
      return data.data;
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
      throw error;
    }
  };

  // Update task priority
  const updateTaskPriority = async (taskId, priority) => {
    try {
      const { data } = await axios.put(`/api/tasks/${taskId}/priority`, { priority });
      
      // Update task priority in both lists immediately
      const updateTaskPriority = (task) => {
        if (task._id === taskId) {
          return { ...task, priority };
        }
        return task;
      };
      
      setTasks(prevTasks => prevTasks.map(updateTaskPriority));
      setOngoingTasks(prevTasks => prevTasks.map(updateTaskPriority));
      
      // Refresh data in the background
      Promise.all([
        fetchOngoingTasks(),
        fetchDailySummaries()
      ]).catch(error => {
        console.error('Error refreshing data:', error);
      });
      
      toast.success('Task priority updated');
      return data.data;
    } catch (error) {
      console.error('Error updating task priority:', error);
      toast.error('Failed to update task priority');
      throw error;
    }
  };

  // Add remark to task
  const addRemark = async (id, text) => {
    try {
      const { data } = await axios.post(`/api/tasks/${id}/remarks`, { text });
      setTasks(tasks.map(task => task._id === id ? data.data : task));
      toast.success('Remark added successfully');
      return data.data;
    } catch (error) {
      console.error('Error adding remark:', error);
      toast.error('Failed to add remark');
      throw error;
    }
  };

  // Start time tracking
  const startTimeTracking = async (taskId) => {
    try {
      const { data } = await axios.post(`/api/time-logs/start/${taskId}`);
      
      // Update active time logs immediately
      setActiveTimeLogs(prev => [...prev, data.data]);
      
      // Update task status in both lists immediately
      const updateTaskStatus = (task) => {
        if (task._id === taskId) {
          return { ...task, status: 'In Progress' };
        }
        return task;
      };
      
      setTasks(prevTasks => prevTasks.map(updateTaskStatus));
      setOngoingTasks(prevTasks => prevTasks.map(updateTaskStatus));
      
      // Refresh data in the background
      Promise.all([
        fetchOngoingTasks(),
        fetchDailySummaries(),
        fetchActiveTimeLogs()
      ]).catch(error => {
        console.error('Error refreshing data:', error);
      });
      
      toast.success('Time tracking started');
      return data.data;
    } catch (error) {
      console.error('Error starting time tracking:', error);
      toast.error('Failed to start time tracking');
      throw error;
    }
  };

  // Pause time tracking
  const pauseTimeTracking = async (timeLogId) => {
    try {
      const { data } = await axios.post(`/api/time-logs/pause/${timeLogId}`);
      
      // Update active time logs immediately
      setActiveTimeLogs(prev => prev.filter(log => log._id !== timeLogId));
      
      // Update task status in both lists immediately
      const updateTaskStatus = (task) => {
        if (task._id === data.data.task) {
          return { ...task, status: 'On Hold' };
        }
        return task;
      };
      
      setTasks(prevTasks => prevTasks.map(updateTaskStatus));
      setOngoingTasks(prevTasks => prevTasks.map(updateTaskStatus));
      
      // Refresh data in the background
      Promise.all([
        fetchOngoingTasks(),
        fetchDailySummaries(),
        fetchActiveTimeLogs()
      ]).catch(error => {
        console.error('Error refreshing data:', error);
      });
      
      toast.success('Time tracking paused');
      return data.data;
    } catch (error) {
      console.error('Error pausing time tracking:', error);
      toast.error('Failed to pause time tracking');
      throw error;
    }
  };

  // Get daily summary by date
  const getDailySummaryByDate = async (date) => {
    try {
      const { data } = await axios.get(`/api/daily-summaries/date/${date}`);
      return data.data;
    } catch (error) {
      console.error('Error fetching daily summary:', error);
      toast.error('Failed to fetch daily summary');
      throw error;
    }
  };

  // Generate summary
  const generateSummary = async (summaryId) => {
    try {
      const { data } = await axios.post(`/api/daily-summaries/${summaryId}/generate-summary`);
      setDailySummaries(dailySummaries.map(summary => 
        summary._id === summaryId ? data.data : summary
      ));
      toast.success('Summary generated');
      return data;
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate summary');
      throw error;
    }
  };

  // Load initial data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const loadInitialData = async () => {
        setLoading(true);
        try {
          await Promise.all([
            fetchTasks(),
            fetchOngoingTasks(),
            fetchActiveTimeLogs(),
            fetchDailySummaries()
          ]);
        } catch (error) {
          console.error('Error loading initial data:', error);
        } finally {
          setLoading(false);
        }
      };
      
      loadInitialData();
    }
  }, [isAuthenticated]);

  const value = {
    tasks,
    ongoingTasks,
    activeTimeLogs,
    dailySummaries,
    loading,
    activeTask,
    setActiveTask,
    fetchTasks,
    fetchOngoingTasks,
    fetchActiveTimeLogs,
    fetchDailySummaries,
    createTask,
    createTaskWithAI,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskPriority,
    addRemark,
    startTimeTracking,
    pauseTimeTracking,
    getDailySummaryByDate,
    generateSummary
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}; 