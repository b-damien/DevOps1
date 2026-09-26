export const STORAGE_KEY = 'atelier-taches-v2';

export function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function filterTasks(tasks, { selectedPerson = 'Tous', query = '' } = {}) {
  return tasks.filter((task) => {
    const matchesPerson = selectedPerson === 'Tous' || task.assignee === selectedPerson;
    const normalizedQuery = query.toLowerCase();
    const matchesQuery = !normalizedQuery || `${task.title} ${task.description} ${task.tag}`.toLowerCase().includes(normalizedQuery);
    return matchesPerson && matchesQuery;
  });
}

export function getProgress(tasks) {
  const completed = tasks.filter((task) => task.status === 'done').length;
  return tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
}

export function getFormattedDate(date = new Date()) {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date).toUpperCase();
}
