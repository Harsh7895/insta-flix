import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Header from "./components/Header";
import Bookmark from "./pages/Bookmark";

function App() {
  return (
    <Router>
      <div>
        <Toaster position="bottom" />
      </div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bookmarks" element={<Bookmark />} />
      </Routes>
    </Router>
  );
}

export default App;
