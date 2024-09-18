import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Header from "./components/Header";

function App() {
  return (
    <Router>
      <div>
        <Toaster />
      </div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
