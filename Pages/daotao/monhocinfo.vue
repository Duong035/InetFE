<script setup>
import { NModal } from "naive-ui";
import { reactive, ref, watch, nextTick, onMounted } from "vue";
import { useRoute } from "vue-router";

const message = useMessage();
const { restAPI } = useApi();
const route = useRoute();
const isCollapsed = ref(false);
const isLoading = ref(false);
const isModalVisible = ref(false);
const is_addnew = ref(false);
const dropdowns = reactive({
  coban: true,
  noidung: false,
  chungchi: false,
  caidat: false,
  chamsoc: false,
});
const activeDropdown = ref("coban");

const delref = ref(null);
const deleteAction = ref(null);
const itemId = ref(null);

const showDeleteModal = (action, title, id) => {
  deleteAction.value = action;
  itemId.value = id;
  if (delref.value) {
    delref.value.setAddNew(title);
  }
};

const handleConfirmDelete = () => {
  if (deleteAction.value && itemId.value !== null) {
    deleteAction.value(itemId.value);
    itemId.value = null;
    deleteAction.value = null;
  }
};

const lessonarray = ref([]);
const tempValues = ref({});
const formValue = reactive({
  id: null,
  name: null,
  position: null,
  metadata: {
    duration: null,
    difficulty: null,
  },
  free_trial: false,
  is_live: false,

  child_lessons: [
    {
      id: null,
      name: null,
      position: null,
    },
  ],
});

const updateLessonName = (index) => {
  if (formValue.child_lessons[index]) {
    formValue.child_lessons[index].name = tempValues.value[index];
  }
};

const difficultyOptions = ref([
  { label: "Dễ", value: "easy" },
  { label: "Trung bình", value: "medium" },
  { label: "Khó", value: "hard" },
]);

const getDisabledMinutes = (selectedHour) => {
  const allMinutes = Array.from({ length: 60 }, (_, i) => i);

  if (selectedHour === 0) {
    return allMinutes.filter((minute) => minute < 45);
  }

  if (selectedHour === 2) {
    return allMinutes.filter((minute) => minute !== 0);
  }

  return [];
};

function addSubject() {
  formValue.child_lessons = [];
  is_addnew.value = true;
  isModalVisible.value = true;
}

async function editSubject(value) {
  is_addnew.value = false;
  const { data: resData } = await restAPI.cms.getLessonDetail({
    id: value,
  });
  if (resData.value?.status) {
    const data = resData.value?.data;
    formValue.id = data.id;
    formValue.name = data.name;
    formValue.position = String(data.position);
    formValue.metadata.duration = data.metadata?.duration || null;
    formValue.metadata.difficulty = data.metadata?.difficulty || null;
    formValue.free_trial = data.free_trial || false;
    formValue.is_live = data.is_live || false;
    formValue.child_lessons = data.childrens
      ? data.childrens.map((child) => ({
          id: child.id,
          name: child.name,
          position: child.position,
        }))
      : [];
  }
  tempValues.value = formValue.child_lessons
    .map((lesson) => lesson.name || "")
    .sort((a, b) => a.localeCompare(b, "vi"));

  isModalVisible.value = true;
}

watch(isModalVisible, (newValue, oldValue) => {
  if (!newValue) {
    Object.assign(formValue, {
      id: null,
      name: null,
      position: null,
      metadata: {
        duration: null,
        difficulty: null,
        position: null,
      },
      free_trial: false,
      is_live: false,
      child_lessons: [],
    });
    tempValues.value = [];
  }
});

async function getLesson() {
  const lesson_id = route.query.id;
  if (!lesson_id) return;

  try {
    const { data: resData } = await restAPI.cms.getListLesson({
      id: lesson_id,
    });

    lessonarray.value = resData.value.data.map((lesson, index) => ({
      id: lesson.id,
      name: `Chương ${lesson.position}: ${lesson.name}`,
    }));
  } catch (error) {
    console.error("Error fetching lesson data:", error);
  }
}

