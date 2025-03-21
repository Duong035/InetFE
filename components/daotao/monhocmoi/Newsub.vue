<script setup>
import { NModal } from "naive-ui";
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";

const props = defineProps({
  lessonId: String,
  correctSubjectId: String,
});

//1: youtube video, 2: s3 video, 3: text, 4: test, 5: document

const route = useRoute();
const message = useMessage();
const { restAPI } = useApi();
const isModalVisible = ref(false);

const ytref = ref(null);
const vidref = ref(null);
const textref = ref(null);
const docref = ref(null);
const isLoading = ref(false);
const is_addnew = ref(false);
const isModal = ref(null);

const lessonData = ref([]);
const childLesson = ref([]);
let lessonDataID = null;

// const pageName = computed(() => route.path.split("/")[2]);

const formValue = reactive({
  id: null,
  name: null,
  subject_id: null,
  position: null,
  free_trial: false,
  is_live: false,
});

//Dropdown___________________________________________________________________________
const activeDropdown = ref(null);
const dropdowns = ref({});
function toggleDropdown(id) {
  if (dropdowns.value[id]) {
    dropdowns.value[id] = false;
  } else {
    for (const key in dropdowns.value) {
      dropdowns.value[key] = false;
    }
    dropdowns.value[id] = true;
  }
}

//___________________________________________________________________________________

//DeleteFunc_________________________________________________________________________
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
//___________________________________________________________________________________

