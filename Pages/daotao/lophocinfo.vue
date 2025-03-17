<script setup lang="ts">
import { DaotaoLophocDanhsach } from "#components";
import { reactive, ref } from "vue";

const dropdowns = reactive<{ [key: string]: boolean }>({
  coban: true,
  noidung: false,
  xeplich: false,
  danhsach: false,
});
const isCollapsed = ref(false);
const activeDropdown = ref("coban");

const noidungarrey = ref([
  {
    id: 1,
  },
]);
function addSubject() {
  noidungarrey.value.push({
    id: noidungarrey.value.length + 1,
  });
}
function deleteSubject(value: number) {
  noidungarrey.value = noidungarrey.value.filter((i) => i.id !== value);
}
function editSubject(value: number) {
  noidungarrey.value = noidungarrey.value.map((i) => {
    if (i.id === value) {
      return {
        ...i,
        id: value,
      };
    }
    return i;
  });
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
    // Close the dropdown if already open
    dropdowns[menu] = false;
    activeDropdown.value = "";
  } else {
    // Close all dropdowns
    Object.keys(dropdowns).forEach((key) => {
      dropdowns[key] = false;
    });
    // Open the clicked dropdown
    dropdowns[menu] = true;
    activeDropdown.value = menu;
  }
};
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
                ? '-mr-4 bg-gray-50 pr-0 text-[#133D85]'
                : 'text-[#4D6FA8]',
            ]"
          >
            <i
              :class="[
                'pr-3 text-[8px] text-[#133D85]',
                activeDropdown === 'coban'
                  ? 'fa-solchapterfa-circle text-[#133D85]'
                  : 'fa-solchapterfa-circle-dot text-[#4D6FA8]',
              ]"
            ></i>
            Thông tin cơ bản
          </li>
          <li
            @click="toggleDropdown('noidung')"
            :class="[
              'relative flex cursor-pointer items-center py-3 pl-3 pr-10',
              activeDropdown.startsWith('noidung')
                ? '-mr-4 bg-gray-50 pr-0 text-[#133D85]'
                : 'text-[#4D6FA8]',
            ]"
          >
            <i
              :class="[
                'pr-3 text-[8px]',
                activeDropdown.startsWith('noidung')
                  ? 'fa-solchapterfa-circle text-[#133D85]'
                  : 'fa-solchapterfa-circle-dot text-[#4D6FA8]',
              ]"
            ></i>
            Nội dung bài giảng
          </li>
          <li
            @click="toggleDropdown('xeplich')"
            :class="[
              'relative flex cursor-pointer items-center py-3 pl-3 pr-10',
              activeDropdown === 'xeplich'
                ? '-mr-4 bg-gray-50 pr-0 text-[#133D85]'
                : 'text-[#4D6FA8]',
            ]"
          >
            <i
              :class="[
                'pr-3 text-[8px]',
                activeDropdown === 'xeplich'
                  ? 'fa-solchapterfa-circle text-[#133D85]'
                  : 'fa-solchapterfa-circle-dot text-[#4D6FA8]',
              ]"
            ></i>
            Xếp lịch học
          </li>
          <li
            @click="toggleDropdown('danhsach')"
            :class="[
              'relative flex cursor-pointer items-center py-3 pl-3 pr-10',
              activeDropdown === 'danhsach'
                ? '-mr-4 bg-gray-50 pr-0 text-[#133D85]'
                : 'text-[#4D6FA8]',
            ]"
          >
            <i
              :class="[
                'pr-3 text-[8px]',
                activeDropdown === 'danhsach'
                  ? 'fa-solchapterfa-circle text-[#133D85]'
                  : 'fa-solchapterfa-circle-dot text-[#4D6FA8]',
              ]"
            ></i
            >Danh sách học viên
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
                    <DaotaoLophocNewclass />
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
                                <p>Chương {{ item.id }}</p>
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
                    </div>
                  </div>
                </li>
              </ul>
            </li>
            <li class="rounded-2xl text-[#133D85]">
              <div
                @click="toggleDropdown('xeplich')"
                :class="[
                  'flex cursor-pointer items-center justify-between px-4 py-2.5',

                  activeDropdown === 'xeplich'
                    ? 'rounded-3xl bg-gray-300 text-[#133D85]'
                    : 'rounded-3xl bg-gray-200 text-gray-600',
                ]"
              >
                <span class="flex items-center">
                  <div v-if="!isCollapsed">Xếp lịch học</div>
                </span>
                <i
                  :class="
                    dropdowns.xeplich
                      ? 'fas fa-chevron-up'
                      : 'fas fa-chevron-down'
                  "
                ></i>
              </div>
              <ul v-if="dropdowns.xeplich" class="w-ful h-full">
                <li>
                  <div class="w-ful h-full" v-if="!isCollapsed">
                    <DaotaoLophocXeplop />
                  </div>
                </li>
              </ul>
            </li>
            <li class="rounded-2xl text-[#133D85]">
              <div
                @click="toggleDropdown('danhsach')"
                :class="[
                  'flex cursor-pointer items-center justify-between px-4 py-2.5',

                  activeDropdown === 'danhsach'
                    ? 'rounded-3xl bg-gray-300 text-[#133D85]'
                    : 'rounded-3xl bg-gray-200 text-gray-600',
                ]"
              >
                <span class="flex items-center">
                  <div v-if="!isCollapsed">danh sách học viên</div>
                </span>
                <i
                  :class="
                    dropdowns.danhsach
                      ? 'fas fa-chevron-up'
                      : 'fas fa-chevron-down'
                  "
                ></i>
              </div>
              <ul v-if="dropdowns.danhsach" class="w-ful h-full">
                <li>
                  <div class="w-ful h-full" v-if="!isCollapsed">
                    <DaotaoLophocDanhsach />
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>
