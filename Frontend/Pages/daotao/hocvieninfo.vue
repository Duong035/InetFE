<script setup lang="ts">
import { reactive, ref, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import { message } from "ant-design-vue";

const dropdowns = reactive<{ [key: string]: boolean }>({
  canhan: true,
  nhucau: false,
  danhsach: false,
  phuhuynh: false,
  chamsoc: false,
});

const { restAPI } = useApi();
const route = useRoute();
const isCollapsed = ref(false);
const activeDropdown = ref("canhan");
const Nhucauarrey = ref<{ stt: number; Needid: string }[]>([]);
function addNeed() {
  Nhucauarrey.value.push({
    stt: Nhucauarrey.value.length + 1,
    Needid: "",
  });
}

async function getNeed() {
  const stu_id = route.query.id;

  if (!stu_id) return;

  try {
    const { data: resData } = await restAPI.cms.listStudyNeed();

    const idArray = resData.value.data
      .filter((item) => item.student_id === stu_id)
      .map((item) => item.id);

    Nhucauarrey.value = idArray.map((id, index) => ({
      stt: index + 1,
      Needid: id,
    }));
  } catch (error) {
    console.error("Error fetching need data:", error);
  }
}

async function deleteNeed(value: string, st: number) {
  //get NeedId from array
  console.log(value);
  const { data: delData, error } = await restAPI.cms.deleteStudyNeed({
    id: value,
  });
  if (delData?.value?.status) {
    message.success("Xóa nhu cầu học tập thành công!");
    Nhucauarrey.value = Nhucauarrey.value
      .filter((i) => i.stt !== st)
      .map((item, index) => ({
        ...item,
        stt: index + 1,
      }));
  } else {
    message.error(error.value.data.message);
  }
}

function deleteItem(value: number) {
  Nhucauarrey.value = Nhucauarrey.value
    .filter((i) => i.stt !== value)
    .map((item, index) => ({
      ...item,
      stt: index + 1,
    }));
}
const toggleDropdown = (menu: string) => {
  if (menu.startsWith("nhucau-")) {
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
    activeDropdown.value = ""; // Unset the active dropdown
  } else {
    // Close all dropdowns
    Object.keys(dropdowns).forEach((key) => {
      dropdowns[key] = false;
    });
    // Open the clicked dropdown
    dropdowns[menu] = true;
    activeDropdown.value = menu; // Set the active dropdown
  }
};

onMounted(async () => {
  await nextTick();
  getNeed();
});
</script>
<template>
  <div class="flex h-full w-full">
    <div class="flex h-full w-1/6">
      <nav>
        <ul class="flex flex-col">
          <li
            @click="toggleDropdown('canhan')"
            :class="[
              'relative flex cursor-pointer items-center py-3 pl-3 pr-10',
              activeDropdown === 'canhan'
                ? '-mr-10 bg-gray-50 pr-0 text-[#133D85]'
                : 'text-[#4D6FA8]',
            ]"
          >
            <i
              :class="[
                'pr-3 text-[8px] text-[#133D85]',
                activeDropdown === 'canhan'
                  ? 'fa-solid fa-circle text-[#133D85]'
                  : 'fa-solid fa-circle-dot text-[#4D6FA8]',
              ]"
            ></i>
            Thông tin cá nhân
          </li>
          <li
            @click="toggleDropdown('nhucau')"
            :class="[
              'relative flex cursor-pointer items-center py-3 pl-3 pr-10',
              activeDropdown === 'nhucau'
                ? '-mr-10 bg-gray-50 pr-0 text-[#133D85]'
                : 'text-[#4D6FA8]',
            ]"
          >
            <i
              :class="[
                'pr-3 text-[8px] text-[#133D85]',
                activeDropdown === 'nhucau'
                  ? 'fa-solid fa-circle text-[#133D85]'
                  : 'fa-solid fa-circle-dot text-[#4D6FA8]',
              ]"
            ></i>
            Nhu cầu học tập
          </li>
          <li
            @click="toggleDropdown('danhsach')"
            :class="[
              'relative flex cursor-pointer items-center py-3 pl-3 pr-10',
              activeDropdown === 'danhsach'
                ? '-mr-10 bg-gray-50 pr-0 text-[#133D85]'
                : 'text-[#4D6FA8]',
            ]"
          >
            <i
              :class="[
                'pr-3 text-[8px] text-[#133D85]',
                activeDropdown === 'danhsach'
                  ? 'fa-solid fa-circle text-[#133D85]'
                  : 'fa-solid fa-circle-dot text-[#4D6FA8]',
              ]"
            ></i>
            Danh sách lớp học
          </li>
          <li
            @click="toggleDropdown('phuhuynh')"
            :class="[
              'relative flex cursor-pointer items-center py-3 pl-3 pr-10',
              activeDropdown === 'phuhuynh'
                ? '-mr-10 bg-gray-50 pr-0 text-[#133D85]'
                : 'text-[#4D6FA8]',
            ]"
          >
            <i
              :class="[
                'pr-3 text-[8px]',
                activeDropdown === 'phuhuynh'
                  ? 'fa-solid fa-circle text-[#133D85]'
                  : 'fa-solid fa-circle-dot text-[#4D6FA8]',
              ]"
            ></i>
            Thông tin phụ huynh
          </li>
          <li
            @click="toggleDropdown('chamsoc')"
            :class="[
              'relative flex cursor-pointer items-center py-3 pl-3 pr-10',
              activeDropdown === 'chamsoc'
                ? '-mr-10 bg-gray-50 pr-0 text-[#133D85]'
                : 'text-[#4D6FA8]',
            ]"
          >
            <i
              :class="[
                'pr-3 text-[8px] text-[#133D85]',
                activeDropdown === 'chamsoc'
                  ? 'fa-solid fa-circle text-[#133D85]'
                  : 'fa-solid fa-circle-dot text-[#4D6FA8]',
              ]"
            ></i>
            Thông tin chăm sóc
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
                @click="toggleDropdown('canhan')"
                :class="[
                  'flex cursor-pointer items-center justify-between px-4 py-2.5',

                  activeDropdown === 'canhan'
                    ? 'rounded-3xl bg-gray-200 text-[#133D85]'
                    : 'text-gray-600',
                ]"
              >
                <span class="flex items-center">
                  <div v-if="!isCollapsed">Thông tin cá nhân</div>
                </span>
                <i
                  :class="
                    dropdowns.canhan
                      ? 'fas fa-chevron-up'
                      : 'fas fa-chevron-down'
                  "
                ></i>
              </div>
              <ul v-if="dropdowns.canhan" class="w-ful h-full">
                <li>
                  <div class="w-ful h-full" v-if="!isCollapsed">
                    <DaotaoHocvienctPerInfo />
                  </div>
                </li>
              </ul>
            </li>
            <li class="rounded-2xl text-[#133D85]">
              <div
                @click="toggleDropdown('nhucau')"
                :class="[
                  'flex cursor-pointer items-center justify-between px-4 py-2.5',

                  activeDropdown === 'nhucau'
                    ? 'rounded-3xl bg-gray-200 text-[#133D85]'
                    : 'text-gray-600',
                ]"
              >
                <span class="flex items-center">
                  <div v-if="!isCollapsed">Nhu cầu học tập</div>
                </span>
                <i
                  :class="
                    dropdowns.nhucau
                      ? 'fas fa-chevron-up'
                      : 'fas fa-chevron-down'
                  "
                ></i>
              </div>
              <ul v-if="dropdowns.nhucau" class="w-ful h-full">
                <li>
                  <div class="w-ful h-full" v-if="!isCollapsed">
                    <div class="px5 mt-5">
                      <n-button
                        round
                        type="info"
                        class="h-12 w-48 rounded-2xl text-xl"
                        @click="addNeed"
                      >
                        Thêm mới
                        <i class="fa-solid fa-plus ml-3"></i>
                      </n-button>
                      <div v-for="item in Nhucauarrey" :key="item.stt">
                        <div>
                          <li
                            :class="[
                              'cursor-pointer py-2',
                              activeDropdown === `nhucau-${item.stt}`
                                ? 'text-[#133D85]'
                                : 'text-gray-600',
                            ]"
                            @click="toggleDropdown(`nhucau-${item.stt}`)"
                          >
                            <div
                              :class="[
                                'flex h-full w-full items-center justify-between bg-gray-200 px-1',
                                activeDropdown === `nhucau-${item.stt}`
                                  ? 'rounded-t-2xl text-[#133D85]'
                                  : 'rounded-2xl text-gray-600',
                              ]"
                            >
                              <div
                                class="my-3 flex h-full w-full items-center justify-between px-5"
                              >
                                <p>Nhu cầu {{ item.stt }}: {{ item.Needid }}</p>
                                <button
                                  @click="deleteNeed(item.Needid, item.stt)"
                                  class="text-red-500 hover:text-red-700"
                                >
                                  <i class="fas fa-trash-alt"></i>
                                  <!-- Font Awesome Trash Icon -->
                                </button>
                              </div>
                            </div>
                          </li>
                          <div
                            class="-mt-2"
                            v-if="activeDropdown === `nhucau-${item.stt}`"
                          >
                            <!-- Content to be shown when active -->
                            <div
                              class="rounded-b-2xl border-[4px] border-gray-200"
                            >
                              <DaotaoHocvienctNeed :needId="item.Needid" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
                    ? 'rounded-3xl bg-gray-200 text-[#133D85]'
                    : 'text-gray-600',
                ]"
              >
                <span class="flex items-center">
                  <div v-if="!isCollapsed">Danh sách lớp học</div>
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
                    <DaotaoHocvienctClass />
                  </div>
                </li>
              </ul>
            </li>
            <li class="rounded-2xl text-[#133D85]">
              <div
                @click="toggleDropdown('phuhuynh')"
                :class="[
                  'flex cursor-pointer items-center justify-between px-4 py-2.5',

                  activeDropdown === 'phuhuynh'
                    ? 'rounded-3xl bg-gray-200 text-[#133D85]'
                    : 'text-gray-600',
                ]"
              >
                <span class="flex items-center">
                  <div v-if="!isCollapsed">Thông tin phụ huynh</div>
                </span>
                <i
                  :class="
                    dropdowns.phuhuynh
                      ? 'fas fa-chevron-up'
                      : 'fas fa-chevron-down'
                  "
                ></i>
              </div>
            </li>
            <li class="rounded-2xl text-[#133D85]">
              <div
                @click="toggleDropdown('chamsoc')"
                :class="[
                  'flex cursor-pointer items-center justify-between px-4 py-2.5',

                  activeDropdown === 'chamsoc'
                    ? 'rounded-3xl bg-gray-200 text-[#133D85]'
                    : 'text-gray-600',
                ]"
              >
                <span class="flex items-center">
                  <div v-if="!isCollapsed">Thông tin chăm sóc</div>
                </span>
                <i
                  :class="
                    dropdowns.chamsoc
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
