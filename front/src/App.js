import { NavLink, Route, Routes, BrowserRouter } from "react-router-dom";
import Login from "./views/Login";
import Register from "./views/Register";
import TetrisView from "./views/TetrisView";
import "./assets/css/globals.scss";
import Account from "./views/Account";
import Room from "./views/Room";
import Logout from "./component/Logout";

const App = () => {
  return (
    <div>
      <header>
        <title> Tetris </title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Tetris online" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.min.css"
        />
      </header>
      <div className="app-body">
        <BrowserRouter>
          <header className="header">
            <NavLink to={`/`} className="logo-link">
              <h1>The Tetris</h1>
            </NavLink>
          </header>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/Account" element={<Account />} />
            <Route path="/room" element={<Room />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/tetris" element={<TetrisView />} />
            <Route
              path="*"
              element={
                <main className="notFound">
                  <h1>404 NOT FOUND</h1>
                </main>
              }
            />
          </Routes>
          <div className="footer">
            <h2>Github - @MaximeSaliou72 - @ArthurDEV44 - @saif-eddine-miah</h2>
          </div>
        </BrowserRouter>
      </div>
    </div>
  );
};

export default App;
