import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
import "../src/css/main.css"
import "../src/css/components.css"
import "../src/css/buttons.css"

import { HashRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Index from "../src/pages/index"

function App() {

  return (
    <HashRouter>
      <AnimatePresence mode="wait">
        {/* <Layout> */}
          <Routes>
            <Route path="/" element={<Index />} />
          </Routes>
        {/* </Layout> */}
      </AnimatePresence>
    </HashRouter>
  )
}

export default App
