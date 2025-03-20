<script setup>
import { NModal } from "naive-ui";
import { reactive, ref, watch, nextTick, onMounted } from "vue";
import { useRoute } from "vue-router";

const message = useMessage();
const { restAPI } = useApi();
const route = useRoute();
const isModalVisible = ref(false);
const isLessonVisible = ref(false);
const is_addnew = ref(false);
const lessonarray = ref([]);
const componentKey = ref(0);

const refreshComponent = () => {
  componentKey.value += 1;
};

const formValue = reactive({
  id: null,
  name: null,
  subject_id: computed(() => route.query.id || null),
  child_lessons: [],
});

const lessondate = reactive({
  name: null,
  free_trial: false,
});

//child_lessons__________________________________________________________________________
const addchildLesson = (customLesson = {}) => {
  formValue.child_lessons.push({
    name: customLesson.name ?? null,
    position: formValue.child_lessons.length + 1,
    subject_id: route.query.id || null,
    free_trial: customLesson.free_trial ?? false,
    is_live: customLesson.is_live ?? false,
  });

  isLessonVisible.value = false;
};
const removeLesson = (value) => {
  if (formValue.child_lessons.length > 0) {
    formValue.child_lessons.splice(value, 1);
  }
};
//___________________________________________________________________________________

//Dropdown___________________________________________________________________________
const dropdowns = reactive({
  lesson: true,
});
const activeDropdown = ref("lesson");
const toggleDropdown = (menu) => {
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

function showChapterModal() {
  is_addnew.value = true;
  isModalVisible.value = true;
}
//___________________________________________________________________________________

//Modal______________________________________________________________________________
const delref = ref(null);
const deleteAction = ref(null);
const itemId = ref(null);

const handleConfirmDelete = () => {
  if (deleteAction.value && itemId.value !== null) {
    deleteAction.value(itemId.value);
    itemId.value = null;
    deleteAction.value = null;
  }
};

const showDeleteModal = (action, title, id) => {
  deleteAction.value = action;
  itemId.value = id;
  if (delref.value) {
    delref.value.setAddNew(title);
  }
};

function CancelModal() {
  isModalVisible.value = false;
}
watch(isModalVisible, (newValue, oldValue) => {
  if (!newValue) {
    Object.assign(formValue, {
      id: null,
      name: null,
      child_lessons: [],
    });
  }
});

watch(isLessonVisible, (newValue, oldValue) => {
  if (!newValue) {
    Object.assign(lessondate, {
      name: null,
      free_trial: false,
    });
  }
});

function CancelLModal() {
  isLessonVisible.value = false;
}
//___________________________________________________________________________________

//Data_______________________________________________________________________________
async function getLesson() {
  const lesson_id = route.query.id;
  if (!lesson_id) return;

  try {
    const { data: resData } = await restAPI.cms.getListLesson({
      id: lesson_id,
    });

    lessonarray.value = resData.value.data.map((lesson, index) => ({
      stt: index,
      id: lesson.id,
      name: lesson.name,
    }));
  } catch (error) {
    console.error("Error fetching lesson data:", error);
  }
}
//___________________________________________________________________________________

//Function___________________________________________________________________________
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

async function editSubject(value) {
  is_addnew.value = false;
  const { data: resData } = await restAPI.cms.getLessonDetail({
    id: value,
  });
  if (resData.value?.status) {
    const data = resData.value?.data;
    formValue.id = data.id;
    formValue.name = data.name;
    formValue.child_lessons = data.childrens
      ? data.childrens.map((child) => ({
          id: child.id,
          name: child.name,
          position: child.position,
          is_live: child.is_live,
        }))
      : [];
  }
  isModalVisible.value = true;
}
//___________________________________________________________________________________

async function handleSubmit() {
  const { id, name, subject_id, child_lessons } = formValue;
  let body = {
    name,
    subject_id,
    child_lessons,
  };
  if (id === null) {
    const { data: resCreate, error } = await restAPI.cms.createLesson({
      body,
    });
    if (resCreate?.value?.status) {
      message.success("Tạo chương thành công!");
      isModalVisible.value = false;
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
    //loop through child_lessons and update child_lessons
    if (resUpdate?.value?.status) {
      if (body.child_lessons && Array.isArray(body.child_lessons)) {
        for (const child of body.child_lessons) {
          try {
            child.parent_id = id; // Ensure the child is linked to the parent lesson

            if (child.id) {
              // Update existing child lesson
              const { data: resChildUpdate, error: childError } =
                await restAPI.cms.updateLesson({ body: [child] });

              if (!resChildUpdate?.value?.status) {
                console.warn(
                  `Failed to update child lesson ${child.id}:`,
                  childError?.value,
                );
              }
            } else {
              // Create new child lesson
              child.parent_id = id;
              const { data: resChildCreate, error: childCreateError } =
                await restAPI.cms.createLesson({ body: child });

              if (!resChildCreate?.value?.status) {
                console.warn(
                  `Failed to create child lesson:`,
                  childCreateError?.value,
                );
              } else {
              }
            }
          } catch (err) {
            console.error(
              `Error processing child lesson ${child.id || "(new)"}:`,
              err,
            );
          }
        }
      }
      message.success("Cập nhật chương thành công!");
      isModalVisible.value = false;
    } else {
      const errorCode = error.value?.data?.error;
      const errorMessage =
        ERROR_CODES[errorCode] ||
        resUpdate?.value?.message ||
        "Đã xảy ra lỗi, vui lòng thử lại!";

      message.warning(errorMessage);
    }
  }
  getLesson();
  refreshComponent();
}

onMounted(async () => {
  await nextTick();
  getLesson();
});

const getPlaceholder = (item) => {
  return item.is_live === true ? "Nhập tên buổi học" : "Nhập tên bài học";
};
</script>
<template>
  <div class="px-5">
    <div v-for="item in lessonarray" :key="item.id">
      <div>
        <li
          :class="[
            'cursor-pointer py-2',
            activeDropdown === `lesson-${item.stt}`
              ? 'text-[#133D85]'
              : 'text-gray-600',
          ]"
          @click="toggleDropdown(`lesson-${item.stt}`)"
        >
          <div
            :class="[
              'flex h-full w-full items-center justify-between rounded-2xl bg-gray-200',
              activeDropdown === `lesson-${item.stt}`
                ? 'text-[#133D85]'
                : 'text-gray-600',
            ]"
          >
            <div
              class="my-2 flex h-full w-full items-center justify-between px-5"
            >
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-folder"></i>
                <p>{{ item.name }}</p>
              </div>
              <div>
                <button
                  @click.stop="editSubject(item.id)"
                  class="pr-5 text-green-500 hover:text-green-700"
                >
                  <i class="fas fa-regular fa-pen-to-square"></i>
                </button>
                <button
                  @click.stop="
                    showDeleteModal(deleteLesson, 'Xóa chương', item.id)
                  "
                  class="text-red-500 hover:text-red-700"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </li>
        <div class="-mt-2" v-if="activeDropdown === `lesson-${item.stt}`">
          <!-- Content to be shown when active -->
          <div class="mt-2 border-b-2"></div>
          <DaotaoMonhocmoiNewsub :lessonId="item.id" :key="componentKey" />
          <div class="border-b-2"></div>
        </div>
      </div>
    </div>
    <n-button
      round
      type="info"
      class="mt-2 h-12 w-48 rounded-2xl text-xl"
      @click="showChapterModal"
    >
      Thêm mới
      <i class="fa-solid fa-plus ml-3"></i>
    </n-button>
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
            <h1 v-if="is_addnew" class="text-2xl font-bold text-[#133D85]">
              Thêm chương mới
            </h1>
            <h1 v-else class="text-2xl font-bold text-[#133D85]">
              Chỉnh sửa chương
            </h1>
            <div class="mt-5"></div>
          </n-gi>
          <n-gi span="2">
            <n-form-item label="Tên chương mới:">
              <n-input
                v-model:value="formValue.name"
                placeholder="Nhập tên chương"
              ></n-input>
            </n-form-item>
          </n-gi>
          <n-gi span="2">
            <n-gi span="2">
              <n-form-item label="Thêm các bài học nằm trong chương này">
                <p class="-mt-6 text-[#4D6FA8]">
                  Nhập tên bài học trước và thêm nội dung chi tiết từng bài học
                  ở bước sau
                </p>
              </n-form-item>
            </n-gi>
            <n-gi span="2" class="-mt-8 mb-5">
              <n-grid
                cols="15"
                :x-gap="20"
                v-for="(item, index) in formValue.child_lessons"
                :key="index"
              >
                <n-gi span="14" class="mb-2">
                  <n-input
                    v-model:value="item.name"
                    :placeholder="getPlaceholder(item)"
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
            <n-gi span="2" class="mb-5">
              <span
                class="cursor-pointer text-sm text-[#00A2EB]"
                @click="isLessonVisible = true"
              >
                + Thêm buổi học mới
              </span>
            </n-gi>
            <n-modal
              v-model:show="isLessonVisible"
              preset="card"
              style="max-width: 460px"
              :header-style="{ padding: '10px' }"
              :closable="false"
            >
              <n-grid cols="2" :x-gap="20">
                <n-gi span="2">
                  <h1 class="text-2xl font-bold text-[#133D85]">
                    Thêm buổi học
                  </h1>
                </n-gi>
                <!-- Note: rules -->
                <n-gi span="2">
                  <n-form-item label="Tiêu đề buổi học:">
                    <n-input
                      v-model:value="lessondate.name"
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
                      v-model:checked="lessondate.free_trial"
                    ></n-checkbox>
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-button
                    ghost
                    class="h-12 w-full rounded-2xl text-lg"
                    @click="CancelLModal"
                  >
                    Hủy
                  </n-button>
                </n-gi>
                <n-gi>
                  <n-button
                    round
                    type="info"
                    class="h-12 w-full rounded-2xl text-lg"
                    @click="
                      addchildLesson({
                        name: lessondate.name,
                        free_trial: lessondate.free_trial,
                        is_live: true,
                      })
                    "
                  >
                    Lưu
                  </n-button>
                </n-gi>
              </n-grid>
            </n-modal>
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
              @click="handleSubmit"
            >
              Lưu
            </n-button>
          </n-gi>
        </n-grid>
      </n-form>
    </n-modal>
    <DelModal @confirm-delete="handleConfirmDelete" ref="delref" />
  </div>
</template>
