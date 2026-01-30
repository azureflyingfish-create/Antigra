import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

export const useTitleStore = defineStore('titles', () => {
    const titles = ref([])

    const fetchTitles = async () => {
        try {
            const res = await axios.get('/api/titles/')
            titles.value = res.data
        } catch (error) {
            console.error(error)
        }
    }

    const addTitle = async (title) => {
        try {
            const res = await axios.post('/api/titles/', title)
            titles.value.push(res.data)
            ElMessage.success('Title added')
        } catch (error) {
            ElMessage.error('Failed to add title')
        }
    }

    const deleteTitle = async (id) => {
        try {
            await axios.delete(`/api/titles/${id}`)
            titles.value = titles.value.filter(t => t.id !== id)
            ElMessage.success('Title deleted')
        } catch (error) {
            ElMessage.error('Failed to delete title')
        }
    }

    return { titles, fetchTitles, addTitle, deleteTitle }
})
