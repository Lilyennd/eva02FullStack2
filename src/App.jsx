import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Blogs from './views/blogs'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Blogs />} />
        <Route path="/blogs" element={<Blogs />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App