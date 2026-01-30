<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h1>Members</h1>
        <el-button type="primary" @click="openAddDialog">
            <el-icon style="vertical-align: middle; margin-right: 5px;"><Plus /></el-icon>
            Add Member
        </el-button>
    </div>

    <el-card>
        <el-table :data="memberStore.members" stripe style="width: 100%">
            <el-table-column prop="name" label="Name" />
            <el-table-column label="Title">
                <template #default="scope">
                    <el-tag v-if="scope.row.title" :color="scope.row.title.color" effect="dark" style="border:none">
                        {{ scope.row.title.name }}
                    </el-tag>
                    <span v-else>-</span>
                </template>
            </el-table-column>
            <el-table-column label="Actions" width="230" fixed="right">
                <template #default="scope">
                    <el-button link type="success" size="small" @click="openManageAssignments(scope.row)">Assignments</el-button>
                    <el-button link type="primary" size="small" @click="openEditDialog(scope.row)">Edit</el-button>
                    <el-button link type="danger" size="small" @click="handleDelete(scope.row)">Delete</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? 'Edit Member' : 'Add New Member'" width="500px">
        <el-form :model="form" label-width="120px">
            <el-form-item label="Name">
                <el-input v-model="form.name" placeholder="Enter member name" />
            </el-form-item>
            <el-form-item label="Title">
                <el-select v-model="form.title_id" placeholder="Select Title" clearable>
                    <el-option
                        v-for="item in titleStore.titles"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                    />
                </el-select>
                <div style="font-size: 0.8rem; color: #999; margin-top: 5px;">
                    Defined in Settings page.
                </div>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">Cancel</el-button>
                <el-button type="primary" @click="handleSubmit">Confirm</el-button>
            </span>
        </template>
    </el-dialog>

    <el-dialog v-model="manageAssignmentsVisible" title="Member Assignments" width="700px">
         <div style="margin-bottom: 20px;">
            <h3>Member: {{ currentMember?.name }}</h3>
            <p>Total Assignment: <span :style="{ color: totalAssignmentPercentage > 100 ? 'red' : 'green' }">{{ totalAssignmentPercentage }}%</span></p>
        </div>
        
        <el-table :data="memberAssignments" stripe style="width: 100%">
            <el-table-column label="Project">
                <template #default="scope">
                    {{ scope.row.project?.name }}
                </template>
            </el-table-column>
             <el-table-column label="Percentage">
                <template #default="scope">
                    <el-input-number v-model="scope.row.percentage" :min="0" :max="100" size="small" @change="(val) => handleUpdatePercentage(scope.row, val)" /> %
                </template>
            </el-table-column>
             <el-table-column label="Period">
                <template #default="scope">
                     <span v-if="scope.row.project?.start_date || scope.row.project?.end_date">
                        {{ scope.row.project?.start_date || '?' }} ~ {{ scope.row.project?.end_date || '?' }}
                    </span>
                    <span v-else>-</span>
                </template>
            </el-table-column>
        </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import { useMemberStore } from '../stores/members'
import { useTitleStore } from '../stores/titles'
import { useAssignmentStore } from '../stores/assignments'
import { ElMessageBox, ElMessage } from 'element-plus'
import { computed } from 'vue'

const memberStore = useMemberStore()
const titleStore = useTitleStore()
const assignmentStore = useAssignmentStore()

const dialogVisible = ref(false)
const manageAssignmentsVisible = ref(false)
const isEdit = ref(false)
const currentId = ref(null)
const currentMember = ref(null)

const form = reactive({
    name: '',
    title_id: null
})

onMounted(() => {
    memberStore.fetchMembers()
    titleStore.fetchTitles()
    assignmentStore.fetchAssignments()
})

const memberAssignments = computed(() => {
    if (!currentMember.value) return []
    return assignmentStore.assignments.filter(a => a.member_id === currentMember.value.id)
})

const totalAssignmentPercentage = computed(() => {
    return memberAssignments.value.reduce((sum, a) => sum + a.percentage, 0)
})

const openManageAssignments = (member) => {
    currentMember.value = member
    manageAssignmentsVisible.value = true
}

const handleUpdatePercentage = async (row, val) => {
    await assignmentStore.updateAssignment(row.id, { ...row, percentage: val })
    ElMessage.success('Percentage updated')
}

const openAddDialog = () => {
    isEdit.value = false
    currentId.value = null
    form.name = ''
    form.title_id = null
    dialogVisible.value = true
}

const openEditDialog = (row) => {
    isEdit.value = true
    currentId.value = row.id
    form.name = row.name
    form.title_id = row.title_id
    dialogVisible.value = true
}

const handleSubmit = async () => {
    if (!form.name) return

    const payload = { ...form }
    
    if (isEdit.value) {
        await memberStore.updateMember(currentId.value, payload)
    } else {
        await memberStore.addMember(payload)
    }
    dialogVisible.value = false
}

const handleDelete = (row) => {
    ElMessageBox.confirm(
        'Are you sure to delete this member?',
        'Warning',
        { confirmButtonText: 'OK', cancelButtonText: 'Cancel', type: 'warning' }
    ).then(() => {
        memberStore.deleteMember(row.id)
    })
}
</script>
