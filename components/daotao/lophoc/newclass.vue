<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { message } from "ant-design-vue";
import { useRoute } from "vue-router";
import dayjs from "dayjs";

// API
const { restAPI } = useApi();

// Interface
interface ClassData {
  id: String | null;
  image: string;
  className: string;
  classCode: string;
  studyMode: number | null;
  subjects: string;
  branches: string;
  startDate: number | null;
  endDate: number | null;
  description: string;
}

// Dữ liệu reactive
const route = useRoute();
const isSubmitting = ref(false);
const subjects = ref<{ label: string; value: string }[]>([]);
const branches = ref<{ label: string; value: string }[]>([]);
const newId = route.query.id;

// Giá trị form
const formValue = ref<ClassData>({
  id: null,
  image: "",
  className: "",
  classCode: "",
  studyMode: null,
  subjects: "",
  branches: "",
  startDate: null,
  endDate: null,
  description: "",
});

//  HÀM LẤY THÔNG TIN LỚP HỌC THEO ID
const fetchClassData = async () => {
  try {
    const { data: resData } = await restAPI.cms.getClassById({
      id: newId,
    });

    if (resData.value?.status) {
      console.log("Dữ liệu lớp học:", resData);
      const data = resData.value?.data;

      formValue.value.id = data?.id || null;
      formValue.value.image = data?.image || "";
      formValue.value.className = data?.name || "";
      formValue.value.classCode = data?.code || "";
      formValue.value.studyMode = data?.type || null;
      formValue.value.subjects = data?.subject?.id || "";
      formValue.value.branches = data?.branch?.id || "";
      formValue.value.startDate = data?.start_at
        ? dayjs(data?.start_at).valueOf()
        : null;
      formValue.value.endDate = data?.end_at
        ? dayjs(data?.end_at).valueOf()
        : null;
      formValue.value.description = data?.description || "";
    } else {
      message.warning("Không tìm thấy thông tin lớp học.");
    }
  } catch (error) {
    console.error("Lỗi khi tải thông tin lớp học:", error);
    message.error("Lỗi khi tải thông tin lớp học.");
  }
};

//  HÀM LẤY DANH SÁCH MÔN HỌC
const fetchSubjects = async () => {
  try {
    const { data: resData, error } = await restAPI.cms.getSubjects({});
    if (error?.value) {
      message.error(error?.value?.data?.message || "Lỗi tải dữ liệu môn học");
      return;
    }

    subjects.value =
      resData.value?.data?.subjects?.map((subject: any) => ({
        label: subject.name,
        value: subject.id,
      })) || [];
  } catch (err) {
    console.error("Lỗi khi tải danh sách môn học:", err);
  }
};

//  HÀM LẤY DANH SÁCH CHI NHÁNH
const fetchBranches = async () => {
  try {
    const { data: resData, error } = await restAPI.cms.getBranches({});
    if (error?.value) {
      message.error(
        error?.value?.data?.message || "Lỗi tải danh sách chi nhánh",
      );
      return;
    }

    branches.value =
      resData.value?.data?.map((branch: any) => ({
        label: branch.address,
        value: branch.id,
      })) || [];
  } catch (err) {
    console.error("Lỗi khi tải danh sách chi nhánh:", err);
  }
};

//  HÀM TẠO HOẶC CẬP NHẬT LỚP HỌC
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
      body: JSON.stringify(payload),
    });

    if (error?.value) {
      message.error(error?.value?.data?.message || "Lỗi khi tạo lớp học");
      return;
    }

    message.success("Tạo lớp học thành công!");
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

// CHẠY CÁC HÀM KHI COMPONENT ĐƯỢC MOUNTED
onMounted(() => {
  fetchSubjects();
  fetchBranches();
  console.log("ID lớp học0:", newId);

  fetchClassData();
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
