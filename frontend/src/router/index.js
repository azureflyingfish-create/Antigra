import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Members from '../views/Members.vue'
import Projects from '../views/Projects.vue'
import Settings from '../views/Settings.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'dashboard',
            component: Dashboard
        },
        {
            path: '/members',
            name: 'members',
            component: Members
        },
        {
            path: '/projects',
            name: 'projects',
            component: Projects
        },
        {
            path: '/settings',
            name: 'settings',
            component: Settings
        }
    ]
})

export default router
