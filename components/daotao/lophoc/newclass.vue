<script setup lang="ts">
import { ref, onMounted } from "vue";
import { message } from "ant-design-vue";
import { useRouter, useRoute } from "vue-router";
import dayjs from "dayjs";

const subjects = ref<{ label: string; value: string }[]>([]);
const branches = ref<{ label: string; value: string }[]>([]);
const { restAPI } = useApi();
const isSubmitting = ref(false);
const route = useRoute();
const formValue = ref({
  id: null as string | null,
  image: "",
  className: "",
  classCode: "",
  studyMode: null as number | null,
  subjects: "",
  branches: "",
  startDate: null as number | null,
  endDate: null as number | null,
  description: "",
});

const handleSubmit = async () => {
  isSubmitting.value = true;

  try {
    console.log("Giá trị form trước khi gửi:", formValue.value);

    let payload = {
      type: formValue.value.studyMode,
      branch_id: formValue.value.branches,
      subject_id: formValue.value.subjects,
      code: formValue.value.classCode,
      name: formValue.value.className,
      start_at: formValue.value.startDate
        ? new Date(formValue.value.startDate).toISOString()
        : null,
      end_at: formValue.value.endDate
        ? new Date(formValue.value.endDate).toISOString()
        : null,
      description: formValue.value.description,
      group_url: "",
    };

    console.log("Payload gửi lên API:", payload);

    const { data: resData, error } = await restAPI.cms.createClass({
      body: JSON.stringify(payload), // Ensure body is set
    });

    console.log(resData);
    if (error?.value) {
      message.error(error?.value?.data?.message || "Lỗi khi tạo lớp học");
      return;
    }

    message.success("Tạo lớp học thành công!");

    // Reset form sau khi gửi thành công
    formValue.value = {
      id: null,
      image: "",
      studyMode: null,
      subjects: "",
      classCode: "",
      className: "",
      startDate: null,
      endDate: null,
      description: "",
      branches: "",
    };
  } catch (err) {
    console.error("Lỗi khi gửi dữ liệu:", err);
    message.error("Lỗi khi gửi dữ liệu.");
  } finally {
    isSubmitting.value = false;
  }
};

