import React, { useState, useEffect } from 'react';
import axios from '../../api/mockApi';
import './TaskManager.css';

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

type FilterType = 'all' | 'completed' | 'incomplete';

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now(),
        title: newTaskTitle.trim(),
        completed: false,
      };

      // Add the new task to the list immediately
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setNewTaskTitle('');

      // Simulate POST request to the mock API
      try {
        const response = await axios.post('/tasks', newTask);
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === newTask.id ? { ...response.data } : task
          )
        );
      } catch (error) {
        console.error('Error adding task:', error);
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== newTask.id));
      }
    }
  };

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'completed') return task.completed;
    if (filter === 'incomplete') return !task.completed;
    return true;
  });

  return (
    <div className="task-manager">
      <h1>Task Management</h1>

      <form onSubmit={addTask}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Enter a new task"
        />
        <button type="submit">Add Task</button>
      </form>

      <div className="filter-buttons">
        <button onClick={() => setFilter('all')} disabled={filter === 'all'}>
          All
        </button>
        <button onClick={() => setFilter('completed')} disabled={filter === 'completed'}>
          Completed
        </button>
        <button onClick={() => setFilter('incomplete')} disabled={filter === 'incomplete'}>
          Incomplete
        </button>
      </div>

      {isLoading ? (
        <p>Loading tasks...</p>
      ) : (
        <ul className="task-list">
          {filteredTasks.map((task) => (
            <li key={task.id}>
              <label className="task-item">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                />
                <span className={task.completed ? 'completed' : ''}>{task.title}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskManager;