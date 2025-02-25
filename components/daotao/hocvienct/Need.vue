<script setup>
import { ref, watch, onMounted, reactive, nextTick, toRaw } from "vue";
import { useRoute } from "vue-router";

const message = useMessage();
const emit = defineEmits(["apiSuccess"]);
const route = useRoute();
const dayjs = useDayjs();
const isLoading = ref(false);
const showSpin = ref(false);
const { restAPI } = useApi();

const props = defineProps({
  needId: String, // Existing prop
  branchId: String, // New prop for branch ID
});

const localNeedId = ref("");
const localBranchId = ref("");
const Subjectarray = ref([]);

watch(
  () => props.needId,
  (newVal) => {
    localNeedId.value = newVal || "";
  },
  { immediate: true },
);

watch(
  () => props.branchId,
  (newVal) => {
    localBranchId.value = newVal || "";
  },
  { immediate: true },
);

const formValue = reactive({
  student_id: null,
  branch_id: null,
  study_goals: null,
  teacher_requirements: null,
  is_online_form: null,
  is_offline_form: null,
  // studying_start_date: null,
  subject_ids: [], // Ensuring it's always an array
  time_slots: [
    {
      start_time: null,
      end_time: null,
    },
  ],
  short_shifts: [
    {
      day_of_week: [],
    },
  ],
});

if (localNeedId.value && localNeedId.value !== "") {
  showSpin.value = true;
  const { data: resData } = await restAPI.cms.getStudyNeedDetail({
    id: localNeedId.value,
  });
  if (resData.value?.status) {
    const data = resData.value?.data;
    formValue.student_id = data.student_id || null;
    formValue.id = data.id || null;
    formValue.branch_id = data.branch_id || null;
    formValue.study_goals = data.study_goals || null;
    formValue.subject_ids = Array.isArray(data.subject_ids)
      ? data.subject_ids[0]
      : data.subject_ids;
    console.log(formValue.subject_ids);
    formValue.teacher_requirements = data.teacher_requirements || null;
    formValue.is_online_form = Boolean(data.is_online_form);
    formValue.is_offline_form = Boolean(data.is_offline_form);
    // formValue.studying_start_date = data.studying_start_date
    //   ? new Date(data.studying_start_date).getTime()
    //   : null;
  } else {
    const errorCode = error.value.data.error;
    const errorMessage =
      ERROR_CODES[errorCode] ||
      resVerify.value?.message ||
      "Đã xảy ra lỗi, vui lòng thử lại!";

    message.warning(errorMessage);
  }
  showSpin.value = false;
} else {
  showSpin.value = false;
}

const loadSubjects = async () => {
  try {
    const response = await restAPI.cms.getSubjects({});
    const rawData = toRaw(response.data.value.data);
    if (response.status) {
      Subjectarray.value = rawData
        .map(({ id, name }) => ({
          id,
          name,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } else {
      message.error("Failed to load subjects!");
      Subjectarray.value = [];
    }
  } catch (err) {
    message.error("Error fetching subjects!");
    console.error(err);
    Subjectarray.value = [];
  }
};

const handleSubmit = async (e) => {
  if (isLoading.value) return;

  const {
    id,
    curriculums,
    study_goals,
    teacher_requirements,
    is_online_form,
    is_offline_form,
    // studying_start_date,
    subject_ids,
  } = formValue;
  let body = {
    student_id: route.query.id || null,
    id,
    branch_id: localBranchId.value,
    curriculums,
    study_goals,
    teacher_requirements,
    is_online_form,
    is_offline_form,
    subject_ids: Array.isArray(subject_ids) ? subject_ids : [subject_ids],
    // studying_start_date: dayjs(studying_start_date).isValid()
    //   ? dayjs(studying_start_date).toISOString()
    //   : null,
  };
  try {
    if (localNeedId.value && String(localNeedId.value).trim() !== "") {
      const { data: resUpdate, error } = await restAPI.cms.updateStudyNeed({
        id,
        body,
      });
      if (resUpdate?.value?.status) {
        message.success("Cập nhật nhu cầu học tập thành công!");
      } else {
        const errorCode = error.value.data.error;
        const errorMessage =
          ERROR_CODES[errorCode] ||
          resUpdate.value?.message ||
          "Đã xảy ra lỗi, vui lòng thử lại!";

        message.warning(errorMessage);
      }
    } else {
      const { data: resCreate, error } = await restAPI.cms.createStudyNeed({
        body,
      });
      if (resCreate?.value?.status) {
        message.success("Tạo nhu cầu học tập thành công!");
        emit("apiSuccess");
      } else {
        const errorCode = error.value.data.error;
        const errorMessage =
          ERROR_CODES[errorCode] ||
          resCreate.value?.message ||
          "Đã xảy ra lỗi, vui lòng thử lại!";

        message.warning(errorMessage);
      }
    }
  } catch {
  } finally {
    isLoading.value = false;
  }
};
onMounted(async () => {
  await nextTick();
  loadSubjects();
});
</script>

<template>
  <n-spin :show="showSpin">
    <n-form :model="formValue">
      <div class="w-full rounded-b-2xl bg-white py-5 pl-5 pr-6">
        <n-grid :x-gap="30" cols="1 m:2" responsive="screen">
          <n-gi span="1 m:2">
            <n-form-item label="Môn học *" label-placement="left">
              <n-select
                placeholder="Chọn môn học"
                v-model:value="formValue.subject_ids"
                :options="Subjectarray"
                label-field="name"
                value-field="id"
              />
            </n-form-item>
          </n-gi>
          <n-gi span="1 m:2">
            <n-form-item label="Mục tiêu học tập" path="study_goals">
              <n-input
                placeholder="Mục tiêu học tập"
                v-model:value="formValue.study_goals"
              />
            </n-form-item>
          </n-gi>
          <n-gi span="1 m:2">
            <n-form-item label="Yêu cầu về giáo viên" path="demand">
              <n-input
                placeholder="Yêu cầu về giáo viên"
                v-model:value="formValue.teacher_requirements"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Hình thức học mong muốn" label-placement="left">
              <n-space item-style="display: flex;">
                <n-checkbox
                  label="Học online"
                  v-model:checked="formValue.is_online_form"
                />
                <n-checkbox
                  label="Học offline"
                  v-model:checked="formValue.is_offline_form"
                />
              </n-space>
            </n-form-item>
          </n-gi>
          <n-gi></n-gi>
          <n-gi span="1 m:2">
            <DaotaoHocvienctSchedule
              v-model:timeSlots="formValue.time_slots"
              v-model:shortShifts="formValue.short_shifts"
            />
            <!-- v-model:Shift="shift"
              v-model:listChecked="listChecked" -->
          </n-gi>
          <n-gi span="1 m:2" class="mt-2">
            <n-form-item label="Ghi chú" path="note">
              <n-input placeholder="Ghi chú" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-button
              round
              type="info"
              class="h-12 w-52 rounded-2xl text-lg"
              @click.prevent="handleSubmit"
              :loading="isLoading"
            >
              Lưu
            </n-button>
          </n-gi>
        </n-grid>
      </div>
    </n-form>
  </n-spin>
</template>
