import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const mock = new MockAdapter(axios, { delayResponse: 1000 });

const tasks = [
  { id: 1, title: 'Learn React', completed: false },
  { id: 2, title: 'Build a to-do app', completed: true },
  { id: 3, title: 'Build the app', completed: false },
  { id: 4, title: 'Purchase domain', completed: false },
  { id: 5, title: 'Support SEO', completed: false },
];

const randomDelay = () => Math.floor(Math.random() * 1000) + 200;

mock.onGet('/tasks').reply(() => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([200, tasks]);
    }, randomDelay());
  });
});

mock.onPost('/tasks').reply((config) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newTask = JSON.parse(config.data);
      newTask.id = Date.now();
      tasks.push(newTask);
      resolve([201, newTask]);
    }, randomDelay());
  });
});

export default axios;