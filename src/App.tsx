import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log(count);
  }, []);

  return <div>Hello</div>;
}

export default App;
