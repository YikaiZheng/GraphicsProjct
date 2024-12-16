import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Menu from './menu';
import Level1 from './level1';
import Level2 from './level2';

const App = () => {
  return (
        <Routes>
          <Route path="/" element={Menu()} />
          <Route path="/level1" element={Level1()} />
          <Route path="/level2" element={Level2()}/>
        </Routes>
  );
};

export default App;