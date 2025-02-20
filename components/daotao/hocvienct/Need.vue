<script setup>
import { ref, watch, onMounted, reactive } from "vue";
import { message } from "ant-design-vue";
import { useRoute } from "vue-router";

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
  id: null,
  branch_id: null,
  study_goals: null,
  teacher_requirements: null,
  is_online_form: null,
  is_offline_form: null,
  studying_start_date: null,
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
    formValue.teacher_requirements = data.teacher_requirements || null;
    formValue.is_online_form = Boolean(data.is_online_form);
    formValue.is_offline_form = Boolean(data.is_offline_form);
    formValue.studying_start_date = data.studying_start_date
      ? new Date(data.studying_start_date).getTime()
      : null;
  } else {
    console.warn("No matching data found for localNeedId:", localNeedId.value);
  }
  showSpin.value = false;
} else {
  showSpin.value = false;
}

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
        message.error(error.value.data.error);
      }
    } else {
      const { data: resCreate, error } = await restAPI.cms.createStudyNeed({
        body,
      });
      if (resCreate?.value?.status) {
        message.success("Tạo nhu cầu học tập thành công!");
        emit("apiSuccess");
      } else {
        message.error(error.value.data.error);
      }
    }
  } catch {
  } finally {
    isLoading.value = false;
  }
};
onMounted(async () => {});
</script>

<template>
  <n-spin :show="showSpin">
    <n-form :model="formValue">
      <div class="w-full rounded-b-2xl bg-white py-5 pl-5 pr-6">
        <n-grid :x-gap="30" cols="1 m:2" responsive="screen">
          <n-gi span="1 m:2">
            <n-form-item
              label="Chương trình học, môn học *"
              label-placement="left"
            >
              <n-select
                placeholder="Chọn môn học"
                v-model:value="formValue.subjects"
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
          <n-gi>
            <n-form-item
              label="Ngày mong muốn bắt đầu học:"
              label-placement="left"
            >
              <n-date-picker
                v-model:value="formValue.studying_start_date"
                type="date"
                placeholder="Chọn ngày"
              />
            </n-form-item>
          </n-gi>

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
              @click="handleSubmit"
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
