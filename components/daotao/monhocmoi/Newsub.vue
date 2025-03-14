<script setup>
import { NModal } from "naive-ui";
import { ref, onMounted } from "vue";

const props = defineProps({
  lessonId: String,
});

//1: youtube video, 2: s3 video, 3: text, 4: test, 5: document

const formValue = reactive({
  id: null,
  name: null,
  position: null,
  free_trial: false,
  is_live: false,
});

const message = useMessage();
const { restAPI } = useApi();
const isModalVisible = ref(false);
const ytref = ref(null);
const vidref = ref(null);
const textref = ref(null);
const docref = ref(null);
const isLoading = ref(false);
const is_addnew = ref(false);
const lessonData = ref([]);
const childLesson = ref([]);
let lessonDataID = null;

const delref = ref(null);
const deleteAction = ref(null);
const itemId = ref(null);

const activeDropdown = ref(null);
const dropdowns = ref({});

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

async function deleteCLesson(value) {
  const body = { id: value };
  const { data: delData, error } = await restAPI.cms.deleteLesson({
    body,
  });
  if (delData?.value?.status) {
    message.success("Xóa bài học thành công!");
  } else {
    const errorCode = error.value?.data?.error;
    const errorMessage =
      ERROR_CODES[errorCode] ||
      delData?.value?.message ||
      "Đã xảy ra lỗi, vui lòng thử lại!";

    message.warning(errorMessage);
  }
  getLesson();
}

function toggleDropdown(id) {
  for (const key in dropdowns.value) {
    dropdowns.value[key] = false;
  }
  dropdowns.value[id] = !dropdowns.value[id];
}

function addContentToLesson(lessonId, content) {
  lessonDataID = lessonId;
  switch (content) {
    case 1:
      console.log(ytref.value);
      if (ytref.value) {
        ytref.value.setAddNew(true, "");
      }
      break;
    case 2:
      if (vidref.value) {
        vidref.value.setAddNew(true, "");
      }
      break;
    case 3:
      if (textref.value) {
        textref.value.setAddNew(true, "");
      }
      break;
    case 5:
      if (docref.value) {
        docref.value.setAddNew(true, "");
      }
      break;
  }
}

function editContent(contentId, content) {
  console.log(contentId);
  switch (content) {
    case 1:
      if (ytref.value) {
        ytref.value.setAddNew(false, contentId);
      }
      break;
    case 2:
      if (vidref.value) {
        vidref.value.setAddNew(false, contentId);
      }
      break;
    case 3:
      if (textref.value) {
        textref.value.setAddNew(false, contentId);
      }
      break;

    case 5:
      if (docref.value) {
        docref.value.setAddNew(false, contentId);
      }
      break;
  }
}
async function getLesson() {
  const lesson_id = props.lessonId;
  if (!lesson_id) return;

  const { data: resData } = await restAPI.cms.getLessonDetail({
    id: lesson_id,
  });
  if (resData.value?.data?.childrens?.length) {
    childLesson.value = resData.value.data.childrens.map((lesson, index) => ({
      id: lesson.id,
      name: `Bài ${lesson.position}: ${lesson.name}`,
    }));
  } else {
    childLesson.value = [];
  }
}

async function getLessonData() {
  const { data: resData } = await restAPI.cms.getListLessonData({});
  lessonData.value = resData.value.data;
}

const getLessonContent = (lessonId) => {
  return lessonData.value
    .filter((lesson) => lesson.lesson_id === lessonId)
    .map(({ id, name, type, is_live }) => ({ id, name, type, is_live }))
    .sort((a, b) => a.type - b.type);
};

const getContentTypeText = (type) => {
  switch (type) {
    case 1:
      return "Video YouTube: ";
    case 2:
      return "Video: ";
    case 3:
      return "Văn bản: ";
    case 4:
      return "Bài kiểm tra: ";
    case 5:
      return "Tài liệu: ";
    default:
      return "Unknown";
  }
};
function addChildLesson() {
  is_addnew.value = true;
  isModalVisible.value = true;
}
function CancelModal() {
  isModalVisible.value = false;
}

