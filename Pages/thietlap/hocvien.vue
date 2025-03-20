<script setup>
const showParentModal = ref(false);
const showChildModal = ref(false);
</script>
<template>
  <div class="flex h-full w-full overflow-auto rounded-2xl bg-gray-50">
    <!-- Main Content -->
    <div class="flex-1">
      <!-- Content Area -->
      <div class="h-full">
        <n-card class="h-full bg-gray-50">
          <div class="mx-5 my-5 flex items-center gap-4">
            <n-button @click="showParentModal = true"
              >Open Parent Modal</n-button
            >

            <n-modal v-model:show="showParentModal">
              <n-form>
                <n-grid cols="2" :x-gap="20">
                  <n-gi span="2">
                    <h1 class="text-2xl font-bold text-[#133D85]">
                      Thêm chương mới
                    </h1>

                    <div class="mt-5"></div>
                  </n-gi>

                  <n-gi span="2">
                    <n-form-item label="Tên chương mới:">
                      <n-input placeholder="Nhập tên chương"></n-input>
                    </n-form-item>
                  </n-gi>
                  <n-gi span="2">
                    <n-gi span="2">
                      <n-form-item
                        label="Thêm các bài học nằm trong chương này"
                      >
                        <p class="-mt-6 text-[#4D6FA8]">
                          Nhập tên bài học trước và thêm nội dung chi tiết từng
                          bài học ở bước sau
                        </p>
                      </n-form-item>
                    </n-gi>
                    <n-gi span="2" class="mb-2">
                      <span class="cursor-pointer text-sm text-[#00A2EB]">
                        + Thêm bài học mới
                      </span>
                    </n-gi>
                    <n-gi span="2" class="mb-5">
                      <span
                        class="cursor-pointer text-sm text-[#00A2EB]"
                        @click="showChildModal = true"
                      >
                        + Thêm buổi học mới
                      </span>
                    </n-gi>
                  </n-gi>
                  <n-gi>
                    <n-button ghost class="h-12 w-full rounded-2xl text-lg">
                      Hủy
                    </n-button>
                  </n-gi>
                  <n-gi>
                    <n-button
                      round
                      type="info"
                      class="h-12 w-full rounded-2xl text-lg"
                    >
                      Lưu
                    </n-button>
                  </n-gi>
                </n-grid>
                <n-modal v-model:show="showChildModal">
                  <n-card
                    style="width: 300px"
                    title="Child Modal"
                    closable
                    @close="showChildModal = false"
                  >
                    <p>This is the child modal inside the parent modal.</p>
                    <n-button @click="showChildModal = false"
                      >Close Child Modal</n-button
                    >
                  </n-card>
                </n-modal>
              </n-form>
            </n-modal>
          </div>
        </n-card>
      </div>
    </div>
  </div>
</template>
