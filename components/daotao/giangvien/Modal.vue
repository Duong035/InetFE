<script setup>
import { ref, watch, nextTick, defineExpose } from "vue";
const { restAPI } = useApi();
const emit = defineEmits(["submit"]);
const isModalVisible = ref(false);
const is_addnew = ref(true);
const setAddNew = (value) => {
  isModalVisible.value = true;
  is_addnew.value = value;
};
defineExpose({ setAddNew });

const formRef = ref();
const isLoading = ref(false);
const formValue = reactive({
  id: "",
  full_name: "",
  email: "",
  type: "",
  branch_id: "",
  organ_struct_id: null,
  position: "",
  username: "",
  password: "",
  introduction: "",
  permission_grp_id: "",
  is_active: true,
  avatar: "",
  salary_type: null,
  salary: 0,
  role_id: 4,
});

const rules = {
  full_name: {
    required: true,
    message: "Please input full name",
    trigger: "blur",
  },
  position: {
    required: true,
    message: "Please select position",
    trigger: "blur",
  },
  email: {
    required: true,
    trigger: ["blur", "input"],
    validator: (rule, value) => {
      const emailRegex =
        /^[a-zA-Z0-9]+(?:[._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9.]+\.[a-zA-Z]{2,}$/;
      return new Promise((resolve, reject) => {
        if (!value) reject(Error("Email không được để trống."));
        else if (value.length > 100)
          reject(Error("Email nhập không vượt quá 100 ký tự."));
        else if (!emailRegex.test(value))
          reject(Error("Email nhập không đúng định dạng."));
        else resolve();
      });
    },
  },
  phone: {
    required: true,
    message: "Please input phone number",
    trigger: "blur",
  },
  username: {
    required: true,
    message: "Please input username",
    trigger: "blur",
  },
  password: {
    required: true,
    message: "Please input password",
    trigger: "blur",
  },
  permission_grp_id: {
    required: true,
    message: "Please select permission group",
    trigger: "blur",
  },
};

watch(
  () => formValue.email,
  async (newValue) => {
    if (newValue) {
      await nextTick();
      formRef.value.validate().catch(() => {});
    }
  },
);
</script>
<template>
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
      @update:show="closeModal"
    >
      <n-form :model="formValue" ref="formRef" :rules="rules">
        <n-grid cols="1 m:2" :x-gap="40" responsive="screen">
          <n-gi>
            <n-form-item label="Họ tên nhân sự *" path="full_name">
              <n-input v-model:value="formValue.full_name" class="w-80" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Ảnh nhân sự">
              <n-upload
                @on-change="handleImageChange"
                :max="1"
                :show-file-list="false"
                :before-upload="beforeUpload"
              >
                <n-button>Chọn tệp</n-button>
              </n-upload>
              <template v-if="imageUrl">
                <img
                  :src="imageUrl"
                  alt="Image preview"
                  class="mt-3 h-28 w-28 rounded-lg object-cover"
                />
              </template>
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Tên tài khoản *" path="username">
              <n-input v-model:value="formValue.username" class="w-80" />
            </n-form-item>
          </n-gi>

          <n-gi>
            <n-form-item label="Vai trò *" path="position">
              <n-select
                v-model:value="formValue.position"
                :options="branchPotition"
                class="w-80"
              />
            </n-form-item>
          </n-gi>

          <n-gi>
            <n-form-item label="Email *" path="email">
              <n-input v-model:value="formValue.email" class="w-80" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Chi nhánh *" path="branch_id">
              <n-select
                v-model:value="formValue.branch_id"
                :options="branchOptions"
                class="w-80"
              />
            </n-form-item>
          </n-gi>

          <n-gi>
            <n-form-item label="Cơ cấu tổ chức *" path="organ_struct_id">
              <n-select
                v-model:value="formValue.organ_struct_id"
                :options="organizationOptions"
                class="w-80"
              />
            </n-form-item>
          </n-gi>

          <n-gi>
            <n-form-item label="Mật khẩu *" path="password">
              <n-input
                v-model:value="formValue.password"
                type="password"
                class="w-80"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Nhóm quyền *" path="permission_grp_id">
              <n-select
                v-model:value="formValue.permission_grp_id"
                :options="permissionGroupOptions"
                class="w-80"
              />
            </n-form-item>
          </n-gi>

          <n-gi>
            <n-form-item label="Trạng thái hoạt động:">
              <n-switch v-model:value="formValue.is_active" />
            </n-form-item>
          </n-gi>
          <n-gi span="2">
            <n-form-item label="Giới thiệu">
              <n-input
                v-model:value="formValue.introduction"
                type="textarea"
                class="w-full"
              />
            </n-form-item>
          </n-gi>

          <n-gi span="2">
            <n-form-item class="flex gap-5">
              <n-button
                type="info"
                class="mr-5 h-12 w-48 rounded-2xl text-lg"
                @click.prevent="handleSubmit"
              >
                Lưu
              </n-button>
              <!-- <n-button
                    type="default"
                    class="h-12 w-48 rounded-2xl text-lg"
                    @click="cancelClick"
                  >
                    Hủy
                  </n-button> -->
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-form>
    </n-modal>
  </n-modal-provider>
</template>
