import React, { useEffect, useState } from 'react';
import axios from '../../api/mockApi';
import { Button, Checkbox, Input, Layout, List, Radio, Space, Spin, Typography } from 'antd';
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

  const addTask = async () => {
    if (newTaskTitle.trim()) {
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
          prevTasks.map((task) =>
            task.id === newTask.id ? { ...response.data } : task,
          ),
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
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'completed') return task.completed;
    if (filter === 'incomplete') return !task.completed;
    return true;
  });

  return (
    <Layout className="task-manager-layout">
      <Header className="task-manager-header">
        <Title level={ 2 }>Task Management</Title>
      </Header>
      <Content className="task-manager-content">
        <Space direction="vertical" size="large" className="task-manager-space">
          <div className="task-input-container">
            <Input
              className="task-input"
              value={ newTaskTitle }
              onChange={ (e) => setNewTaskTitle(e.target.value) }
              placeholder="Enter a new task"
              onPressEnter={ addTask }
            />
            <Button type="primary" icon={ <PlusOutlined /> } onClick={ addTask }>
              Add Task
            </Button>
          </div>

          <Radio.Group value={ filter } onChange={ (e) => setFilter(e.target.value) }>
            <Radio.Button value="all">All</Radio.Button>
            <Radio.Button value="completed">Completed</Radio.Button>
            <Radio.Button value="incomplete">Incomplete</Radio.Button>
          </Radio.Group>

          <Spin spinning={ isLoading }>
            <List
              dataSource={ filteredTasks }
              renderItem={ (task) => (
                <List.Item>
                  <Checkbox
                    checked={ task.completed }
                    onChange={ () => toggleTask(task.id) }
                  >
                    <span className={ task.completed ? 'task-completed' : '' }>
                      { task.title }
                    </span>
                  </Checkbox>
                </List.Item>
              ) }
            />
          </Spin>
        </Space>
      </Content>
    </Layout>
  );
};

export default TaskManager;