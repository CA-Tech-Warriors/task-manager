import { Link } from 'react-router-dom';
import { PublicHeader } from '../components/Layouts';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { user } = useAuth();
  return (
    <div className="public">
      <PublicHeader />
      <main id="main" className="auth-page">
        <section className="card empty">
          <h1 className="empty__title">This page doesn't exist</h1>
          <p className="empty__text">Check the address, or head back to somewhere familiar.</p>
          <Link to={user ? '/dashboard' : '/'} className="btn btn--primary">
            {user ? 'Go to my tasks' : 'Go to the home page'}
          </Link>
        </section>
      </main>
    </div>
  );
}
