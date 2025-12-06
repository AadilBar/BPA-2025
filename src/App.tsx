import Home from './pages/home'
import { Route, Routes, HashRouter } from 'react-router-dom'; 
import './index.css'

function App() {
  return (
    <Routes>
          <Route path="/" element={<Home />} />
      </Routes>
  )
}

export default function AppWrapper() {
  return (
    <HashRouter>
      <App />
    </HashRouter>
  );
}
