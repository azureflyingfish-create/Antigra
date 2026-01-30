import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'

export const useAssignmentStore = defineStore('assignments', () => {
    const assignments = ref([])

    const fetchAssignments = async () => {
        try {
            const response = await axios.get('/api/assignments/')
            assignments.value = response.data
        } catch (error) {
            console.error('Failed to fetch assignments:', error)
        }
    }

    const addAssignment = async (assignment) => {
        try {
            await axios.post('/api/assignments/', assignment)
            await fetchAssignments()
        } catch (error) {
            console.error('Failed to add assignment:', error)
        }
    }

    const updateAssignment = async (id, assignment) => {
        try {
            await axios.put(`/api/assignments/${id}`, assignment)
            await fetchAssignments()
        } catch (error) {
            console.error('Failed to update assignment:', error)
        }
    }

    const deleteAssignment = async (id) => {
        try {
            await axios.delete(`/api/assignments/${id}`)
            await fetchAssignments()
        } catch (error) {
            console.error('Failed to delete assignment:', error)
        }
    }

    return {
        assignments,
        fetchAssignments,
        addAssignment,
        updateAssignment,
        deleteAssignment
    }
})
