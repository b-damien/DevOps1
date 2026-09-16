import { StrictMode, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  CalendarDays,
  Check,
  ChevronDown,
  CirclePlus,
  ClipboardList,
  LayoutGrid,
  MoreHorizontal,
  Search,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import './styles.css';

const STORAGE_KEY = 'atelier-taches-v2';
const statuses = [
  { id: 'todo', label: 'À faire', color: 'yellow', note: 'À préparer' },
  { id: 'doing', label: 'En cours', color: 'blue', note: 'En mouvement' },
  { id: 'done', label: 'Terminées', color: 'green', note: 'Bien joué' },
];
const people = [
  { name: 'Tous', initials: 'TO', color: 'violet' },
  { name: 'Camille', initials: 'CL', color: 'coral' },
  { name: 'Thomas', initials: 'TD', color: 'blue' },
  { name: 'Nina', initials: 'NM', color: 'green' },
  { name: 'Léo', initials: 'LB', color: 'yellow' },
];
function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function Avatar({ name, size = 'small' }) {
  const person = people.find((item) => item.name === name) || people[0];
  return <span className={`avatar avatar-${person.color} avatar-${size}`} title={name}>{person.initials}</span>;
}

function TaskCard({ task, onDelete, onEdit, onDragStart }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <article className="task-card" draggable onDragStart={(event) => onDragStart(event, task)}>
      <div className="task-card-topline">
        <span className={`tag tag-${task.tagTone}`}>{task.tag}</span>
        <button className="icon-button subtle" type="button" aria-label={`Actions pour ${task.title}`} onClick={() => setIsMenuOpen((current) => !current)}>
          <MoreHorizontal size={17} />
        </button>
        {isMenuOpen && <div className="task-menu"><button type="button" onClick={() => { onEdit(task); setIsMenuOpen(false); }}>Modifier</button><button type="button" className="danger-action" onClick={() => onDelete(task.id)}>Supprimer</button></div>}
      </div>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <div className="task-card-footer">
        <div className="task-meta"><CalendarDays size={14} /><span>{task.due}</span></div>
        <div className="task-owner"><Avatar name={task.assignee} /><span>{task.assignee}</span></div>
      </div>
      <div className="priority-line"><span className={`priority-dot priority-${task.priority.toLowerCase()}`} />{task.priority}</div>
    </article>
  );
}

