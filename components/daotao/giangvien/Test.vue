<script setup>
import { ref, watch, nextTick, defineExpose } from "vue";
const { restAPI } = useApi();
const emit = defineEmits(["submit"]);
const isModalVisible = ref(false);
const is_edit = ref(true);
const setAddNew = (value) => {
  isModalVisible.value = true;
  is_edit.value = value;
};

defineExpose({ setAddNew });

const formValue = reactive({
  id: null,
  full_name: null,
  email: null,
  type: null,
  branch_id: null,
  phone: null,
  organ_struct_id: null,
  position: 3,
  username: null,
  password: null,
  introduction: null,
  permission_grp_id: null,
  is_active: true,
  avatar: null,
  salary_type: 1,
  salary: 0,
  role_id: 4,
});
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
        width: 100%;
        max-width: 1200px;
      "
      :header-style="{ padding: '10px' }"
      :closable="false"
    >
      <n-form :model="formValue" ref="formRef" :rules="rules">
        <n-grid cols="3" :x-gap="20" responsive="screen">
          <n-gi span="2">
            <n-grid cols="2" :x-gap="20" responsive="screen">
              <n-gi>
                <n-form-item label="Họ tên nhân sự *" path="full_name">
                  <n-input v-model:value="formValue.full_name" />
                </n-form-item>
              </n-gi>

              <n-gi>
                <n-form-item label="Vai trò" path="position">
                  <n-select
                    v-model:value="formValue.position"
                    :options="userPosition"
                    label-field="label"
                    value-field="value"
                  />
                </n-form-item>
              </n-gi>

              <n-gi>
                <n-form-item label="Email" path="email">
                  <n-input v-model:value="formValue.email" />
                </n-form-item>
              </n-gi>

              <n-gi>
                <n-form-item label="Số điện thoại" path="phone">
                  <n-input
                    v-model:value="formValue.phone"
                    placeholder="Nhập số điện thoại"
                  />
                </n-form-item>
              </n-gi>
            </n-grid>
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
            <n-form-item label="Chi nhánh" path="branch_id">
              <n-select
                v-model:value="formValue.branch_id"
                :options="Brancharray"
                label-field="display"
                value-field="id"
                placeholder="Chọn chi nhánh"
              />
            </n-form-item>
          </n-gi>

          <n-gi>
            <n-form-item label="Cơ cấu tổ chức" path="organ_struct_id">
              <n-select v-model:value="formValue.organ_struct_id" />
            </n-form-item>
          </n-gi>

          <n-gi>
            <n-form-item label="Nhóm quyền" path="permission_grp_id">
              <n-select
                v-model:value="formValue.permission_grp_id"
                :options="PermissionGrouparray"
                label-field="name"
                value-field="id"
                placeholder="Chọn nhóm quyền"
              />
            </n-form-item>
          </n-gi>

          <n-gi>
            <n-form-item label="Tên tài khoản" path="username">
              <n-input v-model:value="formValue.username" :disabled="is_edit" />
            </n-form-item>
          </n-gi>

          <n-gi>
            <n-form-item label="Mật khẩu" type="password" path="password">
              <n-input
                v-model:value="formValue.password"
                type="password"
                show-password-on="click"
                :disabled="is_edit"
              />
            </n-form-item>
          </n-gi>

          <n-gi>
            <n-form-item
              label="Trạng thái hoạt động:"
              label-placement="left"
              class="mt-7"
            >
              <n-switch
                v-model:value="formValue.is_active"
                :rail-style="railStyle"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Cách tính lương" path="salary" v-show="is_edit">
              <n-select
                v-model:value="formValue.salary_type"
                :options="userSalary"
                label-field="label"
                value-field="value"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item
              label="Số tiền tính lương (VNĐ)"
              path="salary"
              v-show="is_edit"
            >
              <n-input v-model:value="formValue.salary" />
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
                :isloading="isLoading"
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
