import { useEffect, useState } from 'react';
import { authApi, taskApi } from '../api';
import { STATUS_DONE } from '../config';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate, isDueWithin } from '../utils/dates';
import { EMAIL_PATTERN, isStrongPassword, passwordChecks } from '../utils/validation';
import { BusyButton, ErrorBanner, FieldError } from '../components/ui';

export default function Profile() {
  const { user, setUser } = useAuth();
  const showToast = useToast();
  const [profile, setProfile] = useState(user);
  const [stats, setStats] = useState(null);
  const [account, setAccount] = useState({ username: user?.username || '', email: user?.email || '' });
  const [accountErrors, setAccountErrors] = useState({});
  const [accountError, setAccountError] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', next: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    authApi
      .profile()
      .then((p) => {
        if (!p) return;
        setProfile(p);
        setAccount({ username: p.username, email: p.email });
      })
      .catch(() => {}); // fall back to the user loaded at login
    taskApi
      .list()
      .then((tasks) =>
        setStats({
          total: tasks.length,
          done: tasks.filter((t) => t.status === STATUS_DONE).length,
          dueSoon: tasks.filter((t) => t.status !== STATUS_DONE && isDueWithin(t.dueDate, 7)).length,
        }),
      )
      .catch(() => setStats(null));
  }, []);

  const saveAccount = async (event) => {
    event.preventDefault();
    const found = {};
    if (account.username.trim().length < 3) found.username = 'Use at least 3 characters.';
    if (!EMAIL_PATTERN.test(account.email.trim())) found.email = 'Enter a full email address, like name@example.com.';
    setAccountErrors(found);
    setAccountError('');
    if (Object.keys(found).length) return;
    setSavingAccount(true);
    try {
      const updated = await authApi.updateProfile({ username: account.username.trim(), email: account.email.trim() });
      const next = {
        ...profile,
        ...(updated?.id !== undefined ? updated : {}),
        username: account.username.trim(),
        email: account.email.trim(),
      };
      setProfile(next);
      setUser((u) => ({ ...u, username: next.username, email: next.email }));
      showToast('Profile saved');
    } catch (err) {
      setAccountErrors(err.fields || {});
      setAccountError(err.message);
    } finally {
      setSavingAccount(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    const found = {};
    if (!passwords.current) found.current = 'Enter your current password.';
    if (!isStrongPassword(passwords.next)) found.next = 'Your new password needs to meet every rule below.';
    setPasswordErrors(found);
    setPasswordError('');
    if (Object.keys(found).length) return;
    setSavingPassword(true);
    try {
      await authApi.changePassword(passwords.current, passwords.next);
      setPasswords({ current: '', next: '' });
      showToast('Password updated');
    } catch (err) {
      const fields = err.fields || {};
      setPasswordErrors({ current: fields.currentPassword, next: fields.newPassword });
      setPasswordError(err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const initial = (profile?.username || '?').charAt(0).toUpperCase();

  return (
    <div className="page__inner page__inner--narrow">
      <section className="card profile-head" aria-label="Account">
        <span className="avatar avatar--large" aria-hidden="true">
          {initial}
        </span>
        <div className="profile-head__info">
          <div className="profile-head__name">
            <h1 className="page-title">{profile?.username}</h1>
            <span className={`badge ${profile?.role === 'admin' ? 'badge--admin' : 'badge--neutral'}`}>
              {profile?.role === 'admin' ? 'Admin' : 'User'}
            </span>
          </div>
          <span className="muted">
            {profile?.email}
            {profile?.createdAt && `, member since ${formatDate(profile.createdAt, { year: true })}`}
          </span>
        </div>
        {stats && (
          <dl className="profile-stats">
            <div>
              <dt>Tasks</dt>
              <dd>{stats.total}</dd>
            </div>
            <div>
              <dt>Done</dt>
              <dd className="text-done">{stats.done}</dd>
            </div>
            <div>
              <dt>Due soon</dt>
              <dd className="text-due">{stats.dueSoon}</dd>
            </div>
          </dl>
        )}
      </section>

      <div className="two-up">
        <form className="card form-card" onSubmit={saveAccount} noValidate>
          <h2 className="section-title">Account details</h2>
          <ErrorBanner message={accountError} />
          <div className="field">
            <label htmlFor="p-username" className="field__label">
              Username
            </label>
            <input
              id="p-username"
              className="input"
              value={account.username}
              autoComplete="username"
              onChange={(e) => setAccount((a) => ({ ...a, username: e.target.value }))}
              aria-invalid={Boolean(accountErrors.username)}
              aria-describedby={accountErrors.username ? 'p-username-error' : undefined}
            />
            <FieldError id="p-username-error" message={accountErrors.username} />
          </div>
          <div className="field">
            <label htmlFor="p-email" className="field__label">
              Email
            </label>
            <input
              id="p-email"
              type="email"
              className="input"
              value={account.email}
              autoComplete="email"
              onChange={(e) => setAccount((a) => ({ ...a, email: e.target.value }))}
              aria-invalid={Boolean(accountErrors.email)}
              aria-describedby={accountErrors.email ? 'p-email-error' : undefined}
            />
            <FieldError id="p-email-error" message={accountErrors.email} />
          </div>
          <div>
            <BusyButton type="submit" busy={savingAccount} busyLabel="Saving">
              Save changes
            </BusyButton>
          </div>
        </form>

        <form className="card form-card" onSubmit={savePassword} noValidate>
          <h2 className="section-title">Change password</h2>
          <ErrorBanner message={passwordError} />
          <div className="field">
            <label htmlFor="p-current" className="field__label">
              Current password
            </label>
            <input
              id="p-current"
              type="password"
              className="input"
              value={passwords.current}
              autoComplete="current-password"
              onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
              aria-invalid={Boolean(passwordErrors.current)}
              aria-describedby={passwordErrors.current ? 'p-current-error' : undefined}
            />
            <FieldError id="p-current-error" message={passwordErrors.current} />
          </div>
          <div className="field">
            <label htmlFor="p-new" className="field__label">
              New password
            </label>
            <input
              id="p-new"
              type="password"
              className="input"
              value={passwords.next}
              autoComplete="new-password"
              onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
              aria-invalid={Boolean(passwordErrors.next)}
              aria-describedby="p-new-rules"
            />
            <ul id="p-new-rules" className="rules">
              {passwordChecks(passwords.next).map((c) => (
                <li key={c.text} className={c.ok ? 'rules__item rules__item--ok' : 'rules__item'}>
                  <span aria-hidden="true">{c.ok ? '✓' : '•'}</span>
                  {c.text}
                </li>
              ))}
            </ul>
            <FieldError id="p-new-error" message={passwordErrors.next} />
          </div>
          <div>
            <BusyButton type="submit" busy={savingPassword} busyLabel="Updating" className="btn btn--secondary">
              Update password
            </BusyButton>
          </div>
        </form>
      </div>
    </div>
  );
}
