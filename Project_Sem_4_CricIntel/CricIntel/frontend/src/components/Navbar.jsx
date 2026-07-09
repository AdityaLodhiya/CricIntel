import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <Link to="/">CricIntel</Link>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/predict">Predict XI</Link></li>
        <li><Link to="/results">Results</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
