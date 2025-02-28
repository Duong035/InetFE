<script setup lang="ts">
import { ref } from "vue";

const activeTab = ref("all");
</script>
<template>
  <div class="h-min-fit flex w-full overflow-auto rounded-2xl bg-white">
    <!-- Main Content -->
    <div class="flex-1">
      <!-- Content Area -->
      <div class="flex w-full px-7 pt-6 text-[#133D85]">
        <h1 class="text-4xl font-bold">Lớp học</h1>
        <n-button
          type="info"
          class="ml-auto h-12 w-40 text-xl"
          @click="$router.push('isactiveinfo')"
        >
          Thêm mới
          <i class="fa-solid fa-plus ml-1 px-2"></i>
        </n-button>
      </div>
      <main class="box-border flex">
        <div class="min-h-fit w-full bg-white p-6">
          <!-- Tabs -->
          <div class="mb-6 flex border-b">
            <button
              @click="activeTab = 'all'"
              :class="[
                'px-6 py-2 font-medium',
                activeTab === 'all'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600',
              ]"
            >
              tất cả
            </button>
            <button
              @click="activeTab = 'isactive'"
              :class="[
                'px-6 py-2 font-medium',
                activeTab === 'isactive'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600',
              ]"
            >
              đang diễn ra
            </button>
            <button
              @click="activeTab = 'unactive'"
              :class="[
                'px-6 py-2 font-medium',
                activeTab === 'unactive'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600',
              ]"
            >
              sắp diễn ra
            </button>
            <button
              @click="activeTab = 'end'"
              :class="[
                'px-6 py-2 font-medium',
                activeTab === 'end'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600',
              ]"
            >
              đã kết thúc
            </button>
            <button
              @click="activeTab = 'cancel'"
              :class="[
                'px-6 py-2 font-medium',
                activeTab === 'cancel'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600',
              ]"
            >
              đã hủy
            </button>
          </div>
          <div v-if="activeTab === 'all'"><DaotaoLophocAll /></div>
          <div v-if="activeTab === 'isactive'"><DaotaoLophocHoatdong /></div>
          <div v-if="activeTab === 'unactive'">
            <DaotaoLophocSapdienra />
          </div>
          <div v-if="activeTab === 'end'"><DaotaoLophocDaketthuc /></div>
          <div v-if="activeTab === 'cancel'"><DaotaoLophocDahuy /></div>
        </div>
      </main>
    </div>
  </div>
</template>
