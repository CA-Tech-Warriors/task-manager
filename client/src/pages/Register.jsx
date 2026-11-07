import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicHeader } from '../components/Layouts';
import { BusyButton, ErrorBanner, FieldError } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EMAIL_PATTERN, isStrongPassword, passwordChecks } from '../utils/validation';

export default function Register() {
  const { register } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const checks = passwordChecks(form.password);

  const validate = () => {
    const found = {};
    const username = form.username.trim();
    if (!username) found.username = 'Choose a username.';
    else if (username.length < 3) found.username = 'Use at least 3 characters.';
    else if (!/^[A-Za-z0-9_.-]+$/.test(username)) found.username = 'Use letters, numbers, dots, dashes or underscores.';
    if (!form.email.trim()) found.email = 'Enter your email address.';
    else if (!EMAIL_PATTERN.test(form.email.trim())) found.email = 'Enter a full email address, like name@example.com.';
    if (!isStrongPassword(form.password)) found.password = 'Your password needs to meet every rule below.';
    if (form.confirm !== form.password) found.confirm = "The passwords don't match.";
    return found;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) {
      document.getElementById(`reg-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setBusy(true);
    try {
      await register({ username: form.username.trim(), email: form.email.trim(), password: form.password });
      showToast('Account created. Welcome!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrors(err.fields || {});
      setFormError(err.message);
      setBusy(false);
    }
  };

  const field = (name, label, props = {}) => (
    <div className="field">
      <label htmlFor={`reg-${name}`} className="field__label">
        {label}
      </label>
      <input
        id={`reg-${name}`}
        className="input"
        value={form[name]}
        onChange={set(name)}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `reg-${name}-error` : undefined}
        {...props}
      />
      <FieldError id={`reg-${name}-error`} message={errors[name]} />
    </div>
  );

  return (
    <div className="public">
      <PublicHeader />
      <main id="main" className="auth-page">
        <form className="card auth-card" onSubmit={handleSubmit} noValidate>
          <div className="auth-card__head">
            <h1 className="page-title">Create your account</h1>
            <p className="muted">It takes less than a minute.</p>
          </div>

          <ErrorBanner message={formError} />

          {field('username', 'Username', { autoComplete: 'username' })}
          {field('email', 'Email', { type: 'email', autoComplete: 'email' })}

          <div className="field">
            <label htmlFor="reg-password" className="field__label">
              Password
            </label>
            <input
              id="reg-password"
              className="input"
              type="password"
              value={form.password}
              onChange={set('password')}
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby="reg-password-rules"
            />
            <ul id="reg-password-rules" className="rules">
              {checks.map((c) => (
                <li key={c.text} className={c.ok ? 'rules__item rules__item--ok' : 'rules__item'}>
                  <span aria-hidden="true">{c.ok ? '✓' : '•'}</span>
                  {c.text}
                  <span className="visually-hidden">{c.ok ? ' (done)' : ' (not yet)'}</span>
                </li>
              ))}
            </ul>
            <FieldError id="reg-password-error" message={errors.password} />
          </div>

          {field('confirm', 'Confirm password', { type: 'password', autoComplete: 'new-password' })}

          <BusyButton
            type="submit"
            busy={busy}
            busyLabel="Creating your account"
            className="btn btn--primary btn--block btn--large"
          >
            Create account
          </BusyButton>

          <p className="auth-card__switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
