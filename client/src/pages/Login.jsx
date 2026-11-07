import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PublicHeader } from '../components/Layouts';
import { BusyButton, ErrorBanner, FieldError } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = {};
    if (!identifier.trim()) found.identifier = 'Enter your username or email.';
    if (!password) found.password = 'Enter your password.';
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      await login(identifier.trim(), password, remember);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setFormError(
        err.status === 401 || err.status === 400
          ? "That username and password don't match. Check them and try again."
          : err.message,
      );
      setBusy(false);
    }
  };

  return (
    <div className="public">
      <PublicHeader />
      <main id="main" className="auth-page">
        <form className="card auth-card" onSubmit={handleSubmit} noValidate>
          <div className="auth-card__head">
            <h1 className="page-title">Welcome back</h1>
            <p className="muted">Log in to see your tasks.</p>
          </div>

          <ErrorBanner message={formError} />

          <div className="field">
            <label htmlFor="identifier" className="field__label">
              Username or email
            </label>
            <input
              id="identifier"
              className="input"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              aria-invalid={Boolean(errors.identifier)}
              aria-describedby={errors.identifier ? 'identifier-error' : undefined}
            />
            <FieldError id="identifier-error" message={errors.identifier} />
          </div>

          <div className="field">
            <label htmlFor="password" className="field__label">
              Password
            </label>
            <div className="input-group">
              <input
                id="password"
                className="input input-group__input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                className="input-group__action"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <FieldError id="password-error" message={errors.password} />
          </div>

          <label className="checkbox-row">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Keep me logged in
          </label>

          <BusyButton
            type="submit"
            busy={busy}
            busyLabel="Logging in"
            className="btn btn--primary btn--block btn--large"
          >
            Log in
          </BusyButton>

          <p className="auth-card__switch">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