const handleSubmit = async () => {
  if (isLoading.value) return;
  if (
    route.query.id === undefined ||
    route.query.id === null ||
    route.query.id === ""
  ) {
    message.warning("Hoàn thành nhập thông tin cơ bản cho môn học");
    return;
  }

  const { id, position, name, free_trial, is_live, metadata, child_lessons } =
    formValue;

  let body = {
    name,
    position: Number(position),
    subject_id: route.query.id,
    free_trial,
    is_live,
    metadata: {
      duration: metadata.duration,
      difficulty: metadata.difficulty,
    },
    child_lessons: child_lessons.map((lesson, index) => ({
      name: lesson.name,
      position: index + 1,
    })),
  };

  if (id === undefined || id === null || id === "") {
    const { data: resCreate, error } = await restAPI.cms.createLesson({
      body,
    });
    if (resCreate?.value?.status) {
      message.success("Tạo chương thành công!");
    } else {
      const errorCode = error.value?.data?.error;
      const errorMessage =
        ERROR_CODES[errorCode] ||
        resCreate?.value?.message ||
        "Đã xảy ra lỗi, vui lòng thử lại!";

      message.warning(errorMessage);
    }
  } else {
    body.id = id;
    let finalBody = [body];

    const { data: resUpdate, error } = await restAPI.cms.updateLesson({
      body: finalBody,
    });
    if (resUpdate?.value?.status) {
      message.success("Cập nhật chương thành công!");
    } else {
      const errorCode = error.value?.data?.error;
      const errorMessage =
        ERROR_CODES[errorCode] ||
        resUpdate?.value?.message ||
        "Đã xảy ra lỗi, vui lòng thử lại!";

      message.warning(errorMessage);
    }
  }
  isModalVisible.value = false;
  getLesson();
};

const addchildLesson = () => {
  const nextPosition =
    formValue.child_lessons.length > 0
      ? Math.max(...formValue.child_lessons.map((l) => l.position)) + 1
      : 1;
  formValue.child_lessons.push({ position: nextPosition, name: "" });
};
const removeLesson = (index) => {
  formValue.child_lessons.splice(index, 1);

  tempValues.value = formValue.child_lessons.map((lesson) => lesson.name || "");
};

async function deleteLesson(value) {
  const body = { id: value };
  const { data: delData, error } = await restAPI.cms.deleteLesson({
    body,
  });
  if (delData?.value?.status) {
    message.success("Xóa chương thành công!");
  } else {
    const errorCode = error.value?.data?.error;
    const errorMessage =
      ERROR_CODES[errorCode] ||
      resdel?.value?.message ||
      "Đã xảy ra lỗi, vui lòng thử lại!";

    message.warning(errorMessage);
  }
  getLesson();
}

function CancelModal() {
  isModalVisible.value = false;
}

