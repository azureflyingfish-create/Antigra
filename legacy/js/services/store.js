export class Store extends EventTarget {
  constructor() {
    super();
    this.state = this._load();
    window.addEventListener('storage', (e) => {
      if (e.key === 'app_state') {
        this.state = JSON.parse(e.newValue);
        this._notify();
      }
    });
  }

  get members() { return this.state.members; }
  get projects() { return this.state.projects; }
  get assignments() { return this.state.assignments; }
  get titles() { return this.state.titles; }

  _load() {
    const data = localStorage.getItem('app_state');
    const defaults = {
      members: [],
      projects: [],
      assignments: [],
      titles: [
        { id: '1', name: 'PM' },
        { id: '2', name: 'Engineer' },
        { id: '3', name: 'Tester' }
      ]
    };
    return data ? { ...defaults, ...JSON.parse(data) } : defaults;
  }

  _save() {
    localStorage.setItem('app_state', JSON.stringify(this.state));
    this._notify();
  }

  _notify() {
    this.dispatchEvent(new CustomEvent('statechange', { detail: this.state }));
  }

  // --- Members ---
  addMember(name, titleId) {
    const id = crypto.randomUUID();
    this.state.members.push({ id, name, titleId, createdAt: new Date().toISOString() });
    this._save();
  }

  updateMember(id, updates) {
    const member = this.state.members.find(m => m.id === id);
    if (member) {
      Object.assign(member, updates);
      this._save();
    }
  }

  deleteMember(id) {
    this.state.members = this.state.members.filter(m => m.id !== id);
    // Cleanup assignments
    this.state.assignments = this.state.assignments.filter(a => a.memberId !== id);
    this._save();
  }

  // --- Projects ---
  addProject(name, startDate, endDate, description) {
    const id = crypto.randomUUID();
    this.state.projects.push({ id, name, startDate, endDate, description, createdAt: new Date().toISOString() });
    this._save();
  }

  updateProject(id, updates) {
    const project = this.state.projects.find(p => p.id === id);
    if (project) {
      Object.assign(project, updates);
      this._save();
    }
  }

  deleteProject(id) {
    this.state.projects = this.state.projects.filter(p => p.id !== id);
    this.state.assignments = this.state.assignments.filter(a => a.projectId !== id);
    this._save();
  }

  // --- Assignments ---
  assignMember(projectId, memberId, percentage, startDate, endDate) {
    // Check if assignment exists
    const existing = this.state.assignments.find(a => a.projectId === projectId && a.memberId === memberId);
    if (existing) {
      existing.percentage = percentage;
      existing.startDate = startDate;
      existing.endDate = endDate;
    } else {
      this.state.assignments.push({ projectId, memberId, percentage, startDate, endDate });
    }
    this._save();
  }

  removeAssignment(projectId, memberId) {
    this.state.assignments = this.state.assignments.filter(a => !(a.projectId === projectId && a.memberId === memberId));
    this._save();
  }

  // --- Helpers ---
  getProjectAssignments(projectId) {
    return this.state.assignments
      .filter(a => a.projectId === projectId)
      .map(a => {
        const member = this.state.members.find(m => m.id === a.memberId);
        return { ...a, memberName: member ? member.name : 'Unknown' };
      });
  }

  getMemberAssignments(memberId) {
    return this.state.assignments
      .filter(a => a.memberId === memberId)
      .map(a => {
        const project = this.state.projects.find(p => p.id === a.projectId);
        return { ...a, projectName: project ? project.name : 'Unknown' };
      });
  }

  // --- Titles ---
  addTitle(name) {
    const id = crypto.randomUUID();
    this.state.titles.push({ id, name });
    this._save();
  }

  deleteTitle(id) {
    this.state.titles = this.state.titles.filter(t => t.id !== id);
    // Optional: Reset members with this title to generic or null
    this._save();
  }
}

export const store = new Store();
