import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Header from "./components/Header";
import Bookmark from "./pages/Bookmark";
import YourStories from "./pages/YourStories";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <div>
        <Toaster position="bottom" />
      </div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Home />} />
        <Route element={<PrivateRoute />}>
          <Route path="/bookmarks" element={<Bookmark />} />
          <Route path="/your-stories" element={<YourStories />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
