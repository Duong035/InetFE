<script setup></script>

<template>
  <n-modal v-model:show="showDeleteModal">
    <n-card
      title="Xác nhận xóa"
      closable
      @close="showDeleteModal = false"
      style="width: 400px"
    >
      <p v-if="deleteType === 'single'">
        Bạn có chắc chắn muốn xóa học viên này không?
      </p>
      <p v-else>Bạn có chắc chắn muốn xóa các học viên đã chọn không?</p>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDeleteModal = false">Hủy</n-button>
          <n-button type="error" @click="confirmDelete" :loading="isDeleting">
            Xóa
          </n-button>
        </n-space>
      </template>
    </n-card>
  </n-modal>
</template>