//DataFunc___________________________________________________________________________
function addContentToLesson(lessonId, content) {
  lessonDataID = lessonId;
  switch (content) {
    case 1:
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
      name: lesson.name,
      is_live: lesson.is_live,
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
async function editCLesson(id, is_live, value) {
  const state = is_live ? "buoihoc" : "baihoc";
  showModal(state, value);
  const { data: resData } = await restAPI.cms.getLessonDetail({
    id: id,
  });
  if (resData.value?.status) {
    const data = resData.value?.data;
    formValue.id = data.id;
    formValue.name = data.name;
    formValue.position = data.position;
    formValue.subject_id = data.SubjectId;
    formValue.free_trial = data.free_trial || false;
    formValue.is_live = data.is_live || false;
  }
}
//___________________________________________________________________________________

//Modal______________________________________________________________________________
const child_lessons = ref([]);
const lessondate = reactive({
  name: null,
  free_trial: false,
});

const addchildLesson = (customLesson = {}) => {
  child_lessons.value.push({
    name: customLesson.name ?? null,
    position: childLesson.value.length + 1,
    parent_id: props.lessonId,
    subject_id: props.correctSubjectId || null,
    free_trial: customLesson.free_trial ?? false,
    is_live: customLesson.is_live ?? false,
  });
};
const removeLesson = (value) => {
  if (child_lessons.value.length > 0) {
    child_lessons.value.splice(value, 1);
  }
};

function showModal(source, isnew) {
  isModal.value = source;
  if (isModal.value == "baihoc") addchildLesson();
  is_addnew.value = isnew;
  isModalVisible.value = true;
}
function CancelModal() {
  isModalVisible.value = false;
}
watch(isModalVisible, (newValue, oldValue) => {
  if (!newValue) {
    child_lessons.value = [];
    Object.assign(lessondate, {
      name: null,
      free_trial: false,
    });
  }
});
//___________________________________________________________________________________

//Submit_____________________________________________________________________________
const handleFormSubmit = async (body) => {
  body.lesson_id = lessonDataID;
  if (body.id) {
    await updateLessondata(body);
  } else {
    await createLessondata(body);
  }
  getLessonData();
};

const createLessondata = async (body) => {
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

const updateLessondata = async (body) => {
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

const handleSubmit = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  if (isModal.value == "buoihoc") {
    addchildLesson({
      name: lessondate.name,
      free_trial: lessondate.free_trial,
      is_live: true,
    });
  }
  if (is_addnew.value) {
    for (const lesson of child_lessons.value) {
      try {
        const { data: resCreate } = await restAPI.cms.createLesson({
          body: lesson,
        });
      } catch (err) {
        console.error(`Error creating lesson ${lesson.name}:`, err);
      }
      message.success("Tạo bài học thành công!");
    }
  } else {
    const body = [{ ...formValue }];
    const { data: resUpdate, error } = await restAPI.cms.updateLesson({ body });
    if (resUpdate?.value?.status) {
      message.success(
        formValue.is_live
          ? "Tạo buổi học thành công!"
          : "Tạo bài học thành công!",
      );
    } else {
      const errorCode = error.value?.data?.error;
      console.log("error", errorCode);
      const errorMessage =
        ERROR_CODES[errorCode] ||
        resUpdate?.value?.message ||
        "Đã xảy ra lỗi, vui lòng thử lại!";
      message.warning(errorMessage);
    }
  }
  isModalVisible.value = false;
  getLesson();
  isLoading.value = false;
};
//___________________________________________________________________________________

//Computed___________________________________________________________________________
const sortedChildLesson = computed(() => {
  if (!childLesson.value || childLesson.value.length === 0) return [];

  return childLesson.value
    .slice()
    .sort((a, b) => (b.is_live ? 1 : -1) - (a.is_live ? 1 : -1));
});

const caseDisplay = computed(() => {
  if (!isModal.value) return "Không có dữ liệu";

  const type = isModal.value === "baihoc" ? "bài học" : "buổi học";
  const status = is_addnew.value ? "Thêm" : "Chỉnh sửa";

  return `${status} ${type}`;
});

const currentLesson = computed({
  get: () => (is_addnew.value ? lessondate : formValue),
  set: (newValue) => {
    if (is_addnew.value) {
      Object.assign(lessondate, newValue);
    } else {
      Object.assign(formValue, newValue);
    }
  },
});
//___________________________________________________________________________________

onMounted(() => {
  console.log(props.correctSubjectId);
  getLesson();
  getLessonData();
});
</script>

<template>
  <div class="w-full rounded-b-2xl px-5">
    <nav>
      <div v-for="item in sortedChildLesson" :key="item.id">
        <li
          :class="[
            'py-2',
            activeDropdown === `${item.id}`
              ? 'text-[#133D85]'
              : 'text-gray-600',
            !item.is_live ? 'cursor-pointer' : '',
          ]"
          @click="!item.is_live && toggleDropdown(item.id)"
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
              <div class="flex items-center gap-2 text-[#133D85]">
                <i
                  v-if="item.is_live"
                  class="fa-solid fa-person-chalkboard text-sm"
                ></i>
                <i v-else class="fa-solid fa-book-open text-sm"></i>
                <p>{{ item.name }}</p>
              </div>
              <div>
                <button
                  @click.stop="editCLesson(item.id, item.is_live, false)"
                  class="pr-5 text-green-500 hover:text-green-700"
                >
                  <i class="fas fa-pen-to-square text-sm"></i>
                </button>
                <button
                  @click.stop="
                    showDeleteModal(
                      deleteCLesson,
                      item.is_live ? 'Xóa buổi học' : 'Xóa bài học ',
                      item.id,
                    )
                  "
                  class="text-red-500 hover:text-red-700"
                >
                  <i class="fas fa-trash-alt text-sm"></i>
                </button>
              </div>
            </div>
          </div>
          <ul v-if="dropdowns[item.id]" class="h-full w-full">
            <li @click.stop="toggleDropdown(item.id)" class="cursor-default">
              <div class="h-full w-full">
                <n-card class="mt-1 bg-gray-50 text-[#133D85]" @click.stop>
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
    <span
      class="cursor-pointer text-sm text-[#00A2EB]"
      @click="showModal('baihoc', true)"
    >
      + Thêm bài học mới </span
    ><br />
    <span
      class="cursor-pointer text-sm text-[#00A2EB]"
      @click="showModal('buoihoc', true)"
    >
      + Thêm buổi học mới
    </span>
    <n-modal-provider>
      <n-modal
        v-model:show="isModalVisible"
        preset="card"
        style="max-width: 600px"
        :header-style="{ padding: '10px' }"
        :closable="false"
      >
        <n-form>
          <n-grid cols="2" :x-gap="20">
            <n-gi span="2">
              <n-form-item :show-feedback="false" :show-label="false">
                <h1 class="text-2xl font-bold text-[#133D85]">
                  {{ caseDisplay }}
                </h1>
              </n-form-item>
              <!-- baihocmodal -->
              <n-grid cols="2" :x-gap="20" v-if="isModal == 'baihoc'">
                <n-gi span="2" v-if="is_addnew">
                  <n-gi span="2">
                    <n-form-item
                      label="Thêm các bài học nằm trong chương này"
                      :label-style="{ fontSize: '20px' }"
                    >
                      <p class="-mt-6 text-[#4D6FA8]">
                        Nhập tên bài học trước và thêm nội dung chi tiết từng
                        bài học ở bước sau
                      </p>
                    </n-form-item>
                  </n-gi>
                  <n-gi span="2" class="-mt-8 mb-5">
                    <n-grid
                      cols="15"
                      :x-gap="20"
                      v-for="(item, index) in child_lessons"
                      :key="index"
                    >
                      <n-gi span="14" class="mb-2">
                        <n-input
                          v-model:value="item.name"
                          placeholder="Nhập"
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
                  <n-gi span="2" class="mb-1">
                    <span
                      class="cursor-pointer text-sm text-[#00A2EB]"
                      @click="addchildLesson"
                    >
                      + Thêm bài học mới
                    </span>
                  </n-gi>
                </n-gi>
                <n-gi span="2" v-else>
                  <n-gi span="2" class="mb-2">
                    <n-form-item label="Tên bài học">
                      <n-input
                        v-model:value="formValue.name"
                        placeholder="Nhập tên bài học"
                      ></n-input>
                    </n-form-item>
                  </n-gi>
                  <n-gi span="2">
                    <n-form-item
                      label="Cho phép học thử"
                      label-placement="left"
                      :show-feedback="false"
                    >
                      <n-checkbox
                        v-model:checked="formValue.free_trial"
                      ></n-checkbox>
                    </n-form-item>
                  </n-gi>
                </n-gi>
              </n-grid>
              <!-- buoihocmodal -->
              <n-grid cols="2" :x-gap="20" v-else>
                <n-gi span="2">
                  <n-form-item label="Tiêu đề buổi học:">
                    <n-input
                      v-model:value="currentLesson.name"
                      placeholder="Nhập tiêu đề buổi học"
                    ></n-input>
                  </n-form-item>
                </n-gi>
                <n-gi span="2">
                  <n-form-item
                    label="Cho phép học thử"
                    label-placement="left"
                    :show-feedback="false"
                  >
                    <n-checkbox
                      v-model:checked="currentLesson.free_trial"
                    ></n-checkbox>
                  </n-form-item>
                </n-gi>
              </n-grid>
            </n-gi>

            <n-gi>
              <n-button
                ghost
                class="h-12 w-full rounded-2xl text-lg text-blue-400"
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