watch(isModalVisible, (newValue, oldValue) => {
  if (!newValue) {
    Object.assign(formValue, {
      id: null,
      name: null,
      position: null,
      free_trial: false,
      is_live: false,
    });
  }
});

async function editCLesson(value) {
  is_addnew.value = false;
  const { data: resData } = await restAPI.cms.getLessonDetail({
    id: value,
  });
  if (resData.value?.status) {
    const data = resData.value?.data;
    formValue.id = data.id;
    formValue.name = data.name;
    formValue.position = data.position;
    formValue.free_trial = data.free_trial || false;
    formValue.is_live = data.is_live || false;
  }
  isModalVisible.value = true;
}
const handleFormSubmit = async (body) => {
  body.lesson_id = lessonDataID;
  if (body.id) {
    await updateLesson(body);
  } else {
    await createLesson(body);
  }
  getLessonData();
};

const createLesson = async (body) => {
  const { data: resCreate, error } = await restAPI.cms.createLessonData({
    body,
  });
  if (resCreate?.value?.status) {
    message.success("Tạo nội dung thành công!");
  } else {
    const errorCode = error.value?.data?.error;
    const errorMessage =
      ERROR_CODES[errorCode] ||
      resCreate?.value?.message ||
      "Đã xảy ra lỗi, vui lòng thử lại!";

    message.warning(errorMessage);
  }
};

const updateLesson = async (body) => {
  let finalBody = [body];
  const { data: resUpdate, error } = await restAPI.cms.updateLessonData({
    body: finalBody,
  });
  if (resUpdate?.value?.status) {
    message.success("Cập nhật nội dung thành công!");
  } else {
    const errorCode = error.value?.data?.error;
    const errorMessage =
      ERROR_CODES[errorCode] ||
      resUpdate?.value?.message ||
      "Đã xảy ra lỗi, vui lòng thử lại!";

    message.warning(errorMessage);
  }
};

async function deleteContent(value) {
  const body = { id: value };
  const { data: delData, error } = await restAPI.cms.deleteLessonData({
    body,
  });
  if (delData?.value?.status) {
    message.success("Xóa nội dung thành công!");
  } else {
    const errorCode = error.value?.data?.error;
    const errorMessage =
      ERROR_CODES[errorCode] ||
      delData?.value?.message ||
      "Đã xảy ra lỗi, vui lòng thử lại!";

    message.warning(errorMessage);
  }
  getLessonData();
}

