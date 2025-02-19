<script lang="ts">
import { defineComponent, ref } from "vue";
import type { CSSProperties } from "vue";

export default defineComponent({
  setup() {
    const hocvienStatus = ref("");
    return {
      hocvienStatus,

      railStyle: ({
        focused,
        checked,
      }: {
        focused: boolean;
        checked: boolean;
      }) => {
        const style: CSSProperties = {};
        if (checked) {
          style.background = "#2080f0";
          if (focused) {
            style.boxShadow = "0 0 0 2px #2080f0";
          }
        } else {
        }
        return style;
      },
      options: [
        {
          label: "Học viên tiềm năng",
          value: "Học viên tiềm năng",
        },
        {
          label: "Học viên học thử",
          value: "Học viên học thử",
        },
        {
          label: "Học viên chính thức",
          value: "Học viên chính thức",
        },
      ],
      timestamp: ref(""),
      value: ref(null),
    };
  },
});
</script>

<template>
  <div class="flex h-full w-full overflow-auto rounded-2xl bg-gray-50">
    <!-- Main Content -->
    <div class="flex-1">
      <!-- Content Area -->
      <div class="mx-10 my-10">
        <h1 class="text-4xl font-bold text-[#133D85]">Thêm mới tài khoản</h1>
        <n-grid :x-gap="30" cols="1 m:3" responsive="screen" class="my-5">
          <n-gi>
            <n-form-item label="Họ tên học viên *" path="name">
              <n-input placeholder="Tên học viên" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Trạng thái học viên *">
              <n-select
                v-model="hocvienStatus"
                :options="options"
                placeholder="Chọn trạng thái học viên"
              />
            </n-form-item>
          </n-gi>
          <n-gi span="1"></n-gi>
          <n-gi>
            <n-form-item label="Email *" path="email">
              <n-input placeholder="Nhập email" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Số điện thoại *" path="phone">
              <n-input placeholder="Nhập số điện thoại" type="text" />
            </n-form-item>
          </n-gi>
          <n-gi span="1"></n-gi>
          <n-gi>
            <n-form-item label="Tên tài khoản *" path="Uname">
              <n-input placeholder="Nhập tên tài khoản" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Mật khẩu *" path="pass">
              <n-input placeholder="Nhập mật khẩu" type="password" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item
              class="mt-8"
              label="Trạng thái tài khoản"
              label-placement="left"
              path="switchValue"
            >
              <n-switch :rail-style="railStyle" />
            </n-form-item>
          </n-gi>
          <n-gi span="1 m:2">
            <n-form-item label="Ghi chú" path="highlight">
              <n-input
                placeholder="Textarea"
                type="textarea"
                :autosize="{
                  minRows: 3,
                  maxRows: 5,
                }"
              />
            </n-form-item>
          </n-gi>
          <n-gi span="1"></n-gi>
          <n-gi span="1"></n-gi>
          <n-gi>
            <n-grid :x-gap="15" cols="1 m:2" responsive="screen">
              <n-gi>
                <n-button
                  round
                  class="h-12 w-52 rounded-2xl text-lg text-blue-400"
                  @click="$router.push('hocvien')"
                >
                  Hủy
                </n-button>
              </n-gi>
              <n-gi>
                <n-button
                  round
                  type="info"
                  class="h-12 w-52 rounded-2xl text-lg"
                >
                  Lưu
                </n-button>
              </n-gi>
            </n-grid>
          </n-gi>
        </n-grid>
      </div>
    </div>
  </div>
</template>
