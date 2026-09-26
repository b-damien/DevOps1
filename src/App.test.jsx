import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach } from 'vitest';

import { App } from './main';
import { STORAGE_KEY, filterTasks } from './taskUtils';

const seedTasks = [
  {
    id: 1,
    title: 'Réunion produit',
    description: 'Valider le plan de la prochaine demo',
    assignee: 'Camille',
    status: 'todo',
    priority: 'Haute',
    tag: 'Produit',
    due: 'Demain',
    tagTone: 'violet',
  },
  {
    id: 2,
    title: 'Préparer le brief',
    description: 'Rédiger les messages clés pour le lancement',
    assignee: 'Thomas',
    status: 'doing',
    priority: 'Moyenne',
    tag: 'Marketing',
    due: 'Cette semaine',
    tagTone: 'blue',
  },
  {
    id: 3,
    title: 'Valider le QA',
    description: 'Vérifier les retours utilisateurs',
    assignee: 'Camille',
    status: 'done',
    priority: 'Basse',
    tag: 'QA',
    due: 'Aujourd’hui',
    tagTone: 'green',
  },
];

describe('taskUtils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('charge les tâches sauvées en localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedTasks));

    const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY));

    expect(tasks).toHaveLength(3);
    expect(tasks[0].title).toBe('Réunion produit');
  });

  it('filtre les tâches par personne et par mot-clé', () => {
    const filtered = filterTasks(seedTasks, { selectedPerson: 'Camille', query: 'produit' });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe('Réunion produit');
  });
});

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('affiche les tâches déjà enregistrées dans le tableau', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedTasks));

    render(<App />);

    expect(screen.getByText('Réunion produit')).toBeInTheDocument();
    expect(screen.getByText('Valider le QA')).toBeInTheDocument();
    expect(screen.getByText('Les tâches de l’équipe')).toBeInTheDocument();
  });

  it('crée une tâche depuis le modal et l’ajoute au tableau', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: /nouvelle tâche/i }));

    await user.type(screen.getByLabelText(/Titre/i), 'Tâche de recette');
    await user.type(screen.getByLabelText(/Description/i), 'Tester la dernière version sur staging');
    await user.selectOptions(screen.getByLabelText(/Assignée à/i), 'Thomas');
    await user.selectOptions(screen.getByLabelText(/Statut/i), 'doing');
    await user.selectOptions(screen.getByLabelText(/Priorité/i), 'Haute');
    await user.selectOptions(screen.getByLabelText(/Échéance/i), 'Cette semaine');

    await user.click(screen.getByRole('button', { name: /créer la tâche/i }));

    expect(screen.getByText('Tâche de recette')).toBeInTheDocument();
    expect(screen.getByText('Tester la dernière version sur staging')).toBeInTheDocument();
  });

  it('filtre les tâches selon la recherche et la personne sélectionnée', async () => {
    const user = userEvent.setup();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedTasks));

    render(<App />);

    const search = screen.getByPlaceholderText(/rechercher une tâche/i);
    await user.type(search, 'produit');

    expect(screen.getByText('Réunion produit')).toBeInTheDocument();
    expect(screen.queryByText('Préparer le brief')).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/filtrer par personne/i), 'Camille');
    expect(screen.getByText('Réunion produit')).toBeInTheDocument();
    expect(screen.queryByText('Valider le QA')).not.toBeInTheDocument();
  });
});
