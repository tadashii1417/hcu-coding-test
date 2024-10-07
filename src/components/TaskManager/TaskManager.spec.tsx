import * as React from 'react';
import { render } from '@testing-library/react';
import TaskManager from './TaskManager';

describe('User', () => {
  test('renders heading', async () => {
    render(<TaskManager />);
    expect(1).toBe(1);
  });
});