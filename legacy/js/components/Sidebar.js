export class Sidebar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div style="margin-bottom: var(--space-xl);">
        <h1 style="font-size: 1.5rem; color: var(--color-primary); font-weight: bold;">Manager</h1>
      </div>
      <ul style="list-style: none;">
        <li>
          <a href="#" class="nav-link" data-path="dashboard">
            Dashboard
          </a>
        </li>
        <li>
          <a href="#members" class="nav-link" data-path="members">
            Members
          </a>
        </li>
        <li>
          <a href="#settings" class="nav-link" data-path="settings">
            Settings
          </a>
        </li>
      </ul>
    `;

    // Apply basic nav styles dynamically or they can be in index.css
    const links = this.container.querySelectorAll('.nav-link');
    links.forEach(link => {
      link.style.display = 'block';
      link.style.padding = '0.75rem 1rem';
      link.style.color = 'var(--color-text-main)';
      link.style.textDecoration = 'none';
      link.style.borderRadius = '0.375rem';
      link.style.marginBottom = '0.25rem';
      link.style.transition = 'background-color 0.2s';

      link.addEventListener('mouseenter', () => {
        link.style.backgroundColor = 'var(--color-primary-light)';
        link.style.color = 'var(--color-primary-dark)';
      });
      link.addEventListener('mouseleave', () => {
        if (!link.classList.contains('active')) {
          link.style.backgroundColor = 'transparent';
          link.style.color = 'var(--color-text-main)';
        }
      });
    });

    this.updateActiveState();
    window.addEventListener('hashchange', () => this.updateActiveState());
  }

  updateActiveState() {
    const hash = window.location.hash || '#';
    this.container.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === hash || (hash === '' && href === '#')) {
        link.style.backgroundColor = 'var(--color-primary)';
        link.style.color = 'white';
        link.classList.add('active');
        // Override hover for active
        link.onmouseenter = null;
        link.onmouseleave = null;
      } else {
        link.style.backgroundColor = 'transparent';
        link.style.color = 'var(--color-text-main)';
        link.classList.remove('active');
        // Restore hover listeners (simplified re-render might be better but this works for simple case)
      }
    });
  }
}
