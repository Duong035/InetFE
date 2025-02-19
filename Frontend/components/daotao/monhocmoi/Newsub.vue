<script setup>
import { ref } from "vue";

const noidungarrey = ref([
  {
    id: 1,
    lesson: [], // Each lesson will have its own file array
  },
]);

const activeDropdown = ref(null);
const dropdowns = ref({});

function addLesson() {
  noidungarrey.value.push({
    id: noidungarrey.value.length + 1,
    lesson: [], // Initialize with an empty array for this lesson
  });
}

function deleteSubject(value) {
  noidungarrey.value = noidungarrey.value.filter((i) => i.id !== value);
}

function deleteFile(lessonId, fileIndex) {
  const lesson = noidungarrey.value.find((item) => item.id === lessonId);
  if (lesson) {
    lesson.lesson.splice(fileIndex, 1);
  }
}
function toggleDropdown(id) {
  for (const key in dropdowns.value) {
    dropdowns.value[key] = false;
  }
  dropdowns.value[id] = !dropdowns.value[id];
}

// Add content to the respective lesson's "lesson" array
function addContentToLesson(lessonId, content) {
  const lesson = noidungarrey.value.find((item) => item.id === lessonId);
  if (lesson) {
    lesson.lesson.push(content);
  }
}
</script>

<template>
  <div class="w-full rounded-b-2xl px-5">
    <nav>
      <div v-for="item in noidungarrey" :key="item.id">
        <li
          :class="[
            'cursor-pointer py-2',
            activeDropdown === `${item.id}`
              ? 'text-[#133D85]'
              : 'text-gray-600',
          ]"
          @click="toggleDropdown(item.id)"
        >
          <div
            :class="[
              'flex h-full w-full items-center justify-between rounded-xl bg-gray-200 px-1',
              activeDropdown === `${item.id}`
                ? 'text-[#133D85]'
                : 'text-gray-600',
            ]"
          >
            <div
              class="my-2 flex h-full w-full items-center justify-between px-5"
            >
              <p>Bài {{ item.id }}:</p>
              <div>
                <button
                  @click="editSubject(item.id)"
                  class="pr-5 text-green-500 hover:text-green-700"
                >
                  <i class="fas fa-regular fa-pen-to-square"></i>
                </button>
                <button
                  @click="deleteSubject(item.id)"
                  class="text-red-500 hover:text-red-700"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          </div>
          <ul v-if="dropdowns[item.id]" class="h-full w-full">
            <li @click.stop="toggleDropdown(item.id)">
              <div class="h-full w-full">
                <n-card class="mt-1 bg-gray-50 text-[#133D85]">
                  <div
                    v-for="(content, index) in item.lesson"
                    :key="index"
                    class="pb-2"
                  >
                    <div
                      class="flex w-full items-center justify-between rounded-xl border-2 px-5 py-2 text-lg"
                    >
                      <div class="flex items-center">
                        <span class="pr-1">
                          <i
                            v-if="content === 'video'"
                            class="fa-regular fa-circle-play"
                          ></i>
                          <i
                            v-else-if="content === 'Video youtube'"
                            class="fa-brands fa-youtube"
                          ></i>
                          <i
                            v-else-if="content === 'Đoạn văn'"
                            class="fa-solid fa-align-justify"
                          ></i>
                          <i
                            v-else-if="content === 'Tải lên tài liệu'"
                            class="fa-regular fa-file-lines"
                          ></i>
                          <i
                            v-else-if="content === 'Bài kiểm tra'"
                            class="fa-regular fa-file-lines"
                          ></i>
                          <i
                            v-else-if="content === 'Chọn từ thư viện'"
                            class="fa-regular fa-folder"
                          ></i>
                        </span>
                        <span>{{ content }}</span>
                      </div>
                      <div>
                        <button
                          @click="editFile(item.id)"
                          class="pr-5 text-green-500 hover:text-green-700"
                        >
                          <i class="fas fa-regular fa-pen-to-square"></i>
                        </button>
                        <button
                          @click="deleteFile(item.id, index)"
                          class="text-red-500 hover:text-red-700"
                        >
                          <i class="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="rounded-xl border-2 border-dotted">
                    <p class="py-5 text-center text-xl">
                      Thêm nội dung của bài học
                    </p>
                    <div class="flex justify-center space-x-2 pb-5">
                      <n-button
                        ghost
                        class="h-8 w-40 rounded-lg text-[#133D85]"
                        @click="addContentToLesson(item.id, 'video')"
                      >
                        <i class="fa-regular fa-circle-play pr-1"></i>
                        Tải video lên
                      </n-button>
                      <n-button
                        ghost
                        class="h-8 w-40 rounded-lg text-[#133D85]"
                        @click="addContentToLesson(item.id, 'Video youtube')"
                      >
                        <i class="fa-brands fa-youtube pr-1"></i>
                        Video youtube
                      </n-button>
                      <n-button
                        ghost
                        class="h-8 w-40 rounded-lg text-[#133D85]"
                        @click="addContentToLesson(item.id, 'Đoạn văn')"
                      >
                        <i class="fa-solid fa-align-justify pr-1"></i>
                        Đoạn văn
                      </n-button>
                      <n-button
                        ghost
                        class="h-8 w-40 rounded-lg text-[#133D85]"
                        @click="addContentToLesson(item.id, 'Tải lên tài liệu')"
                      >
                        <i class="fa-regular fa-file-lines pr-1"></i>
                        Tải lên tài liệu
                      </n-button>
                      <n-button
                        ghost
                        class="h-8 w-40 rounded-lg text-[#133D85]"
                        @click="addContentToLesson(item.id, 'Bài kiểm tra')"
                      >
                        <i class="fa-regular fa-file-lines pr-1"></i>
                        Bài kiểm tra
                      </n-button>
                      <n-button
                        ghost
                        class="h-8 w-40 rounded-lg text-[#133D85]"
                        @click="addContentToLesson(item.id, 'Chọn từ thư viện')"
                      >
                        <i class="fa-regular fa-folder pr-1"></i>
                        Chọn từ thư viện
                      </n-button>
                    </div>
                  </div>
                </n-card>
              </div>
            </li>
          </ul>
        </li>
      </div>
    </nav>
    <span class="cursor-pointer text-sm text-[#00A2EB]" @click="addLesson">
      + Thêm bài học mới
    </span>
  </div>
</template>