const toggleDropdown = (menu) => {
  if (menu.startsWith("noidung-")) {
    activeDropdown.value = activeDropdown.value === menu ? "" : menu;
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

onMounted(async () => {
  await nextTick();
  getLesson();
});
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
                ? '-mr-14 bg-gray-50 pr-0 text-[#133D85]'
                : 'text-[#4D6FA8]',
            ]"
          >
            <i
              :class="[
                'pr-3 text-[8px] text-[#133D85]',
                activeDropdown === 'noidung'
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
                'pr-3 text-[8px] text-[#133D85]',
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
                'pr-3 text-[8px] text-[#133D85]',
                activeDropdown === 'caidat'
                  ? 'fa-solid fa-circle text-[#133D85]'
                  : 'fa-solid fa-circle-dot text-[#4D6FA8]',
              ]"
            ></i>
            Cài đặt
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
              <ul v-if="dropdowns.coban" class="h-full w-full">
                <li>
                  <div class="h-full w-full" v-if="!isCollapsed">
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
                      <div v-for="item in lessonarray" :key="item.id">
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
                                'flex h-full w-full items-center justify-between rounded-2xl bg-gray-200',
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
                                    @click="
                                      showDeleteModal(
                                        deleteLesson,
                                        'Xóa chương',
                                        item.id,
                                      )
                                    "
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
                            <DaotaoMonhocmoiNewsub :lessonId="item.id" />
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
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            width: 90%;
                            max-width: 600px;
                          "
                          :header-style="{ padding: '10px' }"
                          :closable="false"
                        >
                          <n-form>
                            <n-grid cols="2" :x-gap="20">
                              <n-gi span="2">
                                <h1
                                  v-if="is_addnew"
                                  class="text-2xl font-bold text-[#133D85]"
                                >
                                  Thêm chương mới
                                </h1>
                                <h1
                                  v-else
                                  class="text-2xl font-bold text-[#133D85]"
                                >
                                  Chỉnh sửa chương
                                </h1>
                                <div class="mt-5"></div>
                              </n-gi>
                              <n-gi span="1">
                                <n-form-item
                                  label="Chương thứ:"
                                  label-placement="left"
                                >
                                  <n-input
                                    v-model:value="formValue.position"
                                    placeholder="Nhập số thứ tự của chương"
                                  ></n-input>
                                </n-form-item>
                              </n-gi>
                              <n-gi span="2">
                                <n-form-item label="Tên chương mới:">
                                  <n-input
                                    v-model:value="formValue.name"
                                    placeholder="Nhập tên chương"
                                  ></n-input>
                                </n-form-item>
                              </n-gi>
                              <n-gi>
                                <n-form-item label="Thời lượng mỗi bài học">
                                  <n-time-picker
                                    v-model:value="formValue.metadata.duration"
                                    format="HH:mm:ss"
                                    :hours="[0, 1, 2]"
                                    :is-minute-disabled="
                                      (minute, hour) =>
                                        getDisabledMinutes(hour).includes(
                                          minute,
                                        )
                                    "
                                    :seconds="[0]"
                                    style="width: 250px"
                                    placeholder="Chọn thời lượng"
                                  />
                                </n-form-item>
                              </n-gi>

                              <n-gi>
                                <n-form-item label="Mức độ">
                                  <n-select
                                    v-model:value="
                                      formValue.metadata.difficulty
                                    "
                                    :options="difficultyOptions"
                                    placeholder="Chọn độ khó"
                                  />
                                </n-form-item>
                              </n-gi>

                              <n-gi>
                                <n-form-item
                                  label="Học thử miễn phí"
                                  label-placement="left"
                                >
                                  <n-checkbox
                                    v-model:checked="formValue.free_trial"
                                  ></n-checkbox>
                                </n-form-item>
                              </n-gi>
                              <n-gi>
                                <n-form-item
                                  label="Trạng thái hoạt động"
                                  label-placement="left"
                                >
                                  <n-checkbox
                                    v-model:checked="formValue.is_live"
                                  ></n-checkbox>
                                </n-form-item>
                              </n-gi>
                              <n-gi span="2" v-if="is_addnew">
                                <n-gi span="2">
                                  <n-form-item
                                    label="Thêm các bài học nằm trong chương này"
                                  >
                                    <p class="-mt-6 text-[#4D6FA8]">
                                      Nhập tên bài học trước và thêm nội dung
                                      chi tiết từng bài học ở bước sau
                                    </p>
                                  </n-form-item>
                                </n-gi>
                                <n-gi span="2" class="-mt-8 mb-5">
                                  <n-grid
                                    cols="15"
                                    :x-gap="20"
                                    v-for="(
                                      item, index
                                    ) in formValue.child_lessons"
                                    :key="item"
                                  >
                                    <n-gi span="14" class="mb-2">
                                      <n-input
                                        v-model:value="tempValues[index]"
                                        @focus="
                                          tempValues[index] = item?.name
                                            ? item.name
                                            : ''
                                        "
                                        @blur="updateLessonName(index)"
                                        placeholder="Nhập tên bài học"
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
                                    @click="addchildLesson"
                                  >
                                    + Thêm bài học mới
                                  </span>
                                </n-gi>
                              </n-gi>
                              <n-gi>
                                <n-button
                                  ghost
                                  class="h-12 w-full rounded-2xl text-lg"
                                  @click="CancelModal"
                                >
                                  Hủy
                                </n-button>
                              </n-gi>
                              <n-gi>
                                <n-button
                                  round
                                  type="info"
                                  class="h-12 w-full rounded-2xl text-lg"
                                  @click.prevent="handleSubmit"
                                  :loading="isLoading"
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
              <ul v-if="dropdowns.chungchi" class="h-full w-full">
                <li>
                  <div class="h-full w-full" v-if="!isCollapsed">
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
    <DelModal @confirm-delete="handleConfirmDelete" ref="delref" />
  </div>
</template>
