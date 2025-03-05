<script setup lang="ts">
import { NModal } from "naive-ui";
import { reactive, ref, watch } from "vue";

const dropdowns = reactive<{ [key: string]: boolean }>({
  coban: true,
  noidung: false,
  chungchi: false,
  caidat: false,
  chamsoc: false,
});
const isCollapsed = ref(false);
const activeDropdown = ref("coban");
const noidungarrey = ref<{ id: number; name: string }[]>([]);
const isModalVisible = ref(false);
const newLessonName = ref("");
const Lesson = ref<{ id: number; name: string }[]>([]);
const addLesson = (): void => {
  Lesson.value.push({ id: Lesson.value.length + 1, name: "" });
  console.log(Lesson);
};
watch(isModalVisible, (newValue) => {
  if (!newValue) {
    Lesson.value = [];
  }
});
const removeLesson = (index: number) => {
  Lesson.value.splice(index, 1);
};
function addSubject() {
  isModalVisible.value = true;
}

function handleAddSubject() {
  console.log(newLessonName);
  if (!newLessonName.value.trim()) {
    console.warn("Tên bài học không được để trống!"); // Debugging check
    return; // Prevent empty values
  }

  // Add new lesson
  noidungarrey.value.push({
    id: noidungarrey.value.length + 1,
    name: newLessonName.value, // Store input value
  });

  console.log("Updated noidungarrey:", noidungarrey.value); // Debugging check

  newLessonName.value = ""; // Clear input field after adding
  isModalVisible.value = false; // Close modal
}

function deleteSubject(value: number) {
  noidungarrey.value = noidungarrey.value.filter((i) => i.id !== value);
}

const toggleDropdown = (menu: string) => {
  if (menu.startsWith("noidung-")) {
    if (activeDropdown.value === menu) {
      activeDropdown.value = "";
    } else {
      activeDropdown.value = menu;
    }
    return;
  }
  if (dropdowns[menu]) {
    dropdowns[menu] = false;
    activeDropdown.value = "";
  } else {
    Object.keys(dropdowns).forEach((key) => {
      dropdowns[key] = false;
    });
    dropdowns[menu] = true;
    activeDropdown.value = menu;
  }
};

