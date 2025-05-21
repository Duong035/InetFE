<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const message = useMessage();
const { restAPI } = useApi();

const activeTab = ref(""); // Options: "draw", "upload"
const canvas = ref<HTMLCanvasElement | null>(null);
const showSpin = ref(false);

const switchToDraw = () => {
  activeTab.value = "draw";
  clearCanvas();
};

onMounted(() => {
  activeTab.value = "accountInfo";
});

const formValue = reactive({
  id: computed(() => route.query.id || null),
  name: null,
  gender: "Nam",
  type: 6,
  dob: null,
  email: null,
  phone: null,
  address: {
    province: null,
    district: null,
    address: null,
  },
});

const options = [
  { label: "Nam", value: "Nam" },
  { label: "Nữ", value: "Nữ" },
];

const optionsProvinces = reactive({
  loading: false,
  data: [],
  default: {},
});

const optionsDistricts = reactive({
  params: {
    page: 1,
    length: 20,
    province: null,
  },
  loading: false,
  data: [],
  default: {},
});

const loadProvinces = async () => {
  if (optionsProvinces.loading) return;

  optionsProvinces.loading = true;

  try {
    const { data: resData, error } = await restAPI.cms.getProvinces({
      cache: "force-cache",
    });

    if (resData.value?.status) {
      const newProvinces = resData.value?.data?.data || [];

      newProvinces.forEach((item) => {
        const exists = optionsProvinces.data.some(
          (province) => province.value === item.id,
        );

        if (!exists) {
          optionsProvinces.data.push({
            value: item.id,
            label: item.name,
          });
        }
      });

      if (newProvinces.length === 0) {
        message.info("All provinces loaded.");
      }
    } else {
      message.error("Failed to load provinces!");
    }
  } catch (err) {
    message.error("Error fetching provinces!");
    console.error(err);
  } finally {
    optionsProvinces.loading = false;
  }
};

const loadDistricts = async () => {
  optionsDistricts.loading = true;
  if (optionsDistricts.params.province) {
    const {
      data: resData,
      pending: loading,
      refresh,
    } = await restAPI.cms.getDistricts({
      params: optionsDistricts.params,
      cache: "force-cache",
    });
    if (resData.value?.status) {
      resData.value?.data?.data?.forEach((item) => {
        if (
          !optionsDistricts?.default?.id ||
          (optionsDistricts?.default?.id !== item?.id &&
            optionsDistricts.default?.name !== item?.name)
        ) {
          optionsDistricts.data.push({
            value: item?.id,
            label: item?.name,
          });
        }
      });
      optionsDistricts.params.page += 1;
    }
  } else {
    optionsDistricts.params.page = 1;
    optionsDistricts.data = [];
  }
  optionsDistricts.loading = false;
};

const handleUpdateProvince = async (value) => {
  if (optionsDistricts.params.province !== value) {
    formValue.address.district = null;
    optionsDistricts.params.province = value;
    optionsDistricts.params.page = 1;
    optionsDistricts.data = [];
    await loadDistricts();
  }
};

const handleScrollProvinces = async (e) => {
  const currentTarget = e.currentTarget;
  if (
    currentTarget.scrollTop + currentTarget.offsetHeight + 150 >=
      currentTarget.scrollHeight &&
    !optionsProvinces.loading
  ) {
    await loadProvinces();
  }
};

const handleScrollDistricts = async (e) => {
  const currentTarget = e.currentTarget;
  if (
    currentTarget.scrollTop + currentTarget.offsetHeight + 150 >=
      currentTarget.scrollHeight &&
    !optionsDistricts.loading
  ) {
    await loadDistricts();
  }
};

onMounted(async () => {
  await loadProvinces();
  if (optionsDistricts.params.province) {
    await loadDistricts();
  }
});

const handleUpload = (event: Event) => {
  activeTab.value = "upload";
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (canvas.value) {
        const ctx = canvas.value.getContext("2d");
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.value!.width, canvas.value!.height);
            ctx.drawImage(img, 0, 0, canvas.value!.width, canvas.value!.height);
          };
          img.src = e.target?.result as string;
        }
      }
    };
    reader.readAsDataURL(file);
  }
};

const clearSignature = () => {
  if (activeTab.value === "draw") {
    clearCanvas();
  } else {
    activeTab.value = "draw";
  }
};

const clearCanvas = () => {
  if (canvas.value) {
    const ctx = canvas.value.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
    }
  }
};

// Drawing functionality
onMounted(() => {
  if (canvas.value) {
    const ctx = canvas.value.getContext("2d");
    if (ctx) {
      let drawing = false;

      const startDrawing = (event: MouseEvent) => {
        drawing = true;
        ctx.beginPath();
        ctx.moveTo(event.offsetX, event.offsetY);
      };

      const draw = (event: MouseEvent) => {
        if (!drawing) return;
        ctx.lineTo(event.offsetX, event.offsetY);
        ctx.stroke();
      };

      const stopDrawing = () => {
        drawing = false;
        ctx.closePath();
      };

      canvas.value.addEventListener("mousedown", startDrawing);
      canvas.value.addEventListener("mousemove", draw);
      canvas.value.addEventListener("mouseup", stopDrawing);
      canvas.value.addEventListener("mouseleave", stopDrawing);
    }
  }
});

