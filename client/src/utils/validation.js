import { DESCRIPTION_MAX, TITLE_MAX } from '../config';

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function passwordChecks(password) {
  return [
    { ok: password.length >= 8, text: 'At least 8 characters' },
    { ok: /[A-Za-z]/.test(password), text: 'Includes a letter' },
    { ok: /\d/.test(password), text: 'Includes a number' },
  ];
}

export const isStrongPassword = (password) => passwordChecks(password).every((c) => c.ok);

export function validateTask(task) {
  const errors = {};
  const title = task.title.trim();
  if (!title) errors.title = 'Give your task a title.';
  else if (title.length > TITLE_MAX) errors.title = `Keep the title to ${TITLE_MAX} characters or fewer.`;
  if ((task.description || '').length > DESCRIPTION_MAX) {
    errors.description = `Keep the description to ${DESCRIPTION_MAX} characters or fewer.`;
  }
  return errors;
}
