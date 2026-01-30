import { store } from '../services/store.js';
import { modal } from '../components/Modal.js';

export class Projects {
    constructor(container) {
        this.container = container;
        this.render();
    }

    render() {
        this.container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h2 style="font-size: 1.5rem;">Projects List</h2>
        <button id="add-project-btn" class="btn btn-primary">+ Add Project</button>
      </div>

      <div class="card">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="text-align: left; border-bottom: 1px solid var(--color-border);">
              <th style="padding: 1rem;">Project Name</th>
              <th style="padding: 1rem;">Timeline</th>
              <th style="padding: 1rem;">Assignments</th>
              <th style="padding: 1rem; text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody id="projects-list">
            <!-- Projects rendered here -->
          </tbody>
        </table>
      </div>
    `;

        this.renderList();
        this.attachEvents();
    }

    renderList() {
        const tbody = this.container.querySelector('#projects-list');
        const projects = store.projects;

        if (projects.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="padding: 2rem; text-align: center; color: var(--color-text-muted);">No projects found. Create one using the button above.</td></tr>';
            return;
        }

        tbody.innerHTML = projects.map(p => {
            const assignments = store.getProjectAssignments(p.id);
            const assignmentText = assignments.length > 0
                ? assignments.map(a => `${a.memberName} (${a.percentage}%)`).join(', ')
                : '<span style="color: var(--color-text-muted);">Unassigned</span>';

            const startDate = p.startDate ? new Date(p.startDate).toLocaleDateString() : 'TBD';
            const endDate = p.endDate ? new Date(p.endDate).toLocaleDateString() : 'TBD';

            return `
      <tr style="border-bottom: 1px solid var(--color-border);">
        <td style="padding: 1rem; font-weight: 500;">
            <div>${p.name}</div>
            ${p.description ? `<div style="font-size: 0.8rem; color: var(--color-text-muted); margin-top: 0.25rem;">${p.description}</div>` : ''}
        </td>
        <td style="padding: 1rem; font-size: 0.9rem; color: var(--color-text-muted);">
            ${startDate} - ${endDate}
        </td>
        <td style="padding: 1rem;">${assignmentText}</td>
        <td style="padding: 1rem; text-align: right;">
          <button class="edit-btn btn" style="margin-right:0.5rem; color: var(--color-text-muted);" data-id="${p.id}">Edit</button>
          <button class="assign-btn btn" style="margin-right:0.5rem; color: var(--color-primary);" data-id="${p.id}">Assign</button>
          <button class="delete-btn btn" style="color: var(--color-danger);" data-id="${p.id}">Delete</button>
        </td>
      </tr>
    `}).join('');

        // Attach listeners
        tbody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (confirm('Delete this project?')) {
                    store.deleteProject(e.target.dataset.id);
                    this.renderList();
                }
            });
        });

        tbody.querySelectorAll('.assign-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.openAssignmentModal(e.target.dataset.id);
            });
        });

        // Edit Project
        tbody.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.openProjectModal(e.target.dataset.id);
            });
        });
    }

    attachEvents() {
        const addBtn = this.container.querySelector('#add-project-btn');
        addBtn.addEventListener('click', () => {
            this.openProjectModal();
        });
    }

    openProjectModal(projectId = null) {
        const isEdit = !!projectId;
        const project = isEdit ? store.projects.find(p => p.id === projectId) : null;

        const formHtml = `
        <h3 style="margin-bottom: 1.5rem;">${isEdit ? 'Edit Project' : 'Add New Project'}</h3>
        <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500;">Project Name</label>
            <input type="text" id="project-name" value="${project ? project.name : ''}" style="width: 100%; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 0.375rem;">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500;">Start Date</label>
                <input type="date" id="project-start" value="${project && project.startDate ? project.startDate : ''}" style="width: 100%; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 0.375rem;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500;">End Date</label>
                <input type="date" id="project-end" value="${project && project.endDate ? project.endDate : ''}" style="width: 100%; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 0.375rem;">
            </div>
        </div>
        <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500;">Description</label>
            <textarea id="project-desc" rows="3" style="width: 100%; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 0.375rem;">${project && project.description ? project.description : ''}</textarea>
        </div>
      `;

        modal.show(formHtml, () => {
            const name = document.getElementById('project-name').value;
            const start = document.getElementById('project-start').value;
            const end = document.getElementById('project-end').value;
            const desc = document.getElementById('project-desc').value;

            if (!name.trim()) {
                alert('Project Name is required');
                return false;
            }

            if (isEdit) {
                store.updateProject(projectId, {
                    name: name.trim(),
                    startDate: start,
                    endDate: end,
                    description: desc
                });
            } else {
                store.addProject(name.trim(), start, end, desc);
            }

            this.renderList();
            return true;
        });
    }

    openAssignmentModal(projectId) {
        const members = store.members;
        if (members.length === 0) {
            alert('No members to assign. Please add members first.');
            return;
        }

        // Create assignment modal
        const memberOptions = members.map(m => `<option value="${m.id}">${m.name}</option>`).join('');

        const formHtml = `
        <h3 style="margin-bottom: 1.5rem;">Assign Member</h3>
        <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500;">Member</label>
            <select id="assign-member" style="width: 100%; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 0.375rem;">
                ${memberOptions}
            </select>
        </div>
        <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500;">Allocation %</label>
            <input type="number" id="assign-percent" value="100" min="0" max="100" style="width: 100%; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 0.375rem;">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500;">Start Date</label>
                <input type="date" id="assign-start" style="width: 100%; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 0.375rem;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500;">End Date</label>
                <input type="date" id="assign-end" style="width: 100%; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 0.375rem;">
            </div>
        </div>
      `;

        modal.show(formHtml, () => {
            const memberId = document.getElementById('assign-member').value;
            const percent = document.getElementById('assign-percent').value;
            const start = document.getElementById('assign-start').value;
            const end = document.getElementById('assign-end').value;

            store.assignMember(projectId, memberId, parseInt(percent) || 0, start, end);
            this.renderList();
            return true;
        });
    }
}