function Column({ status, tasks, onDrop, onDelete, onEdit, onDragStart, onAdd }) {
  return (
    <section className={`task-column column-${status.color}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => onDrop(event, status.id)}>
      <div className="column-heading">
        <div className="column-title"><span className={`status-mark status-${status.color}`} /><h2>{status.label}</h2><span className="task-count">{tasks.length}</span></div>
      </div>
      <p className="column-note">{status.note}</p>
      <div className="column-tasks">
        {tasks.map((task) => <TaskCard key={task.id} task={task} onDelete={onDelete} onEdit={onEdit} onDragStart={onDragStart} />)}
        {tasks.length === 0 && <div className="drop-placeholder">Déposer une tâche ici</div>}
      </div>
      <button className="add-column-task" type="button" onClick={() => onAdd(status.id)}><CirclePlus size={16} /> Ajouter une tâche</button>
    </section>
  );
}

function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [selectedPerson, setSelectedPerson] = useState('Tous');
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignee: 'Camille', status: 'todo', priority: 'Moyenne', tag: 'Produit', due: 'Demain' });
  const [draggedTask, setDraggedTask] = useState(null);

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)), [tasks]);

  const visibleTasks = useMemo(() => tasks.filter((task) => {
    const matchesPerson = selectedPerson === 'Tous' || task.assignee === selectedPerson;
    const normalizedQuery = query.toLowerCase();
    const matchesQuery = !normalizedQuery || `${task.title} ${task.description} ${task.tag}`.toLowerCase().includes(normalizedQuery);
    return matchesPerson && matchesQuery;
  }), [tasks, selectedPerson, query]);

  const completed = tasks.filter((task) => task.status === 'done').length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  function handleDrop(event, status) {
    event.preventDefault();
    if (draggedTask) setTasks((current) => current.map((task) => task.id === draggedTask.id ? { ...task, status } : task));
    setDraggedTask(null);
  }

  function handleDelete(id) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function handleCreate(event) {
    event.preventDefault();
    if (!newTask.title.trim()) return;
    const taskData = { ...newTask, description: newTask.description || 'Aucun détail ajouté.', tagTone: editingTask?.tagTone || 'violet' };
    setTasks((current) => editingTask
      ? current.map((task) => task.id === editingTask.id ? { ...task, ...taskData } : task)
      : [...current, { ...taskData, id: Date.now() }]);
    setNewTask({ title: '', description: '', assignee: 'Camille', status: 'todo', priority: 'Moyenne', tag: 'Produit', due: 'Demain' });
    setEditingTask(null);
    setIsModalOpen(false);
  }

  function openTaskModal(status = 'todo') {
    setEditingTask(null);
    setNewTask((current) => ({ ...current, status }));
    setIsModalOpen(true);
  }

  function openEditModal(task) {
    setEditingTask(task);
    setNewTask({ title: task.title, description: task.description, assignee: task.assignee, status: task.status, priority: task.priority, tag: task.tag, due: task.due });
    setIsModalOpen(true);
  }

  function closeTaskModal() {
    setEditingTask(null);
    setIsModalOpen(false);
  }

  function handleModalBackdrop(event) {
    if (event.target === event.currentTarget) closeTaskModal();
  }

  function handleModalCancel() {
    closeTaskModal();
  }

  function handleModalClose() {
    closeTaskModal();
  }

  function openNewTaskModal(status = 'todo') {
    setEditingTask(null);
    setNewTask((current) => ({ ...current, status }));
    setIsModalOpen(true);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Sparkles size={17} /></span><span>atelier</span></div>
        <div className="workspace-switcher"><span className="workspace-avatar">A</span><span><strong>Atelier studio</strong><small>Espace de travail</small></span></div>
        <nav className="main-nav" aria-label="Navigation principale">
          <a className="nav-item active" href="#taches"><LayoutGrid size={18} />Vue d’ensemble</a>
          <a className="nav-item" href="#taches"><ClipboardList size={18} />Mes tâches<span className="nav-badge">{tasks.length}</span></a>
        </nav>
      </aside>

      <main className="main-content" id="taches">
        <header className="topbar"><div className="breadcrumb"><strong>Mes tâches</strong></div></header>
        <div className="content-wrap">
          <section className="page-intro"><div><div className="eyebrow"><span className="eyebrow-line" />MERCREDI 16 SEPTEMBRE 2026</div><h1>Bonjour Nina <span className="wave">✦</span></h1><p>Voici ce qui se passe dans ton équipe aujourd’hui.</p></div><button className="primary-button" type="button" onClick={() => openTaskModal()}><CirclePlus size={18} />Nouvelle tâche</button></section>
          <section className="summary-strip"><div className="summary-main"><div className="summary-icon"><Check size={20} /></div><div><strong>{completed} tâche{completed > 1 ? 's' : ''} terminée{completed > 1 ? 's' : ''}</strong><span>{tasks.length ? 'Tu avances bien, continue comme ça.' : 'Crée ta première tâche pour commencer.'}</span></div></div><div className="progress-wrap"><div className="progress-label"><span>Progression de l’espace</span><strong>{progress}%</strong></div><div className="progress-bar"><span style={{ width: `${progress}%` }} /></div></div><div className="summary-stat"><span>À faire cette semaine</span><strong>{tasks.length - completed}<small> tâche{tasks.length - completed > 1 ? 's' : ''}</small></strong></div></section>
          <section className="toolbar"><div className="toolbar-actions"><div className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une tâche..." /></div><div className="filter-select"><UserRound size={16} /><select value={selectedPerson} onChange={(event) => setSelectedPerson(event.target.value)} aria-label="Filtrer par personne">{people.map((person) => <option key={person.name}>{person.name}</option>)}</select><ChevronDown size={14} /></div></div></section>
          <div className="board-header"><div><h2>Les tâches de l’équipe</h2><span>{visibleTasks.length} tâche{visibleTasks.length > 1 ? 's' : ''} au total</span></div></div>
          <div className="board">{statuses.map((status) => <Column key={status.id} status={status} tasks={visibleTasks.filter((task) => task.status === status.id)} onDrop={handleDrop} onDelete={handleDelete} onEdit={openEditModal} onDragStart={(_, task) => setDraggedTask(task)} onAdd={openNewTaskModal} />)}</div>
        </div>
      </main>
      {isModalOpen && <div className="modal-backdrop" onMouseDown={handleModalBackdrop}><form className="modal" onSubmit={handleCreate} onMouseDown={(event) => event.stopPropagation()}><div className="modal-header"><div><span className="eyebrow">{editingTask ? 'MODIFIER LA TÂCHE' : 'NOUVELLE TÂCHE'}</span><h2>{editingTask ? 'Modifier la tâche' : 'Ajouter une tâche'}</h2></div><button className="icon-button" type="button" aria-label="Fermer" onClick={handleModalClose}><X size={18} /></button></div><label>Titre<input autoFocus required value={newTask.title} onChange={(event) => setNewTask({ ...newTask, title: event.target.value })} placeholder="Ex. Préparer le brief" /></label><label>Description<textarea value={newTask.description} onChange={(event) => setNewTask({ ...newTask, description: event.target.value })} placeholder="Un peu de contexte..." rows="3" /></label><div className="form-grid"><label>Assignée à<select value={newTask.assignee} onChange={(event) => setNewTask({ ...newTask, assignee: event.target.value })}>{people.slice(1).map((person) => <option key={person.name}>{person.name}</option>)}</select></label><label>Statut<select value={newTask.status} onChange={(event) => setNewTask({ ...newTask, status: event.target.value })}>{statuses.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}</select></label><label>Priorité<select value={newTask.priority} onChange={(event) => setNewTask({ ...newTask, priority: event.target.value })}><option>Haute</option><option>Moyenne</option><option>Basse</option></select></label><label>Échéance<select value={newTask.due} onChange={(event) => setNewTask({ ...newTask, due: event.target.value })}><option>Aujourd’hui</option><option>Demain</option><option>Cette semaine</option></select></label></div><div className="modal-actions"><button className="secondary-button" type="button" onClick={handleModalCancel}>Annuler</button><button className="primary-button" type="submit"><CirclePlus size={17} />{editingTask ? 'Enregistrer' : 'Créer la tâche'}</button></div></form></div>}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
