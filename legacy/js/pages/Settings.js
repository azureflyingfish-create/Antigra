import { store } from '../services/store.js';

export class Settings {
    constructor(container) {
        this.container = container;
        this.render();
    }

    render() {
        this.container.innerHTML = `
      <div style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.5rem;">Settings</h2>
      </div>

      <div class="card" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
           <h3>Member Titles</h3>
           <button id="add-title-btn" class="btn btn-primary" style="font-size: 0.875rem;">+ Add Title</button>
        </div>
        <p style="color: var(--color-text-muted); margin-bottom: 1rem;">Manage the job titles available for members (e.g., PM, Engineer, Tester).</p>
        
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="text-align: left; border-bottom: 1px solid var(--color-border);">
              <th style="padding: 0.75rem;">Title Name</th>
              <th style="padding: 0.75rem; text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody id="titles-list">
            <!-- Titles rendered here -->
          </tbody>
        </table>
      </div>
    `;

        this.renderList();
        this.attachEvents();
    }

    renderList() {
        const tbody = this.container.querySelector('#titles-list');
        const titles = store.titles;

        if (titles.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" style="padding: 1rem; text-align: center;">No titles defined.</td></tr>';
            return;
        }

        tbody.innerHTML = titles.map(t => `
      <tr style="border-bottom: 1px solid var(--color-border);">
        <td style="padding: 0.75rem;">${t.name}</td>
        <td style="padding: 0.75rem; text-align: right;">
          <button class="delete-btn btn" style="padding: 0.25rem 0.5rem; font-size: 0.875rem; color: var(--color-danger);" data-id="${t.id}">Delete</button>
        </td>
      </tr>
    `).join('');

        tbody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (confirm('Delete this title? This does not remove users but will hide their title.')) {
                    store.deleteTitle(e.target.dataset.id);
                    this.renderList();
                }
            });
        });
    }

    attachEvents() {
        this.container.querySelector('#add-title-btn').addEventListener('click', () => {
            const name = prompt("Enter new title name:");
            if (name && name.trim()) {
                store.addTitle(name.trim());
                this.renderList();
            }
        });
    }
}