const handleSubmit = async () => {
  if (isLoading.value) return;
  const { id, position, name, free_trial, is_live } = formValue;
  let body = {
    name,
    position: Number(position),
    free_trial,
    is_live,
  };
  if (id === undefined || id === null || id === "") {
    body.parent_id = props.lessonId;
    const { data: resCreate, error } = await restAPI.cms.createLesson({
      body,
    });
    if (resCreate?.value?.status) {
      message.success("Tạo bài học thành công!");
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
      message.success("Cập nhật bài học thành công!");
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
onMounted(() => {
  getLesson();
  getLessonData();
});
</script>

<template>
  <div class="w-full rounded-b-2xl px-5">
    <nav>
      <div v-for="item in childLesson" :key="item.id">
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
              <p>{{ item.name }}</p>
              <div>
                <button
                  @click="editCLesson(item.id)"
                  class="pr-5 text-green-500 hover:text-green-700"
                >
                  <i class="fas fa-pen-to-square text-sm"></i>
                </button>
                <button
                  @click="
                    showDeleteModal(deleteCLesson, 'Xóa bài học', item.id)
                  "
                  class="text-red-500 hover:text-red-700"
                >
                  <i class="fas fa-trash-alt text-sm"></i>
                </button>
              </div>
            </div>
          </div>
          <ul v-if="dropdowns[item.id]" class="h-full w-full">
            <li @click.stop="toggleDropdown(item.id)">
              <div class="h-full w-full">
                <n-card class="mt-1 bg-gray-50 text-[#133D85]">
                  <div
                    v-for="(content, index) in getLessonContent(item.id)"
                    :key="index"
                    class="pb-2"
                  >
                    <div
                      class="flex w-full items-center justify-between rounded-xl border-2 px-5 py-2 text-lg"
                    >
                      <div class="flex items-center">
                        <span class="pr-1">
                          <i
                            v-if="content.type === 2"
                            class="fa-regular fa-circle-play"
                          ></i>
                          <i
                            v-else-if="content.type === 1"
                            class="fa-brands fa-youtube"
                          ></i>
                          <i
                            v-else-if="content.type === 3"
                            class="fa-solid fa-align-justify"
                          ></i>
                          <i
                            v-else-if="content.type === 4"
                            class="fa-regular fa-file-lines"
                          ></i>
                          <i
                            v-else-if="content.type === 5"
                            class="fa-regular fa-file-lines"
                          ></i>
                          <i
                            v-else-if="content === 'Chọn từ thư viện'"
                            class="fa-regular fa-folder"
                          ></i>
                        </span>
                        <span>
                          {{ getContentTypeText(content.type) }}
                          {{ content.name }}
                        </span>
                      </div>

                      <div>
                        <button
                          @click="editContent(content.id, content.type)"
                          class="pr-5 text-green-500 hover:text-green-700"
                        >
                          <i class="fas fa-regular fa-pen-to-square"></i>
                        </button>
                        <button
                          @click="
                            showDeleteModal(
                              deleteContent,
                              'Xóa nội dung bài học',
                              content.id,
                            )
                          "
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
                        @click="addContentToLesson(item.id, 1)"
                      >
                        <i class="fa-brands fa-youtube pr-1"></i>
                        Video youtube
                      </n-button>
                      <n-button
                        ghost
                        class="h-8 w-40 rounded-lg text-[#133D85]"
                        @click="addContentToLesson(item.id, 2)"
                      >
                        <i class="fa-regular fa-circle-play pr-1"></i>
                        Tải video lên
                      </n-button>
                      <n-button
                        ghost
                        class="h-8 w-40 rounded-lg text-[#133D85]"
                        @click="addContentToLesson(item.id, 3)"
                      >
                        <i class="fa-solid fa-align-justify pr-1"></i>
                        Đoạn văn
                      </n-button>

                      <n-button
                        ghost
                        class="h-8 w-40 rounded-lg text-[#133D85]"
                        @click="addContentToLesson(item.id, 5)"
                      >
                        <i class="fa-regular fa-file-lines pr-1"></i>
                        Tải lên tài liệu
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
    <span class="cursor-pointer text-sm text-[#00A2EB]" @click="addChildLesson">
      + Thêm bài học mới
    </span>
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
              <h1 v-if="is_addnew" class="text-2xl font-bold text-[#133D85]">
                Thêm bài học mới
              </h1>
              <h1 v-else class="text-2xl font-bold text-[#133D85]">
                Chỉnh sửa bài học
              </h1>
              <div class="mt-5"></div>
            </n-gi>
            <n-gi span="1">
              <n-form-item label="Bài thứ:" label-placement="left">
                <n-input
                  placeholder="Nhập số thứ tự của bài"
                  v-model:value="formValue.position"
                ></n-input>
              </n-form-item>
            </n-gi>
            <n-gi span="2">
              <n-form-item label="Tên bài mới:">
                <n-input
                  placeholder="Nhập tên bài"
                  v-model:value="formValue.name"
                ></n-input>
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="Học thử miễn phí" label-placement="left">
                <n-checkbox v-model:checked="formValue.free_trial"></n-checkbox>
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="Trạng thái hoạt động" label-placement="left">
                <n-checkbox v-model:checked="formValue.is_live"></n-checkbox>
              </n-form-item>
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
                :loading="isLoading"
                @click.prevent="handleSubmit"
              >
                Lưu
              </n-button>
            </n-gi>
          </n-grid>
        </n-form>
      </n-modal>
    </n-modal-provider>
    <DaotaoMonhocmoiModalYoutube @submit="handleFormSubmit" ref="ytref" />
    <DaotaoMonhocmoiModalVid @submit="handleFormSubmit" ref="vidref" />
    <DaotaoMonhocmoiModalText @submit="handleFormSubmit" ref="textref" />
    <DaotaoMonhocmoiModalDoc @submit="handleFormSubmit" ref="docref" />
    <DelModal @confirm-delete="handleConfirmDelete" ref="delref" />
  </div>
</template>
