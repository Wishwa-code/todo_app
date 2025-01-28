import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';



const TaskPopup = ({ task, onClose, onEdit, isNew = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTask, setEditedTask] = useState(task || { text: '', description: '', completed: false });
    const popupRef = useRef(null);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [taskStatus, setTaskStatus] = useState(task?.status || 'Pending');


  
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
          onClose();
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [onClose]);
  
    const handleSave = () => {
      onEdit({ ...editedTask, status: taskStatus });
      setIsEditing(false);
    };

    useEffect(() => {
        if (isNew) {
          setIsEditing(true); // Set isEditing to true when it's a new task
        }
      }, [isNew]);
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div ref={popupRef} className="bg-black bg-opacity-70 text-white p-6 rounded-lg max-w-lg w-full">
            {isNew || task ? ( // Check if isNew or task exists
                isEditing ? (
                    <>
                        <input
                            type="text"
                            value={editedTask.text}
                            onChange={(e) => setEditedTask({ ...editedTask, text: e.target.value })}
                            className="w-full bg-gray-800 text-white p-2 rounded mb-2"
                        />
                        <textarea
                            value={editedTask.description || ''}
                            onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                            className="w-full bg-gray-800 text-white p-2 rounded mb-2"
                            rows="3"
                        />
                        <div className="flex justify-between items-center">
                            <select
                                value={taskStatus}
                                onChange={(e) => setTaskStatus(e.target.value)}
                                className="bg-yellow-300 text-yellow-800 px-2 py-1 rounded"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Overdue">Overdue</option>
                                <option value="Completed">Completed</option>
                                <option value="Upcoming">Upcoming</option>
                            </select>
                                <span>Mon, 4 dec</span>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-2">{task.text}</h2>
                        <p className="mb-4">{task.description || 'This is the description of the final tasks. This is the description of the final tasks This is the description of the final tasks This'}</p>
                        <h4 className="">{taskStatus}</h4>
                    </>
                )
            ) : (
                <p>Loading task...</p> // Or any suitable message
            )}

            
            <div className="mt-4 flex justify-between">
                {isEditing ? (
                    <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded">
                        {isNew ? 'Add Task' : 'Save Changes'}
                    </button>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="bg-blue-500 text-white px-4 py-2 rounded">Edit</button>
                )}
                <button onClick={onClose} className="bg-white text-black px-4 py-2 rounded">Close</button>
            </div>
        </div>
      </div>
    );
  };

const DashboardPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Finalize Presentation', completed: false },
    { id: 2, text: 'Change the dataset', completed: false },
    { id: 3, text: 'Fix the bug', completed: true },
    { id: 4, text: 'Update documentation', completed: false },
    { id: 5, text: 'Review pull requests', completed: false },
    { id: 6, text: 'Prepare for team meeting', completed: false },
    { id: 7, text: 'Refactor legacy code', completed: false },
    { id: 8, text: 'Write unit tests', completed: false },
    { id: 9, text: 'Optimize database queries', completed: false },
    { id: 10, text: 'Deploy to production', completed: false },
  ]);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [quote, setQuote] = useState({ text: '', author: '' });
  const [selectedTask, setSelectedTask] = useState(null);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [isAddingTask, setIsAddingTask] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchBackgroundImage();
    fetchQuote();
    return () => clearInterval(timer);
  }, []);

  const fetchBackgroundImage = async () => {
    try {
      const response = await axios.get('https://api.unsplash.com/photos/random?query=sunset&client_id=39-2vQBMrUxDY_q6uu1zsXZQgy6upcIKtQgd1JAfU0Y');
      setBackgroundImage(response.data.urls.regular);
    } catch (error) {
      console.error('Error fetching background image:', error);
    }
  };

  const fetchQuote = async () => {
    try {
      const response = await axios.get('https://api.quotable.io/random');
      setQuote({ text: response.data.content, author: response.data.author });
    } catch (error) {
      console.error('Error fetching quote:', error);
    }
  };

  const handleEditTask = (editedTask) => {
    if (editedTask.id) {
      // Editing existing task
      setTasks(tasks.map(task => task.id === editedTask.id ? editedTask : task));
    } else {
      // Adding new task
      const newTask = { ...editedTask, id: Date.now() };
      setTasks([...tasks, newTask]);
    }
    setSelectedTask(null);
    setIsAddingTask(false);
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const visibleTasks = showAllTasks ? tasks : tasks.slice(0, 3);

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="text-white text-center max-w-2xl mx-auto">
        <h1 className="text-6xl font-bold mb-4">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </h1>
        <h2 className="text-3xl mb-8">Good evening, Wishwa.</h2>
        <div className="bg-black bg-opacity-50 rounded-lg p-6">
          {visibleTasks.map(task => (
            <div 
              key={task.id} 
              className="flex items-center mb-4 relative cursor-pointer"
              onMouseEnter={() => setHoveredTask(task.id)}
              onMouseLeave={() => setHoveredTask(null)}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleTask(task.id);
                }}
                className="mr-3"
              />
              <span 
                className={task.completed ? 'line-through' : ''}
                onClick={() => setSelectedTask(task)}
              >
                {task.text}
              </span>
              {hoveredTask === task.id && (
                <button 
                  className="absolute right-0 bg-red-500 text-white px-2 py-1 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
          <button 
            className="mt-4 text-sm underline"
            onClick={() => setShowAllTasks(!showAllTasks)}
          >
            {showAllTasks ? 'Show less' : 'Show more'}
          </button>
          
        </div>
        <div>
        <button 
            className="mt-4 ml-4 bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => setIsAddingTask(true)}
          >
            Add Task
          </button>
        </div>

        <div className="mt-8 p-4 rounded-lg">
          <p className="italic">"{quote.text}"</p>
          <p className="mt-2">- {quote.author}</p>
        </div>
      </div>
      {selectedTask && (
        <TaskPopup 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onEdit={handleEditTask}
        />
      )}
      {isAddingTask && (
        <TaskPopup 
          onClose={() => setIsAddingTask(false)} 
          onEdit={handleEditTask}
          isNew={true}
          task={{ text: "", description: "", completed: false }} // Empty task object
        />
      )}
    </div>
  );
};

export default DashboardPage;