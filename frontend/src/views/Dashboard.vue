<template>
  <div>
    <h1>Dashboard</h1>
    <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px;">
        <el-card style="width: 48%; min-width: 400px;">
            <h3>Member Allocation</h3>
            <div style="height: 300px;">
                <Bar v-if="memberChartData" :data="memberChartData" :options="chartOptions" />
            </div>
        </el-card>
        <el-card style="width: 48%; min-width: 400px;">
            <h3>Project Resources</h3>
             <div style="height: 300px; display: flex; justify-content: center;">
                <Pie v-if="projectChartData" :data="projectChartData" :options="chartOptions" />
            </div>
        </el-card>
    </div>

    <el-card>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3>Assignment Timelines</h3>
            <div style="display: flex; gap: 10px; align-items: center;">
                <el-radio-group v-model="viewMode" size="small">
                    <el-radio-button label="user">User View</el-radio-button>
                    <el-radio-button label="project">Project View</el-radio-button>
                </el-radio-group>
                <div style="width: 200px;">
                    <el-select v-if="viewMode === 'user'" v-model="selectedUserId" placeholder="Select User" filterable>
                        <el-option v-for="m in memberStore.members" :key="m.id" :label="m.name" :value="m.id" />
                    </el-select>
                    <el-select v-else v-model="selectedProjectId" placeholder="Select Project" filterable>
                         <el-option v-for="p in projectStore.projects" :key="p.id" :label="p.name" :value="p.id" />
                    </el-select>
                </div>
            </div>
        </div>
        
        <div v-if="viewMode === 'user'">
            <UserTimelineChart 
                :user-id="selectedUserId" 
                :projects="projectStore.projects"
                :assignments="assignmentStore.assignments"
            />
        </div>
         <div v-else>
            <ProjectTimelineChart
                :project-id="selectedProjectId"
                :members="memberStore.members"
                :assignments="assignmentStore.assignments"
            />
        </div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { useMemberStore } from '../stores/members'
import { useAssignmentStore } from '../stores/assignments'
import { useProjectStore } from '../stores/projects'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js'
import { Bar, Pie } from 'vue-chartjs'
import UserTimelineChart from '../components/UserTimelineChart.vue'
import ProjectTimelineChart from '../components/ProjectTimelineChart.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

const memberStore = useMemberStore()
const assignmentStore = useAssignmentStore()
const projectStore = useProjectStore()

const viewMode = ref('user')
const selectedUserId = ref(null)
const selectedProjectId = ref(null)

onMounted(async () => {
    await memberStore.fetchMembers()
    await assignmentStore.fetchAssignments()
    await projectStore.fetchProjects()
    
    // Set defaults
    if (memberStore.members.length > 0) selectedUserId.value = memberStore.members[0].id
    if (projectStore.projects.length > 0) selectedProjectId.value = projectStore.projects[0].id
})

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false
}

const memberChartData = computed(() => {
    if (!memberStore.members.length) return null
    
    const labels = memberStore.members.map(m => m.name)
    const data = memberStore.members.map(m => {
        const assignments = assignmentStore.assignments.filter(a => a.member_id === m.id)
        return assignments.reduce((sum, a) => sum + a.percentage, 0)
    })
    
    // Background color based on allocation
    const backgroundColors = data.map(val => {
        if (val > 100) return '#F56C6C' // Red for over-allocated
        if (val === 100) return '#67C23A' // Green for full
        if (val === 0) return '#909399' // Grey for none
        return '#409EFF' // Blue for partial
    })

    return {
        labels,
        datasets: [{
            label: 'Total Assignment (%)',
            data,
            backgroundColor: backgroundColors
        }]
    }
})

const projectChartData = computed(() => {
    if (!projectStore.projects.length) return null
    
    // Count assignments per project (or sum of percentages better?)
    // Let's do sum of percentages to see "effort" distribution
    const labels = projectStore.projects.map(p => p.name)
    const data = projectStore.projects.map(p => {
         const assignments = assignmentStore.assignments.filter(a => a.project_id === p.id)
         return assignments.reduce((sum, a) => sum + a.percentage, 0)
    })
    
    // Generate random colors nicely
    const backgroundColors = [
        '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', 
        '#36A2EB', '#FF6384', '#4BC0C0', '#FF9F40', '#9966FF'
    ]

    return {
        labels,
        datasets: [{
            data,
            backgroundColor: backgroundColors.slice(0, labels.length)
        }]
    }
})

</script>
