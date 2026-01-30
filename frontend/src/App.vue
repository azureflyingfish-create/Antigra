<template>
  <div class="common-layout">
    <el-container class="layout-container-demo" style="height: 100vh">
      <el-aside width="200px">
        <el-scrollbar>
          <div style="height: 60px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem; color: var(--el-color-primary);">
            Admin
          </div>
          <el-menu :router="true" :default-active="$route.path">
            <el-menu-item index="/">
              <el-icon><Odometer /></el-icon>
              <template #title>Dashboard</template>
            </el-menu-item>
            <el-menu-item index="/members">
              <el-icon><User /></el-icon>
              <template #title>Members</template>
            </el-menu-item>
             <el-menu-item index="/projects">
              <el-icon><Folder /></el-icon>
              <template #title>Projects</template>
            </el-menu-item>
            <el-menu-item index="/settings">
              <el-icon><Setting /></el-icon>
              <template #title>Settings</template>
            </el-menu-item>
          </el-menu>
        </el-scrollbar>
      </el-aside>

      <el-container>
        <el-header style="text-align: right; font-size: 12px; display: flex; flex-direction: column; justify-content: center; align-items: flex-end;">
          <div style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
             <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
                <el-breadcrumb-item v-if="$route.path !== '/'" >{{ $route.name }}</el-breadcrumb-item>
             </el-breadcrumb>
             <div class="toolbar">
               <span>Member Management System</span>
             </div>
          </div>
        </el-header>

        <el-main>
          <RouterView />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.layout-container-demo .el-header {
  position: relative;
  background-color: var(--el-color-primary-light-7);
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.el-menu {
  border-right: none;
}
.el-aside {
  border-right: 1px solid var(--el-menu-border-color);
}
</style>
