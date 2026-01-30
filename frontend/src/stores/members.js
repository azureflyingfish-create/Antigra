import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

export const useMemberStore = defineStore('members', () => {
    const members = ref([])

    const fetchMembers = async () => {
        try {
            const res = await axios.get('/api/members/')
            members.value = res.data
        } catch (error) {
            console.error(error)
        }
    }

    const addMember = async (member) => {
        try {
            const res = await axios.post('/api/members/', member)
            members.value.push(res.data)
            // Re-fetch to get relation data properly if needed, but endpoint returns relation usually loaded or null
            // For safety, re-fetch
            await fetchMembers()
            ElMessage.success('Member added')
        } catch (error) {
            ElMessage.error('Failed to add member')
            console.error(error)
        }
    }

    const updateMember = async (id, member) => {
        try {
            await axios.put(`/api/members/${id}`, member)
            await fetchMembers()
            ElMessage.success('Member updated')
        } catch (error) {
            ElMessage.error('Failed to update member')
        }
    }

    const deleteMember = async (id) => {
        try {
            await axios.delete(`/api/members/${id}`)
            members.value = members.value.filter(m => m.id !== id)
            ElMessage.success('Member deleted')
        } catch (error) {
            ElMessage.error('Failed to delete member')
        }
    }

    return { members, fetchMembers, addMember, updateMember, deleteMember }
})