// lấy danh sách môn học
onMounted(async () => {
  try {
    const { data: resData, error } = await restAPI.cms.getSubjects({});

    if (error?.value) {
      message.error(error?.value?.data?.message || "Lỗi tải dữ liệu");
      return;
    }

    subjects.value =
      resData.value?.data?.subjects?.map((subjects: any) => ({
        label: subjects.name,
        value: subjects.id,
      })) || [];
  } catch (err) {
    console.error("Lỗi khi tải danh sách môn học:", err);
  }
});
// lấy danh sách chi nhánh
onMounted(async () => {
  try {
    const { data: resData, error } = await restAPI.cms.getBranches({});

    if (error?.value) {
      message.error(error?.value?.data?.message || "Lỗi tải dữ liệu");
      return;
    }

    if (
      !resData.value ||
      !resData.value.data ||
      !Array.isArray(resData.value.data)
    ) {
      console.error("Dữ liệu API không hợp lệ:", resData.value);
      return;
    }

    branches.value = resData.value.data.map((branch: any) => ({
      label: branch.address,
      value: branch.id,
    }));
  } catch (err) {
    console.error("Lỗi khi tải danh sách chi nhánh:", err);
  }

  // lấy thông tin môn học theo id
  onMounted(async () => {
    if (!formValue.value.id) return; // Nếu không có ID, không gọi API
    console.log("ID lớp học:", formValue.value.id);
    try {
      const { data: resData } = await restAPI.cms.getClassById({
        id: formValue.value.id,
      });
      console.log("Thông tin lớp học:", resData);

      if (resData.value?.status) {
        const data = resData.value?.data?.entry;

        formValue.value = {
          id: data?.id || null,
          image: data?.image || "",
          className: data?.name || "",
          classCode: data?.code || "",
          studyMode: data?.type || null,
          subjects: data?.subject_id || "",
          branches: data?.branch_id || "",
          startDate: data?.start_at ? dayjs(data?.start_at).valueOf() : null,
          endDate: data?.end_at ? dayjs(data?.end_at).valueOf() : null,
          description: data?.description || "",
        };
      } else {
        message.error("Không tìm thấy thông tin lớp học.");
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin lớp học:", error);
      message.error("Lỗi khi tải thông tin lớp học.");
    }
  });
});
</script>

<template>
  <n-form class="rounded-lg bg-white p-5 shadow-md">
    <h2 class="text-lg font-semibold">Thông tin cơ bản</h2>

    <!-- Ảnh đại diện lớp học -->
    <div class="rounded-lg bg-white p-5 shadow-md">
      <div class="flex items-center gap-5">
        <!-- Ảnh đại diện lớp học -->
        <div class="w-1/3">
          <p class="mb-2">Ảnh đại diện lớp học</p>
          <div class="relative h-24 w-40 overflow-hidden rounded-md border">
            <img
              src="../../../public/images/subject.png"
              class="h-full w-full object-cover"
              alt="Class Avatar"
            />
            <button
              class="absolute bottom-2 right-2 rounded-full bg-blue-500 p-1 text-white"
            >
              <i class="fas fa-pencil-alt"></i>
            </button>
          </div>
          <p class="mt-1 text-xs text-gray-500">
            Cho phép ảnh jpeg, jpg, png. Size ảnh tối đa 3.1 MB
          </p>
        </div>

        <!-- Hình thức học -->
        <n-form-item label="Hình thức học *" class="flex-1">
          <n-radio-group v-model:value="formValue.studyMode">
            <n-radio :value="1">Học offline</n-radio>
            <n-radio :value="2">Học online</n-radio>
            <n-radio :value="3">Học hybrid</n-radio>
          </n-radio-group>
        </n-form-item>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-4">
        <!-- Mã lớp học -->
        <n-form-item label="Mã lớp học *">
          <n-input
            v-model:value="formValue.classCode"
            placeholder="Nhập mã lớp học"
          />
        </n-form-item>

        <!-- Tên lớp học -->
        <n-form-item label="Tên lớp học *">
          <n-input
            v-model:value="formValue.className"
            placeholder="Nhập tên lớp học"
          />
        </n-form-item>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-4">
        <!-- Ngày khai giảng -->
        <n-form-item label="Ngày khai giảng *">
          <n-date-picker
            v-model:value="formValue.startDate"
            type="date"
            placeholder="Chọn ngày"
            format="dd-MM-yyyy"
            value-format="yyyy-MM-dd"
          />
        </n-form-item>

        <!-- Ngày kết thúc -->
        <n-form-item label="Ngày kết thúc">
          <n-date-picker
            v-model:value="formValue.endDate"
            type="date"
            placeholder="Chọn ngày"
            format="dd-MM-yyyy"
            value-format="yyyy-MM-dd"
          />
        </n-form-item>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-4">
        <n-form-item label="Môn học *">
          <n-select
            v-model:value="formValue.subjects"
            :options="subjects"
            placeholder="Chọn môn học"
          />
        </n-form-item>
        <n-form-item label="Chi nhánh *">
          <n-select
            v-model:value="formValue.branches"
            :options="branches"
            placeholder="Chọn chi nhánh"
          />
        </n-form-item>
      </div>

      <n-form-item label="Mô tả" class="mt-4">
        <n-input
          v-model:value="formValue.description"
          type="textarea"
          placeholder="Nhập mô tả"
        />
      </n-form-item>
    </div>
    <!-- Nút Lưu -->
    <div class="m-4 ml-60 mr-60">
      <n-button
        type="primary"
        block
        :loading="isSubmitting"
        @click="handleSubmit"
      >
        Lưu
      </n-button>
    </div>
  </n-form>
</template>
