<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h1>Settings</h1>
        <el-button type="primary" @click="openAddDialog">
            Add Title
        </el-button>
    </div>

    <el-card>
        <h3>Member Titles</h3>
        <el-table :data="titleStore.titles" stripe style="width: 100%">
            <el-table-column prop="name" label="Name" />
            <el-table-column label="Color">
                <template #default="scope">
                    <span v-if="scope.row.color" :style="{ backgroundColor: scope.row.color, display: 'inline-block', width: '20px', height: '20px', borderRadius: '4px', verticalAlign: 'middle' }"></span>
                    <span v-else>Default</span>
                </template>
            </el-table-column>
            <el-table-column label="Actions" width="120" fixed="right">
                <template #default="scope">
                    <el-button link type="danger" size="small" @click="handleDelete(scope.row)">Delete</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="Add New Title" width="500px">
        <el-form :model="form" label-width="120px">
            <el-form-item label="Title Name">
                <el-input v-model="form.name" placeholder="e.g. PM, Engineer" />
            </el-form-item>
            <el-form-item label="Color">
                <el-color-picker v-model="form.color" />
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">Cancel</el-button>
                <el-button type="primary" @click="handleSubmit">Confirm</el-button>
            </span>
        </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import { useTitleStore } from '../stores/titles'
import { ElMessageBox } from 'element-plus'

const titleStore = useTitleStore()
const dialogVisible = ref(false)
const form = reactive({
    name: '',
    color: '#409EFF'
})

onMounted(() => {
    titleStore.fetchTitles()
})

const openAddDialog = () => {
    form.name = ''
    form.color = '#409EFF'
    dialogVisible.value = true
}

const handleSubmit = async () => {
    if (!form.name) return
    await titleStore.addTitle({ name: form.name, color: form.color })
    dialogVisible.value = false
}

const handleDelete = (row) => {
    ElMessageBox.confirm(
        'Are you sure to delete this title?',
        'Warning',
        {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning',
        }
    ).then(() => {
        titleStore.deleteTitle(row.id)
    })
}
</script>
