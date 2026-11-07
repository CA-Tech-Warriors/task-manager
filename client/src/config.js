// Values the API stores for status and priority.
// If the backend Task model uses different strings, change `value` here
// and the whole app follows. Labels are what people see.
export const STATUSES = [
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

export const PRIORITIES = [
  { value: 'low', label: 'Low', hint: 'Nice to have, no rush' },
  { value: 'medium', label: 'Medium', hint: 'Should get done soon' },
  { value: 'high', label: 'High', hint: 'Urgent or blocking' },
];

export const STATUS_TODO = STATUSES[0].value;
export const STATUS_DONE = STATUSES[STATUSES.length - 1].value;

export const TITLE_MAX = 100;
export const DESCRIPTION_MAX = 500;

export const statusLabel = (value) => STATUSES.find((s) => s.value === value)?.label ?? value;
export const priorityLabel = (value) => PRIORITIES.find((p) => p.value === value)?.label ?? value;
