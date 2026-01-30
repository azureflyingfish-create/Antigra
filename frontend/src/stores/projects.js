import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

export const useProjectStore = defineStore('projects', () => {
    const projects = ref([])

    const fetchProjects = async () => {
        try {
            const res = await axios.get('/api/projects/')
            projects.value = res.data
        } catch (error) {
            console.error(error)
        }
    }

    const addProject = async (project) => {
        try {
            const res = await axios.post('/api/projects/', project)
            projects.value.push(res.data)
            ElMessage.success('Project added')
        } catch (error) {
            ElMessage.error('Failed to add project')
        }
    }

    const updateProject = async (id, project) => {
        try {
            await axios.put(`/api/projects/${id}`, project)
            await fetchProjects()
            ElMessage.success('Project updated')
        } catch (error) {
            ElMessage.error('Failed to update project')
        }
    }

    const deleteProject = async (id) => {
        try {
            await axios.delete(`/api/projects/${id}`)
            projects.value = projects.value.filter(p => p.id !== id)
            ElMessage.success('Project deleted')
        } catch (error) {
            ElMessage.error('Failed to delete project')
        }
    }

    return { projects, fetchProjects, addProject, updateProject, deleteProject }
})
