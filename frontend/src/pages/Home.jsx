import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTask } from '../context/TaskContext';
import TaskForm from '../components/TaskForm';
import TaskCard from '../components/TaskCard';

const Home = () => {
  const { user } = useAuth();
  const { ongoingTasks, loading, fetchOngoingTasks } = useTask();
  const [showForm, setShowForm] = useState(false);

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Welcome, {user?.name || 'User'}</h1>
        <button
          onClick={toggleForm}
          className="bg-button text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          {showForm ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Hide Form
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </>
          )}
        </button>
      </div>

      {showForm && <TaskForm onSuccess={() => fetchOngoingTasks()} />}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Ongoing Tasks</h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-button"></div>
          </div>
        ) : ongoingTasks.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {ongoingTasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-4">No ongoing tasks. Create a new task to get started!</p>
            {!showForm && (
              <button
                onClick={toggleForm}
                className="bg-button hover:bg-button-hover text-white px-4 py-2 rounded-md"
              >
                Create Task
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 