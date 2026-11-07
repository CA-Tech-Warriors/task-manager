import { useNavigate } from 'react-router-dom';
import { taskApi } from '../api';
import { useToast } from '../context/ToastContext';
import { BackLink } from '../components/Layouts';
import TaskForm from '../components/TaskForm';

export default function CreateTask() {
  const navigate = useNavigate();
  const showToast = useToast();

  const handleCreate = async (task) => {
    await taskApi.create(task);
    showToast(`Task created: ${task.title.trim()}`);
    navigate('/dashboard');
  };

  return (
    <div className="page__inner page__inner--narrow">
      <BackLink to="/dashboard">Back to my tasks</BackLink>
      <div className="page-head page-head--stack">
        <h1 className="page-title">New task</h1>
        <p className="muted">Only the title is required. You can change everything later.</p>
      </div>
      <TaskForm submitLabel="Create task" busyLabel="Creating task" onSubmit={handleCreate} showPreview />
    </div>
  );
}
