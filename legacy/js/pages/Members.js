import { store } from '../services/store.js';
import { modal } from '../components/Modal.js';

export class Members {
  constructor(container) {
    this.container = container;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h2 style="font-size: 1.5rem;">Members List</h2>
        <button id="add-member-btn" class="btn btn-primary">+ Add Member</button>
      </div>

      <div class="card">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="text-align: left; border-bottom: 1px solid var(--color-border);">
              <th style="padding: 1rem;">Name</th>
              <th style="padding: 1rem;">Title</th>
              <th style="padding: 1rem;">Joined</th>
              <th style="padding: 1rem; text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody id="members-list">
            <!-- Members rendered here -->
          </tbody>
        </table>
      </div>
    `;

    this.renderList();
    this.attachEvents();
  }

  renderList() {
    const tbody = this.container.querySelector('#members-list');
    const members = store.members;
    const titles = store.titles;

    if (members.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="padding: 2rem; text-align: center; color: var(--color-text-muted);">No members found. Add one to get started.</td></tr>';
      return;
    }

    tbody.innerHTML = members.map(member => {
      const title = titles.find(t => t.id === member.titleId);
      return `
      <tr style="border-bottom: 1px solid var(--color-border);">
        <td style="padding: 1rem; font-weight: 500;">${member.name}</td>
        <td style="padding: 1rem; color: var(--color-text-muted);">
            <span style="background: var(--color-primary-light); color: var(--color-primary-dark); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem;">
                ${title ? title.name : 'No Title'}
            </span>
        </td>
        <td style="padding: 1rem; color: var(--color-text-muted);">${new Date(member.createdAt).toLocaleDateString()}</td>
        <td style="padding: 1rem; text-align: right;">
          <button class="edit-btn btn" style="color: var(--color-primary); margin-right: 0.5rem;" data-id="${member.id}">Edit</button>
          <button class="delete-btn btn" style="color: var(--color-danger);" data-id="${member.id}">Delete</button>
        </td>
      </tr>
    `}).join('');

    // Re-attach delete/edit listeners
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        // Native confirm is fine for delete, but we could make a Delete Modal if requested.
        // Keeping native for simple confirmations as requested was "Add/Edit Dialogs"
        if (confirm('Are you sure?')) {
          store.deleteMember(id);
          this.renderList();
        }
      });
    });

    tbody.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.openMemberModal(e.target.dataset.id);
      });
    });
  }

  attachEvents() {
    this.container.querySelector('#add-member-btn').addEventListener('click', () => {
      this.openMemberModal();
    });
  }

  openMemberModal(memberId = null) {
    const isEdit = !!memberId;
    const member = isEdit ? store.members.find(m => m.id === memberId) : null;
    const titles = store.titles;

    const titleOptions = titles.map(t => `<option value="${t.id}" ${member && member.titleId === t.id ? 'selected' : ''}>${t.name}</option>`).join('');

    const formHtml = `
        <h3 style="margin-bottom: 1.5rem;">${isEdit ? 'Edit Member' : 'Add New Member'}</h3>
        <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500;">Name</label>
            <input type="text" id="member-name" value="${member ? member.name : ''}" style="width: 100%; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 0.375rem;">
        </div>
        <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500;">Title</label>
            <select id="member-title" style="width: 100%; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 0.375rem;">
                <option value="">Select Title...</option>
                ${titleOptions}
            </select>
        </div>
      `;

    modal.show(formHtml, () => {
      const nameInput = document.getElementById('member-name');
      const titleInput = document.getElementById('member-title');

      if (!nameInput.value.trim()) {
        alert('Name is required');
        return false; // Prevent close
      }

      if (isEdit) {
        store.updateMember(memberId, {
          name: nameInput.value.trim(),
          titleId: titleInput.value
        });
      } else {
        store.addMember(nameInput.value.trim(), titleInput.value);
      }

      this.renderList();
      return true; // allow close
    });
  }
}
