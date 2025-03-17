<template>
  <div class="flex h-[60px] w-full bg-gray-200">
    <!-- <Sidebar /> -->

    <!-- Main Content -->
    <div class="flex-1">
      <!-- Top Navigation -->
      <header class="flex items-center justify-between bg-white p-4 shadow">
        <h1 class="text-lg font-semibold text-gray-700"></h1>
        <div class="flex items-center space-x-4">
          <div class="relative">
            <input
              type="text"
              placeholder="Tìm kiếm"
              class="flex w-full rounded-lg border px-3 py-2 text-sm text-black focus:outline-none focus:ring focus:ring-blue-200"
            />
            <div
              class="pointer-events-none absolute inset-y-0 right-2 flex items-center pl-3"
            >
              <i class="fas fa-magnifying-glass text-gray-400"></i>
            </div>
          </div>

          <NuxtLink to="/user">
            <img
              src="../public/images/barking-up-the-wrong-tree.webp"
              alt="Profile"
              class="h-10 w-10 rounded-full"
              href="../Pages/content/user.vue"
            />
          </NuxtLink>
          <button @click.prevent="doLogout">OUT</button>
        </div>
      </header>
    </div>
  </div>
</template>

<script setup>
import { useDialog, useMessage } from "naive-ui";
import { useUserStore } from "@/stores/userStore";

const dialog = useDialog();
const userStore = useUserStore();
const message = useMessage();

const doLogout = () => {
  dialog.info({
    title: "Chú ý",
    content: "Bạn có chắc chắn bạn muốn thoát",
    positiveText: "Đồng ý",
    negativeText: "Không đồng ý",
    onPositiveClick: () => {
      userStore.logOut();
      message.success("Đăng xuất thành công");
      return navigateTo(`/auth/login`);
    },
    onNegativeClick: () => {},
  });
};
</script>