watch(isModalVisible, (newValue) => {
  if (!newValue) {
    Lesson.value = [];
  }
});
// Removed the local watch function declaration
</script>
<template>
  <div class="flex h-full w-full">
    <div class="flex h-full w-1/6">
      <nav>
        <ul class="flex flex-col">
          <li
            @click="toggleDropdown('coban')"
            :class="[
              'relative flex cursor-pointer items-center py-3 pl-3 pr-10',
              activeDropdown === 'coban'
                ? '-mr-12 bg-gray-50 pr-0 text-[#133D85]'
                : 'text-[#4D6FA8]',
            ]"
          >
            <i
              :class="[
                'pr-3 text-[8px] text-[#133D85]',
                activeDropdown === 'coban'
                  ? 'fa-solid fa-circle text-[#133D85]'
                  : 'fa-solid fa-circle-dot text-[#4D6FA8]',
              ]"
            ></i>
            Thông tin cơ bản
          </li>
          <li
            @click="toggleDropdown('noidung')"
            :class="[
              'relative flex cursor-pointer items-center py-3 pl-3 pr-10',
              activeDropdown.startsWith('noidung')
                ? '-mr-12 bg-gray-50 pr-0 text-[#133D85]'
                : 'text-[#4D6FA8]',
            ]"
          >
            <i
              :class="[
                'pr-3 text-[8px]',
                activeDropdown.startsWith('noidung')
                  ? 'fa-solid fa-circle text-[#133D85]'
                  : 'fa-solid fa-circle-dot text-[#4D6FA8]',
              ]"
            ></i>
            Nội dung bài giảng
          </li>
          <li
            @click="toggleDropdown('chungchi')"
            :class="[
              'relative flex cursor-pointer items-center py-3 pl-3 pr-10',
              activeDropdown === 'chungchi'
                ? '-mr-12 bg-gray-50 pr-0 text-[#133D85]'
                : 'text-[#4D6FA8]',
            ]"
          >
            <i
              :class="[
                'pr-3 text-[8px]',
                activeDropdown === 'chungchi'
                  ? 'fa-solid fa-circle text-[#133D85]'
                  : 'fa-solid fa-circle-dot text-[#4D6FA8]',
              ]"
            ></i>
            Chứng chỉ
          </li>
          <li
            @click="toggleDropdown('caidat')"
            :class="[
              'relative flex cursor-pointer items-center py-3 pl-3 pr-10',
              activeDropdown === 'caidat'
                ? '-mr-12 bg-gray-50 pr-0 text-[#133D85]'
                : 'text-[#4D6FA8]',
            ]"
          >
            <i
              :class="[
                'pr-3 text-[8px]',
                activeDropdown === 'caidat'
                  ? 'fa-solid fa-circle text-[#133D85]'
                  : 'fa-solid fa-circle-dot text-[#4D6FA8]',
              ]"
            ></i
            >Cài đặt
          </li>
        </ul>
      </nav>
    </div>
    <div class="flex h-full w-5/6 overflow-auto rounded-2xl bg-gray-50">
      <!-- Main Content -->
      <div class="flex-1">
        <nav>
          <ul class="mx-5 my-5 flex flex-col gap-y-5 text-xl">
            <li class="rounded-2xl text-[#133D85]">
              <div
                @click="toggleDropdown('coban')"
                :class="[
                  'flex cursor-pointer items-center justify-between px-4 py-2.5',

                  activeDropdown === 'coban'
                    ? 'rounded-3xl bg-gray-300 text-[#133D85]'
                    : 'rounded-3xl bg-gray-200 text-gray-600',
                ]"
              >
                <span class="flex items-center">
                  <div v-if="!isCollapsed">Thông tin cơ bản</div>
                </span>
                <i
                  :class="
                    dropdowns.coban
                      ? 'fas fa-chevron-up'
                      : 'fas fa-chevron-down'
                  "
                ></i>
              </div>
              <ul v-if="dropdowns.coban" class="w-ful h-full">
                <li>
                  <div class="w-ful h-full" v-if="!isCollapsed">
                    <DaotaoMonhocmoiClassInfo />
                  </div>
                </li>
              </ul>
            </li>
            <li class="rounded-2xl text-[#133D85]">
              <div
                @click="toggleDropdown('noidung')"
                :class="[
                  'flex cursor-pointer items-center justify-between px-4 py-2.5',

                  activeDropdown.startsWith('noidung')
                    ? 'rounded-3xl bg-gray-300 text-[#133D85]'
                    : 'rounded-3xl bg-gray-200 text-gray-600',
                ]"
              >
                <span class="flex items-center">
                  <div v-if="!isCollapsed">Nội dung bài giảng</div>
                </span>
                <i
                  :class="
                    dropdowns.noidung
                      ? 'fas fa-chevron-up'
                      : 'fas fa-chevron-down'
                  "
                ></i>
              </div>
              <ul v-if="dropdowns.noidung" class="w-ful h-full">
                <li>
                  <div class="w-ful h-full" v-if="!isCollapsed">
                    <div class="px-5">
                      <div v-for="item in noidungarrey" :key="item.id">
                        <div>
                          <li
                            :class="[
                              'cursor-pointer py-2',
                              activeDropdown === `noidung-${item.id}`
                                ? 'text-[#133D85]'
                                : 'text-gray-600',
                            ]"
                            @click="toggleDropdown(`noidung-${item.id}`)"
                          >
                            <div
                              :class="[
                                'flex h-full w-full items-center justify-between rounded-2xl bg-gray-200 px-1',
                                activeDropdown === `noidung-${item.id}`
                                  ? 'text-[#133D85]'
                                  : 'text-gray-600',
                              ]"
                            >
                              <div
                                class="my-2 flex h-full w-full items-center justify-between px-5"
                              >
                                <p>{{ item.name }}</p>
                                <div>
                                  <button
                                    @click="editSubject(item.id)"
                                    class="pr-5 text-green-500 hover:text-green-700"
                                  >
                                    <i
                                      class="fas fa-regular fa-pen-to-square"
                                    ></i>
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
                          </li>
                          <div
                            class="-mt-2"
                            v-if="activeDropdown === `noidung-${item.id}`"
                          >
                            <!-- Content to be shown when active -->
                            <div class="mt-2 border-b-2"></div>
                            <DaotaoMonhocmoiNewsub />
                            <div class="border-b-2"></div>
                          </div>
                        </div>
                      </div>
                      <n-button
                        round
                        type="info"
                        class="mt-2 h-12 w-48 rounded-2xl text-xl"
                        @click="addSubject"
                      >
                        Thêm mới
                        <i class="fa-solid fa-plus ml-3"></i>
                      </n-button>
                      <n-modal-provider>
                        <n-modal
                          v-model:show="isModalVisible"
                          preset="card"
                          style="
                            position: fixed;
                            top: 40%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            width: 90%;
                            max-width: 600px;
                          "
                          :header-style="{ padding: '10px' }"
                        >
                          <n-form>
                            <n-grid cols="2" :x-gap="20">
                              <n-gi>
                                <h1 class="text-2xl font-bold text-[#133D85]">
                                  Thêm chương mới
                                </h1>
                                <div class="mt-5"></div>
                              </n-gi>
                              <n-gi span="2">
                                <n-form-item label="Tên bài học mới">
                                  <n-input
                                    v-model:value="newLessonName"
                                    placeholder="Nhập tên bài học"
                                  ></n-input>
                                </n-form-item>
                              </n-gi>
                              <n-gi span="2">
                                <n-form-item
                                  label="Thêm các nội dung nằm trong bài học này"
                                >
                                  <p class="-mt-6 text-[#4D6FA8]">
                                    Nhập tên nội dung trước và thêm nội dung chi
                                    tiết từng bài học ở bước sau
                                  </p>
                                </n-form-item>
                              </n-gi>
                              <n-gi span="2" class="-mt-8 mb-5">
                                <n-grid
                                  cols="15"
                                  :x-gap="20"
                                  v-for="(item, index) in Lesson"
                                  :key="item.id"
                                >
                                  <n-gi span="14" class="mb-2">
                                    <n-input
                                      v-model="item.name"
                                      placeholder="Nhập tên nội dung"
                                    ></n-input>
                                  </n-gi>
                                  <n-gi>
                                    <button
                                      class="pt-3 text-red-500 hover:text-red-700"
                                      @click="removeLesson(index)"
                                    >
                                      <i class="fas fa-trash-alt"></i>
                                    </button>
                                  </n-gi>
                                </n-grid>
                              </n-gi>
                              <n-gi span="2" class="mb-5">
                                <span
                                  class="cursor-pointer text-sm text-[#00A2EB]"
                                  @click="addLesson"
                                >
                                  + Thêm nội dung mới
                                </span>
                              </n-gi>
                              <n-gi>
                                <n-button
                                  ghost
                                  class="h-12 w-full rounded-2xl text-lg"
                                  @click="isModalVisible = false"
                                >
                                  Hủy
                                </n-button>
                              </n-gi>
                              <n-gi>
                                <n-button
                                  round
                                  type="info"
                                  class="h-12 w-full rounded-2xl text-lg"
                                  @click.prevent="handleAddSubject()"
                                >
                                  Lưu
                                </n-button>
                              </n-gi>
                            </n-grid>
                          </n-form>
                        </n-modal>
                      </n-modal-provider>
                    </div>
                  </div>
                </li>
              </ul>
            </li>
            <li class="rounded-2xl text-[#133D85]">
              <div
                @click="toggleDropdown('chungchi')"
                :class="[
                  'flex cursor-pointer items-center justify-between px-4 py-2.5',

                  activeDropdown === 'chungchi'
                    ? 'rounded-3xl bg-gray-300 text-[#133D85]'
                    : 'rounded-3xl bg-gray-200 text-gray-600',
                ]"
              >
                <span class="flex items-center">
                  <div v-if="!isCollapsed">Chứng chỉ</div>
                </span>
                <i
                  :class="
                    dropdowns.chungchi
                      ? 'fas fa-chevron-up'
                      : 'fas fa-chevron-down'
                  "
                ></i>
              </div>
              <ul v-if="dropdowns.chungchi" class="w-ful h-full">
                <li>
                  <div class="w-ful h-full" v-if="!isCollapsed">
                    <DaotaoHocvienctClass />
                  </div>
                </li>
              </ul>
            </li>
            <li class="rounded-2xl text-[#133D85]">
              <div
                @click="toggleDropdown('caidat')"
                :class="[
                  'flex cursor-pointer items-center justify-between px-4 py-2.5',

                  activeDropdown === 'caidat'
                    ? 'rounded-3xl bg-gray-300 text-[#133D85]'
                    : 'rounded-3xl bg-gray-200 text-gray-600',
                ]"
              >
                <span class="flex items-center">
                  <div v-if="!isCollapsed">Cài đặt</div>
                </span>
                <i
                  :class="
                    dropdowns.caidat
                      ? 'fas fa-chevron-up'
                      : 'fas fa-chevron-down'
                  "
                ></i>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>
