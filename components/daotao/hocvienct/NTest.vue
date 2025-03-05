<script setup>
import { ref, watch, onMounted, reactive, nextTick, toRaw } from "vue";

const Subjectarray = ref([]);
const message = useMessage();
const { restAPI } = useApi();
const dayjs = useDayjs();

const formValue = reactive({
  student_id: null,
  branch_id: null,
  study_goals: null,
  teacher_requirements: null,
  is_online_form: null,
  is_offline_form: null,
  studying_start_date: null,
  subject_ids: null,
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
    studying_start_date,
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
    studying_start_date: dayjs(studying_start_date).isValid()
      ? dayjs(studying_start_date).toISOString()
      : null,
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
  <n-form :model="formValue">
    <div class="w-full rounded-b-2xl bg-white py-5 pl-5 pr-6">
      <n-grid :x-gap="30" cols="1 m:2" responsive="screen">
        <n-gi span="1 m:2">
          <DaotaoHocvienctSchedule />
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
          >
            Lưu
          </n-button>
        </n-gi>
      </n-grid>
    </div>
  </n-form>
</template>
