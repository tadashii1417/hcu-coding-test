import React, { useState, useEffect } from 'react';
import axios from '../../api/mockApi';
import {
  Layout,
  Input,
  Button,
  List,
  Checkbox,
  Radio,
  Space,
  Typography,
  Spin,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './TaskManager.css';

const { Header, Content } = Layout;
const { Title } = Typography;

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
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/tasks');
      setTasks(response?.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      message.error('Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const validateInput = (value: string): boolean => {
    if (value.trim() === '') {
      setInputError('Please enter a task');
      return false;
    }
    setInputError('');
    return true;
  };

  const addTask = async () => {
    if (!validateInput(newTaskTitle)) {
      return;
    }

    const newTask: Task = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      completed: false,
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
    setNewTaskTitle('');

    try {
      const response = await axios.post('/tasks', newTask);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === newTask.id ? { ...response.data } : task))
      );
    } catch (error) {
      console.error('Error adding task:', error);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== newTask.id));
      message.error('Failed to add task');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTaskTitle(e.target.value);
    if (inputError) {
      setInputError('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'completed') return task.completed;
    if (filter === 'incomplete') return !task.completed;
    return true;
  });

  return (
    <Layout className='task-manager-layout'>
      <Header className='task-manager-header'>
        <Title level={2}>Task Management</Title>
      </Header>
      <Content className='task-manager-content'>
        <Space direction='vertical' size='large' className='task-manager-space'>
          <div className='task-input-container'>
            <div className='input-wrapper'>
              <Input
                value={newTaskTitle}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder='Enter a new task'
                status={inputError ? 'error' : ''}
              />
              {inputError && <div className='input-error'>{inputError}</div>}
            </div>
            <Button type='primary' icon={<PlusOutlined />} onClick={addTask}>
              Add Task
            </Button>
          </div>

          <Radio.Group value={filter} onChange={(e) => setFilter(e.target.value)}>
            <Radio.Button value='all'>All</Radio.Button>
            <Radio.Button value='completed'>Completed</Radio.Button>
            <Radio.Button value='incomplete'>Incomplete</Radio.Button>
          </Radio.Group>

          <Spin spinning={isLoading}>
            <List
              dataSource={filteredTasks}
              renderItem={(task) => (
                <List.Item>
                  <Checkbox checked={task.completed} onChange={() => toggleTask(task.id)}>
                    <span className={task.completed ? 'task-completed' : ''}>{task.title}</span>
                  </Checkbox>
                </List.Item>
              )}
            />
          </Spin>
        </Space>
      </Content>
    </Layout>
  );
};

export default TaskManager;
