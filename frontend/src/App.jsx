import React from "react";
import { Routes, Route } from "react-router-dom";
import TimerListPage from "./pages/TimerList";

const App = ({ shop }) => {
  return (
    <Routes>
      <Route path="/" element={<TimerListPage shop={shop} />} />
      <Route path="/app" element={<TimerListPage shop={shop} />} />
    </Routes>
  );
};

export default App;
