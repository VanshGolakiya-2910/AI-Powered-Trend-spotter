import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./Page/Dashboard/Dashboard";
import Explore from "./Page/Explore/Explore";
import Home from "./Page/Home/Home";       

function App() {
  return (
  
      <div className="">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/trends" element={<Dashboard />} />
        </Routes>
      </div>
  );
}

export default App;
