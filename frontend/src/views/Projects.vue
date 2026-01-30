<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h1>Projects</h1>
        <el-button type="primary" @click="openAddDialog">
            <el-icon style="vertical-align: middle; margin-right: 5px;"><Plus /></el-icon>
            Add Project
        </el-button>
    </div>

    <el-card>
        <el-table :data="projectStore.projects" stripe style="width: 100%">
            <el-table-column prop="name" label="Project Name" />
            <el-table-column label="Period" width="220">
                <template #default="scope">
                    <div v-if="scope.row.start_date || scope.row.end_date">
                        {{ scope.row.start_date || '?' }} ~ {{ scope.row.end_date || '?' }}
                    </div>
                    <span v-else>-</span>
                </template>
            </el-table-column>
             <el-table-column prop="description" label="Description" show-overflow-tooltip />
            <el-table-column label="Actions" width="230" fixed="right">
                <template #default="scope">
                    <el-button link type="success" size="small" @click="openManageMembers(scope.row)">Members</el-button>
                    <el-button link type="primary" size="small" @click="openEditDialog(scope.row)">Edit</el-button>
                    <el-button link type="danger" size="small" @click="handleDelete(scope.row)">Delete</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? 'Edit Project' : 'Add New Project'" width="600px">
        <el-form :model="form" label-width="120px">
            <el-form-item label="Project Name">
                <el-input v-model="form.name" placeholder="Enter project name" />
            </el-form-item>
            <el-form-item label="Period">
                <el-date-picker
                    v-model="form.start_date"
                    type="date"
                    placeholder="Start Date"
                    value-format="YYYY-MM-DD"
                    style="width: 48%; margin-right: 2%" 
                />
                <el-date-picker
                    v-model="form.end_date"
                    type="date"
                    placeholder="End Date"
                    value-format="YYYY-MM-DD"
                    style="width: 48%" 
                />
            </el-form-item>
            <el-form-item label="Description">
                <el-input v-model="form.description" type="textarea" rows="3" />
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">Cancel</el-button>
                <el-button type="primary" @click="handleSubmit">Confirm</el-button>
            </span>
        </template>
    </el-dialog>

    <el-dialog v-model="manageMembersVisible" title="Manage Project Members" width="700px">
        <div style="margin-bottom: 20px;">
            <h3>Project: {{ currentProject?.name }}</h3>
            <div style="display: flex; gap: 10px;">
                <el-select v-model="selectedMemberId" placeholder="Select Member to Add" filterable>
                     <el-option
                        v-for="member in availableMembers"
                        :key="member.id"
                        :label="member.name"
                        :value="member.id"
                    />
                </el-select>
                <el-input-number v-model="newAssignmentPercentage" :min="1" :max="100" placeholder="%" style="width: 120px" />
                 <el-button type="primary" @click="handleAddMember">Add</el-button>
            </div>
        </div>
        
        <el-table :data="projectAssignments" stripe style="width: 100%">
            <el-table-column label="Member">
                <template #default="scope">
                    {{ scope.row.member?.name }}
                </template>
            </el-table-column>
            <el-table-column label="Role">
                 <template #default="scope">
                    {{ scope.row.member?.title?.name || '-' }}
                </template>
            </el-table-column>
             <el-table-column label="Percentage">
                <template #default="scope">
                    <el-input-number v-model="scope.row.percentage" :min="0" :max="100" size="small" @change="(val) => handleUpdatePercentage(scope.row, val)" /> %
                </template>
            </el-table-column>
            <el-table-column label="Actions" width="100">
                <template #default="scope">
                    <el-button link type="danger" size="small" @click="handleRemoveMember(scope.row)">Remove</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import { useProjectStore } from '../stores/projects'
import { useMemberStore } from '../stores/members'
import { useAssignmentStore } from '../stores/assignments'
import { ElMessageBox, ElMessage } from 'element-plus'
import { computed } from 'vue'

const projectStore = useProjectStore()
const memberStore = useMemberStore()
const assignmentStore = useAssignmentStore()

const dialogVisible = ref(false)
const manageMembersVisible = ref(false)
const isEdit = ref(false)
const currentId = ref(null)
const currentProject = ref(null)

const selectedMemberId = ref(null)
const newAssignmentPercentage = ref(100)

const form = reactive({
    name: '',
    description: '',
    start_date: null,
    end_date: null
})

onMounted(() => {
    projectStore.fetchProjects()
    memberStore.fetchMembers()
    assignmentStore.fetchAssignments()
})

const projectAssignments = computed(() => {
    if (!currentProject.value) return []
    return assignmentStore.assignments.filter(a => a.project_id === currentProject.value.id)
})

const availableMembers = computed(() => {
    if (!currentProject.value) return []
    const assignedMemberIds = projectAssignments.value.map(a => a.member_id)
    return memberStore.members.filter(m => !assignedMemberIds.includes(m.id))
})

const openManageMembers = (project) => {
    currentProject.value = project
    selectedMemberId.value = null
    newAssignmentPercentage.value = 100
    manageMembersVisible.value = true
}

const handleAddMember = async () => {
    if (!selectedMemberId.value) return
    await assignmentStore.addAssignment({
        project_id: currentProject.value.id,
        member_id: selectedMemberId.value,
        percentage: newAssignmentPercentage.value
    })
    selectedMemberId.value = null
    newAssignmentPercentage.value = 100
    ElMessage.success('Member added')
}

const handleUpdatePercentage = async (row, val) => {
    // Debouncing could be added here for production
    await assignmentStore.updateAssignment(row.id, { ...row, percentage: val })
    ElMessage.success('Percentage updated')
}

const handleRemoveMember = (row) => {
    ElMessageBox.confirm('Remove member from project?', 'Warning', { type: 'warning' })
        .then(async () => {
            await assignmentStore.deleteAssignment(row.id)
            ElMessage.success('Member removed')
        })
}

const openAddDialog = () => {
    isEdit.value = false
    currentId.value = null
    form.name = ''
    form.description = ''
    form.start_date = null
    form.end_date = null
    dialogVisible.value = true
}

const openEditDialog = (row) => {
    isEdit.value = true
    currentId.value = row.id
    form.name = row.name
    form.description = row.description
    form.start_date = row.start_date
    form.end_date = row.end_date
    dialogVisible.value = true
}

const handleSubmit = async () => {
    if (!form.name) return

    // Clean empty strings to null if needed, but Pydantic handles str -> date conversion for "YYYY-MM-DD", empty string might be issue.
    // Let's ensure null if empty.
    const payload = {
        name: form.name,
        description: form.description,
        start_date: form.start_date || null,
        end_date: form.end_date || null
    }
    
    if (isEdit.value) {
        await projectStore.updateProject(currentId.value, payload)
    } else {
        await projectStore.addProject(payload)
    }
    dialogVisible.value = false
}

const handleDelete = (row) => {
    ElMessageBox.confirm(
        'Are you sure to delete this project?',
        'Warning',
        { confirmButtonText: 'OK', cancelButtonText: 'Cancel', type: 'warning' }
    ).then(() => {
        projectStore.deleteProject(row.id)
    })
}
</script>
