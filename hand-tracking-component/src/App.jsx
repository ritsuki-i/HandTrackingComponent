import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import HandTrackingTest from './HandTrackingTest';
import HandTrackingDemo from './HandTrackingDemo';
import UsagePage from './UsagePage';


function App() {
  return (
    <Router>
      <Main />
      <Routes>
        <Route path="/test" element={<HandTrackingTest />} />
        <Route path="/demo" element={<HandTrackingDemo />} />
        <Route path="/usage" element={<UsagePage />} />
      </Routes>
    </Router>
  );
}

function Main() {
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate('/test')}>testモード</button>
      <button onClick={() => navigate('/demo')}>デモモード</button>
      <button onClick={() => navigate('/usage')}>使い方</button>
    </div>
  );
}

export default App;
