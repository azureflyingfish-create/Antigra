import { store } from '../services/store.js';

export class Dashboard {
  constructor(container) {
    this.container = container;
    this.render();
  }

  render() {
    const memberCount = store.members.length;
    const projectCount = store.projects.length;
    const assignments = store.assignments;

    this.container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        <div class="card">
          <h3>Total Members</h3>
          <p style="font-size: 2rem; font-weight: bold; color: var(--color-primary);">${memberCount}</p>
        </div>
        <div class="card">
          <h3>Total Projects</h3>
          <p style="font-size: 2rem; font-weight: bold; color: var(--color-success);">${projectCount}</p>
        </div>
        <div class="card">
          <h3>Assignments</h3>
          <p style="font-size: 2rem; font-weight: bold; color: var(--color-warning);">${assignments.length}</p>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr; gap: 2rem;">
          <div class="card">
            <h3 style="margin-bottom: 1rem;">Project Timeline (Members)</h3>
            <div id="project-timeline-chart" style="overflow-x: auto; min-height: 200px;">
                <!-- Project Timeline Rendered Data -->
            </div>
          </div>

          <div class="card">
            <h3 style="margin-bottom: 1rem;">Member Timeline (Assignments)</h3>
            <div id="member-timeline-chart" style="overflow-x: auto; min-height: 200px;">
                <!-- Member Timeline Rendered Data -->
            </div>
          </div>
      </div>
    `;

    this.renderProjectTimeline();
    this.renderMemberTimeline();
  }

  // Simple visualizer assuming 2024-2025 range for MVP visualization
  // A real production app would need a robust date scale logic
  renderProjectTimeline() {
    const container = this.container.querySelector('#project-timeline-chart');
    const projects = store.projects;

    if (projects.length === 0) {
      container.innerHTML = 'No projects data.';
      return;
    }

    // Basic Gantt Logic
    // Render list of projects, and bars for members assigned
    let html = '<div style="display: flex; flex-direction: column; gap: 1rem;">';

    projects.forEach(p => {
      const assignments = store.getProjectAssignments(p.id);
      if (assignments.length === 0) return;

      html += `
            <div style="border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">
                <div style="font-weight: bold; margin-bottom: 0.5rem;">${p.name}</div>
                <div style="position: relative; height: ${assignments.length * 30}px; background: #f1f5f9; border-radius: 4px;">
                    ${this._renderBars(assignments, 'memberName')}
                </div>
            </div>
         `;
    });
    html += '</div>';
    container.innerHTML = html;
  }

  renderMemberTimeline() {
    const container = this.container.querySelector('#member-timeline-chart');
    const members = store.members;

    if (members.length === 0) {
      container.innerHTML = 'No members data.';
      return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 1rem;">';

    members.forEach(m => {
      const assignments = store.getMemberAssignments(m.id);
      if (assignments.length === 0) return;

      html += `
            <div style="border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">
                <div style="font-weight: bold; margin-bottom: 0.5rem;">${m.name}</div>
                <div style="position: relative; height: ${assignments.length * 30}px; background: #f1f5f9; border-radius: 4px;">
                    ${this._renderBars(assignments, 'projectName')}
                </div>
            </div>
         `;
    });
    html += '</div>';
    container.innerHTML = html;
  }

  _renderBars(assignments, labelField) {
    // Scale: Fixed range for demo (Last 3 months to Next 9 months) or just full year 2024
    // Let's implement dynamic scaling based on min/max of current data or fixed window
    // For MVP simplicity: Fixed width representing Jan 2024 - Dec 2024
    const startYear = new Date('2024-01-01').getTime();
    const endYear = new Date('2024-12-31').getTime();
    const totalDuration = endYear - startYear;

    return assignments.map((a, i) => {
      const start = a.startDate ? new Date(a.startDate).getTime() : startYear;
      const end = a.endDate ? new Date(a.endDate).getTime() : endYear;

      // Clamp
      const clampedStart = Math.max(start, startYear);
      const clampedEnd = Math.min(end, endYear);

      if (clampedEnd < clampedStart) return '';

      const left = ((clampedStart - startYear) / totalDuration) * 100;
      const width = ((clampedEnd - clampedStart) / totalDuration) * 100;

      return `
            <div style="
                position: absolute; 
                left: ${left}%; 
                width: ${width}%; 
                top: ${i * 30 + 5}px; 
                height: 20px; 
                background: var(--color-primary); 
                opacity: 0.8;
                border-radius: 3px; 
                color: white; 
                font-size: 0.75rem; 
                display: flex; 
                align-items: center; 
                padding: 0 0.5rem; 
                white-space: nowrap; 
                overflow: hidden;">
                ${a[labelField]} (${a.percentage}%)
            </div>
          `;
    }).join('');
  }
}
