import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DownloadBulk from "./src/components/bulk";
import { Nav } from "./src/components/navbar";
import Home from "./src/components/home";
// import { howTo } from "./src/howto";

const Routers = () => {
  return (
    <Router>
        <Nav/>
      <Routes>
        <Route exact path={"/"} element={<Home />} />
        <Route exact path={"/bulk"} element={<DownloadBulk />} />
      </Routes>
    </Router>
  );
};

export default Routers;