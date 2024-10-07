import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskManager from './TaskManager';
import axios from '../../api/mockApi';

jest.mock('../../api/mockApi', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe('TaskManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders TaskManager component', () => {
    render(<TaskManager />);
    expect(screen.getByText('Task Management')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter a new task')).toBeInTheDocument();
    expect(screen.getByText('Add Task')).toBeInTheDocument();
  });

  test('fetches tasks on mount', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', completed: false },
      { id: 2, title: 'Task 2', completed: true },
    ];
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockTasks });

    render(<TaskManager />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/tasks');
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });

  test('adds a new task', async () => {
    (axios.post as jest.Mock).mockResolvedValueOnce({ data: { id: 3, title: 'New Task', completed: false } });

    render(<TaskManager />);

    await userEvent.type(screen.getByPlaceholderText('Enter a new task'), 'New Task');
    await userEvent.click(screen.getByText('Add Task'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/tasks', expect.objectContaining({ title: 'New Task' }));
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });

  test('shows error message for empty task', async () => {
    render(<TaskManager />);

    await userEvent.click(screen.getByText('Add Task'));

    expect(screen.getByText('Please enter a task')).toBeInTheDocument();
  });

  test('toggles task completion', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', completed: false },
    ];
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockTasks });

    render(<TaskManager />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  test('filters tasks', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', completed: false },
      { id: 2, title: 'Task 2', completed: true },
    ];
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockTasks });

    render(<TaskManager />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Completed'));

    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Incomplete'));

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
  });
});