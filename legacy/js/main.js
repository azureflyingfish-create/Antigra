import { Sidebar } from './components/Sidebar.js';
// Import Page Components (we will create these next)
// import { Dashboard } from './pages/Dashboard.js';
// import { Members } from './pages/Members.js';
// import { Projects } from './pages/Projects.js';

// Since we haven't created the files yet, we'll implement a simple dynamic importer or just placeholders for now.
// Actually, to avoid import errors, I will create empty placeholders first before this file? 
// No, I can write the router logic to load them dynamically if I want, or just standard imports.
// I will assume standard imports and create the files immediately after.

const routes = {
    '': 'Dashboard',
    '#': 'Dashboard',
    '#dashboard': 'Dashboard',
    '#members': 'Members',
    '#projects': 'Projects',
    '#settings': 'Settings'
};

class App {
    constructor() {
        this.sidebar = new Sidebar('sidebar');
        this.content = document.getElementById('page-content');
        this.header = document.getElementById('header');

        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute(); // Initial load
    }

    async handleRoute() {
        const hash = window.location.hash || '#';
        const pageName = routes[hash] || 'Dashboard';

        // Update Header
        this.header.innerHTML = `
      <h2 style="text-transform: capitalize;">${pageName}</h2>
      <div style="font-size: 0.875rem; color: var(--color-text-muted);">Home / ${pageName}</div>
    `;

        this.content.innerHTML = '<div style="padding: 2rem; text-align: center;">Loading...</div>';

        try {
            // Dynamic import to avoid circular complexities and cleaner loading
            const module = await import(`./pages/${pageName}.js`);
            const PageClass = module[pageName];
            if (PageClass) {
                this.content.innerHTML = ''; // Clear loading
                new PageClass(this.content);
            } else {
                this.content.innerHTML = 'Page not found component';
            }
        } catch (e) {
            console.error(e);
            this.content.innerHTML = `Error loading page: ${e.message}`;
        }
    }
}

new App();
