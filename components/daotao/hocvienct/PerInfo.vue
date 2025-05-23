<script setup>
import { ref, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";

const railStyle = ({ focused, checked }) => {
  const style = {};
  if (checked) {
    style.background = "#2080f0";
    if (focused) {
      style.boxShadow = "0 0 0 2px #2080f0";
    }
  }
  return style;
};
const message = useMessage();
const dayjs = useDayjs();
const route = useRoute();
const router = useRouter();

const { restAPI } = useApi();
const isLoading = ref(false);
const formRef = ref(null);
const showSpin = ref(false);

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
  customer_source_id: null,
  contact_channel_id: null,
  status: 2,
  branch_id: null,
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
const nameError = ref("");
const emailError = ref("");
const phoneError = ref("");

const rules = reactive({
  name: {
    required: true,
    trigger: ["input", "blur"],
    validator: (_, value) => {
      const newValue = value?.trim();
      return new Promise((resolve, reject) => {
        const nameRegex = /[!@#$%^&*(),.?":{}|<>]/;
        if (!newValue) {
          nameError.value = "Tên không được để trống!";
          reject(Error(nameError.value));
        } else if (newValue.length > 50) {
          nameError.value = "Tên không được quá 50 ký tự!";
          reject(Error(nameError.value));
        } else if (nameRegex.test(newValue)) {
          nameError.value = "Tên không được chứa ký tự đặc biệt!";
          reject(Error(nameError.value));
        } else {
          nameError.value = "";
          resolve();
        }
      });
    },
  },
  email: {
    required: true,
    trigger: ["input", "blur"],
    validator: (_, value) => {
      return new Promise((resolve, reject) => {
        const emailRegex =
          /^[a-zA-Z0-9]+(?:[._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9.]+\.[a-zA-Z]{2,}$/;
        if (!value) {
          emailError.value = "Email không được để trống!";
          reject(Error(emailError.value));
        } else if (!emailRegex.test(value)) {
          emailError.value = "Email không hợp lệ!";
          reject(Error(emailError.value));
        } else if (value.length > 100) {
          emailError.value = "Email không được quá 100 ký tự!";
          reject(Error(emailError.value));
        } else {
          emailError.value = "";
          resolve();
        }
      });
    },
  },
  phone: {
    trigger: ["input", "blur"],
    validator: (_, value) => {
      return new Promise((resolve, reject) => {
        const phoneRegex = /^((84|\+84)(3|5|7|8|9)\d{8}|0[3|5|7|8|9]\d{8})$/;
        if (!value) {
          phoneError.value = "Số điện thoại không được để trống!";
          reject(Error(phoneError.value));
        } else if (!phoneRegex.test(value)) {
          phoneError.value = "Số điện thoại không hợp lệ!";
          reject(Error(phoneError.value));
        } else {
          phoneError.value = "";
          resolve();
        }
      });
    },
  },
});

if (formValue.id) {
  showSpin.value = true;
  const { data: resData } = await restAPI.cms.getStudentDetail({
    id: formValue.id,
  });
  if (resData.value?.status) {
    const data = resData.value?.data?.entry;
    formValue.name = data?.full_name;
    formValue.gender = data?.gender;
    formValue.dob = data?.dob ? dayjs(data?.dob).valueOf() : null;
    formValue.email = data?.email;
    formValue.phone = data?.phone;
    formValue.type = data?.type;
    formValue.address.province = data?.province_id;
    formValue.address.district = data?.district_id;
    formValue.address.address = data?.address;
    formValue.branch_id = data?.branch_id;
    optionsDistricts.params.province = data?.province_id;
    formValue.status = data?.status;
    if (data?.province?.id > 20) {
      optionsProvinces.default = data.province;
      optionsProvinces.data.push({
        value: data?.province?.id,
        label: data?.province?.name,
      });
    }
    if (data?.district?.id > 20) {
      optionsDistricts.default = data.district;
      optionsDistricts.data.push({
        value: data?.district?.id,
        label: data?.district?.name,
      });
    }
  }
  showSpin.value = false;
}

const handleSubmit = async (e) => {
  if (isLoading.value) return;
  e.preventDefault();

  const { id, name, gender, dob, email, phone, address, status, type } =
    formValue;

  if (address?.address?.length > 250) return;
  const unit_id = sessionStorage.getItem("unit_id");

  let body = {
    id,
    full_name: name,
    gender,
    dob: dayjs(dob).isValid() ? dayjs(dob).toISOString() : null,
    email,
    phone,
    province_id: Number(address.province),
    district_id: Number(address.district),
    address: address.address,
    status,
    type: Number(type),
  };
  try {
    await formRef.value?.validate();
    if (id) {
      const { data: resUpdate, error } = await restAPI.cms.updateStudent({
        id,
        body,
      });
      if (resUpdate?.value?.status) {
        message.success("Cập nhật thông tin học viên thành công!");
      } else {
        message.error(error.value.data.message);
      }
    } else {
      const { data: resCreate, error } = await restAPI.cms.createStudent({
        body,
      });
      if (resCreate?.value?.status) {
        message.success("Tạo học viên thành công!");
        const newId = resCreate.value.data;
        router.push({ path: window.location.pathname, query: { id: newId } });
      } else {
        message.error(error.value.data.message);
      }
    }
  } catch (err) {
    message.error("Vui lòng kiểm tra lại thông tin!");
    console.error("API error:", err);
  } finally {
    isLoading.value = false;
  }
};

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
</script>

<template>
  <n-spin :show="showSpin" class="px-5">
    <n-form :model="formValue" :rules="rules" ref="formRef">
      <div class="my-5 grid grid-cols-1 gap-3 gap-x-[30px] md:grid-cols-2">
        <div>
          <n-form-item
            label="Họ và tên học viên"
            path="name"
            :show-feedback="false"
          >
            <n-input
              v-model:value="formValue.name"
              placeholder="Điền tên nhóm học viên"
            />
          </n-form-item>
          <div v-if="nameError" class="mt-1 text-sm text-red-500">
            {{ nameError }}
          </div>
        </div>
        <div class="md:flex md:items-center">
          <n-form-item
            label="Trạng thái tài khoản"
            label-placement="left"
            path="switchValue"
            :show-feedback="false"
          >
            <n-switch
              :unchecked-value="1"
              :checked-value="2"
              v-model:value="formValue.status"
              :rail-style="railStyle"
            />
          </n-form-item>
        </div>
        <div>
          <n-form-item label="Giới tính" :show-feedback="false">
            <n-select
              v-model:value="formValue.gender"
              :options="options"
              placeholder="Chọn giới tính"
            />
          </n-form-item>
        </div>
        <div>
          <n-form-item label="Ngày sinh" :show-feedback="false">
            <n-date-picker
              class="w-full"
              v-model:value="formValue.dob"
              type="date"
              placeholder="Chọn ngày"
            />
          </n-form-item>
        </div>
        <div>
          <n-form-item label="Email" path="email" :show-feedback="false">
            <n-input
              type="email"
              v-model:value="formValue.email"
              placeholder="Nhập email"
            />
          </n-form-item>
          <div v-if="emailError" class="mt-1 text-sm text-red-500">
            {{ emailError }}
          </div>
        </div>
        <div>
          <n-form-item
            label="Số điện thoại"
            path="phone"
            :show-feedback="false"
          >
            <n-input
              type="tel"
              v-model:value="formValue.phone"
              placeholder="Nhập số điện thoại"
            />
          </n-form-item>
          <div v-if="phoneError" class="mt-1 text-sm text-red-500">
            {{ phoneError }}
          </div>
        </div>
        <div class="md:col-span-2">
          <n-form-item label="Địa chỉ" path="address" :show-feedback="false">
            <div class="grid w-full grid-cols-1 gap-x-[30px] md:grid-cols-2">
              <div>
                <n-select
                  v-model:value="formValue.address.province"
                  :loading="optionsProvinces.loading"
                  @scroll="handleScrollProvinces"
                  @update:value="handleUpdateProvince"
                  :options="optionsProvinces.data"
                  placeholder="Tỉnh/Thành phố"
                  class="custom-select-no-bg w-full"
                />
              </div>
              <div class="mt-2 md:mt-0">
                <n-select
                  v-model:value="formValue.address.district"
                  :loading="optionsDistricts.loading"
                  @scroll="handleScrollDistricts"
                  :options="optionsDistricts.data"
                  placeholder="Quận/Huyện"
                  class="w-full"
                />
              </div>
              <div class="mt-2 md:col-span-2">
                <n-input
                  v-model:value="formValue.address.address"
                  placeholder="Nhập địa chỉ"
                  class="w-full"
                />
              </div>
            </div>
          </n-form-item>
        </div>
        <div class="md:col-span-2 md:flex md:justify-center">
          <n-button
            round
            type="info"
            class="h-12 w-full rounded-2xl px-3 text-lg md:w-52"
            :loading="isLoading"
            @click.prevent="handleSubmit"
          >
            Lưu
          </n-button>
        </div>
      </div>
    </n-form>
  </n-spin>
</template>