//change pass
const email = ref(""); // Example email
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Handle form submission
const handleSubmit = () => {
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    alert("Cần điền đủ thông tin vào *");
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    alert("Pass không giống nhau!");
    return;
  }
  // Logic to handle password change (e.g., API call)
  alert("Đổi pass thành công!");
};

// Active tab
</script>
<template>
  <div
    class="flex h-[calc(100vh-112px)] w-full overflow-auto rounded-2xl bg-gray-50"
  >
    <!-- Main Content -->
    <div class="flex-1">
      <!-- Content Area -->
      <div class="text-black">
        <main class="pl4 box-border flex pr-4">
          <div class="min-h-fit w-full bg-gray-50 p-5">
            <!-- Tabs -->
            <div class="mb-6 flex border-b">
              <button
                @click="activeTab = 'accountInfo'"
                :class="[
                  'px-6 py-2 font-medium',
                  activeTab === 'accountInfo'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-600',
                ]"
              >
                Thông tin tài khoản
              </button>
              <button
                @click="activeTab = 'changePassword'"
                :class="[
                  'px-6 py-2 font-medium',
                  activeTab === 'changePassword'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-600',
                ]"
              >
                Đổi mật khẩu
              </button>
            </div>
            <!-- Account Information -->
            <div v-if="activeTab === 'accountInfo'">
              <div class="grid-cols- grid">
                <!-- Profile Picture -->
                <div>
                  <div class="mb-4">
                    <img
                      src="https://via.placeholder.com/120"
                      alt="Profile Picture"
                      class="mx-auto h-32 w-32 rounded-full"
                    />
                    <div class="mt-2 text-center">
                      <label
                        for="profile-picture-upload"
                        class="cursor-pointer text-sm text-blue-500 hover:underline"
                      >
                        Chỉnh sửa ảnh
                      </label>
                      <input
                        type="file"
                        id="profile-picture-upload"
                        class="hidden"
                      />
                    </div>
                  </div>
                  <p class="text-center text-xs text-gray-500">
                    Cho phép ảnh jpeg, jpg, png. Size ảnh tối đa 3.1 MB
                  </p>
                </div>

                <!-- siganture -->
                <div class="mt-6">
                  <label class="block text-sm font-medium text-gray-700"
                    >Chữ ký cá nhân</label
                  >
                  <div class="mt-2 flex items-start space-x-4">
                    <!-- Canvas or Placeholder -->
                    <div class="relative">
                      <!-- <canvas
                        v-show="activeTab.value === 'draw'"
                        ref="canvas"
                        class="h-32 w-64 rounded border border-gray-300 bg-gray-50"
                      ></canvas>
                      <div
                        v-show="activeTab.value === 'upload'"
                        class="flex h-32 w-64 items-center justify-center rounded border border-gray-300 bg-gray-50"
                      >
                        <p class="text-sm text-gray-500">No image uploaded</p>
                      </div> -->
                    </div>

                    <!-- Actions -->
                    <div class="flex flex-col space-y-2">
                      <div class="flex space-x-2">
                        <!-- <button
                          @click="switchToDraw"
                          :class="[
                            'rounded border px-4 py-2 text-sm',
                            activeTab.value === 'draw'
                              ? 'bg-blue-500 text-white'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100',
                          ]"
                        >
                          Vẽ
                        </button> -->
                        <label
                          for="upload-input"
                          :class="[
                            'cursor-pointer rounded border px-4 py-2 text-sm',
                          ]"
                        >
                          Tải ảnh lên
                          <input
                            type="file"
                            id="upload-input"
                            @change="handleUpload"
                            class="hidden"
                            accept="image/*"
                          />
                        </label>
                      </div>
                      <button
                        @click="clearSignature"
                        class="rounded bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Personal Information -->
                <div class="col-span-2">
                  <n-spin :show="showSpin" class="px-5">
                    <n-form :model="formValue" :rules="rules" ref="formRef">
                      <n-grid
                        :x-gap="30"
                        cols="1 m:2"
                        responsive="screen"
                        class="my-5"
                      >
                        <n-gi>
                          <n-form-item label="Họ và tên *" path="name">
                            <n-input
                              v-model:value="formValue.name"
                              placeholder="Nhập họ và tên"
                            />
                          </n-form-item>
                        </n-gi>
                        <n-gi>
                          <n-form-item label="Số điện thoại *" path="phone">
                            <n-input
                              type="tel"
                              v-model:value="formValue.phone"
                              placeholder="Nhập số điện thoại"
                            />
                          </n-form-item>
                        </n-gi>
                        <n-gi span="2">
                          <n-form-item label="Email *" path="email">
                            <n-input
                              type="email"
                              v-model:value="formValue.email"
                              placeholder="Example@gmail.com"
                            />
                          </n-form-item>
                        </n-gi>
                        <n-gi>
                          <n-form-item label="Giới tính">
                            <n-select
                              v-model:value="formValue.gender"
                              :options="options"
                              placeholder="Chọn giới tính"
                            />
                          </n-form-item>
                        </n-gi>
                        <n-gi>
                          <n-form-item label="Ngày sinh">
                            <n-date-picker
                              class="w-full"
                              v-model:value="formValue.dob"
                              type="date"
                              placeholder="Chọn ngày"
                            />
                          </n-form-item>
                        </n-gi>

                        <n-gi span="1 m:2">
                          <n-form-item label="Địa chỉ" path="address">
                            <n-grid
                              :x-gap="30"
                              cols="1 m:2"
                              responsive="screen"
                            >
                              <n-gi>
                                <n-select
                                  v-model:value="formValue.address.province"
                                  :loading="optionsProvinces.loading"
                                  @scroll="handleScrollProvinces"
                                  @update:value="handleUpdateProvince"
                                  :options="optionsProvinces.data"
                                  placeholder="Tỉnh/Thành phố"
                                  class="custom-select-no-bg"
                                />
                              </n-gi>
                              <n-gi>
                                <n-select
                                  v-model:value="formValue.address.district"
                                  :loading="optionsDistricts.loading"
                                  @scroll="handleScrollDistricts"
                                  :options="optionsDistricts.data"
                                  placeholder="Quận/Huyện"
                                />
                              </n-gi>
                              <n-gi span="1 m:2" class="mt-2">
                                <n-input
                                  v-model:value="formValue.address.address"
                                  placeholder="Địa chỉ cụ thế"
                                />
                              </n-gi>
                            </n-grid>
                          </n-form-item>
                        </n-gi>
                      </n-grid>
                    </n-form>
                  </n-spin>
                </div>
              </div>

              <!-- Signature -->

              <!-- Save Button -->
              <div class="text-center">
                <n-button
                  round
                  type="info"
                  class="h-12 w-52 rounded-2xl text-lg"
                  :loading="isLoading"
                  @click.prevent="handleSubmit"
                >
                  Lưu
                </n-button>
              </div>
            </div>

            <!-- Change Password -->
            <div v-if="activeTab === 'changePassword'">
              <form @submit.prevent="handleSubmit">
                <div class="text-center text-gray-600">
                  <div class="grid grid-cols-2 gap-6">
                    <!-- Email -->
                    <div>
                      <label class="mb-2 block font-bold text-blue-500"
                        >Tài khoản đăng nhập</label
                      >
                      <input
                        type="email"
                        v-model="email"
                        class="focus:[#00A2EBFF] focus:[#00A2EBFF] w-full rounded-2xl border p-3 focus:outline-none focus:ring-2"
                      />
                    </div>

                    <!-- Current Password -->
                    <div>
                      <label class="mb-2 block font-bold text-blue-500"
                        >Mật khẩu hiện tại *</label
                      >
                      <div class="relative">
                        <input
                          :type="showCurrentPassword ? 'text' : 'password'"
                          v-model="currentPassword"
                          placeholder="Nhập mật khẩu hiện tại"
                          class="focus:[#00A2EBFF] focus:[#00A2EBFF] w-full rounded-2xl border p-3 focus:outline-none focus:ring-2"
                        />
                        <button
                          type="button"
                          @click="showCurrentPassword = !showCurrentPassword"
                          class="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500"
                        >
                          👁
                        </button>
                      </div>
                    </div>

                    <!-- New Password -->
                    <div>
                      <label class="mb-2 block font-bold text-blue-500"
                        >Mật khẩu mới *</label
                      >
                      <div class="relative">
                        <input
                          :type="showNewPassword ? 'text' : 'password'"
                          v-model="newPassword"
                          placeholder="Nhập mật khẩu mới"
                          class="focus:[#00A2EBFF] focus:[#00A2EBFF] w-full rounded-2xl border p-3 focus:outline-none focus:ring-2"
                        />
                        <button
                          type="button"
                          @click="showNewPassword = !showNewPassword"
                          class="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500"
                        >
                          👁
                        </button>
                      </div>
                    </div>

                    <!-- Confirm Password -->
                    <div>
                      <label class="mb-2 block font-bold text-blue-500"
                        >Xác nhận mật khẩu *</label
                      >
                      <div class="relative">
                        <input
                          :type="showConfirmPassword ? 'text' : 'password'"
                          v-model="confirmPassword"
                          placeholder="Xác nhận mật khẩu mới"
                          class="focus:[#00A2EBFF] focus:[#00A2EBFF] w-full rounded-2xl border p-3 focus:outline-none focus:ring-2"
                        />
                        <button
                          type="button"
                          @click="showConfirmPassword = !showConfirmPassword"
                          class="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500"
                        >
                          👁
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Save Button -->
                  <div class="mt-6 text-center">
                    <button
                      type="submit"
                      class="rounded-md bg-blue-500 px-6 py-3 text-white hover:bg-blue-600"
                    >
                      Lưu
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>
