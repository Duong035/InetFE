<script setup>
import { message } from "ant-design-vue";
import { ref, reactive } from "vue";
import { useRoute } from "vue-router";

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
const dayjs = useDayjs();
const route = useRoute();
const { restAPI } = useApi();
const isLoading = ref(false);
const formRef = ref(null);
const showSpin = ref(false);
const checkedValue = ref(null);
const handleChange = (e) => {
  checkedValue.value = e.target.value;
};
const formValue = reactive({
  id: computed(() => route.query.id || null),
  name: null,
  gender: "Nam",
  type: null,
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
});

const options = [
  { label: "Nam", value: "Nam" },
  { label: "Nữ", value: "Nữ" },
];

const optionsStatus = [
  { label: "Đang học", value: "1" },
  { label: "Bảo lưu", value: "2" },
  { label: "Chưa xếp lớp", value: "3" },
  { label: "6", value: "6" },
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

const rules = reactive({
  name: {
    required: true,
    trigger: ["input", "blur"],
    validator: (_, value) => {
      const newValue = value?.trim();
      return new Promise((resolve, reject) => {
        const nameRegex = /[!@#$%^&*(),.?":{}|<>]/;
        if (!newValue) reject(Error("Tên không được để trống!"));
        else if (newValue.length > 50)
          reject(Error("Tên không được quá 50 ký tự!"));
        else if (nameRegex.test(newValue))
          reject(Error("Tên không được chứa ký tự đặc biệt!"));
        else resolve();
      });
    },
  },

  email: {
    required: true,
    trigger: ["input", "blur"],
    validator: (_, value) => {
      const emailRegex =
        /^[a-zA-Z0-9]+(?:[._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9.]+\.[a-zA-Z]{2,}$/;
      return new Promise((resolve, reject) => {
        if (!value) reject(Error("Email không được để trống!"));
        else if (value && !emailRegex.test(value))
          reject(Error("Email không hợp lệ!"));
        else if (value && value.length > 100)
          reject(Error("Email không được quá 100 ký tự!"));
        else resolve();
      });
    },
  },
  phone: {
    trigger: ["input", "blur"],
    validator: (_, value) => {
      return new Promise((resolve, reject) => {
        const phoneRegex =
          /^((84|(\+84))(3|5|7|8|9)([0-9]{8})\b|(0[3|5|7|8|9])([0-9]{8}))$/;
        if (!value) reject(Error("Số điện thoại không được để trống!"));
        else if (value && !phoneRegex.test(value))
          reject(Error("Số điện thoại không hợp lệ!"));
        else resolve();
      });
    },
  },
  customer_source_id: {
    required: true,
    trigger: ["input", "blur"],
    message: "Nguồn khách hàng không được để trống!",
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

    optionsDistricts.params.province = data?.province_id;
    formValue.status = data?.status;
    canNotUpdateFields = resData.value?.data?.can_not_update || [];
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
  const unit_id = localStorage.getItem("unit_id");

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
    password: "aohvaklvnh",
  };

  try {
    await formRef.value?.validate();
    console.log(body);
    // if (id) {
    //   const { data: resUpdate, error } = await restAPI.cms.updateStudent({
    //     id,
    //     body,
    //   });
    //   console.log(body);
    //   if (resUpdate?.value?.status) {
    //     message.success("Cập nhật thông tin học viên thành công!");
    //   } else {
    //     message.error(error.value.data.message);
    //   }
    // } else {
    //   const { data: resCreate, error } = await restAPI.cms.createStudent({
    //     body,
    //   });
    //   console.log(resCreate.value.data);
    //   if (resCreate?.value?.status) {
    //     message.success("Tạo học viên thành công!");
    //   } else {
    //     message.error(error.value.data.message);
    //   }
    // }
  } catch (err) {
    message.error("Vui lòng kiểm tra lại thông tin!");
    console.error("API error:", err);
  } finally {
    isLoading.value = false;
  }
};
const loadProvinces = async () => {
  if (optionsProvinces.loading) return; // Prevent multiple requests

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

      // If no new data is received, stop loading more
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
  <n-spin :show="showSpin">
    <div class="px-5">
      <n-form :model="formValue" :rules="rules" ref="formRef">
        <n-grid :x-gap="15" cols="1 m:4" responsive="screen" class="my-5">
          <n-gi>
            <n-form-item label="Ảnh đại diện khóa học" path="cover">
              <div>
                <img
                  src="../../../public/images/subject.png"
                  :square="false"
                  :width="250"
                  :height="150"
                  class="rounded-xl"
                />
                <div class="mt-2">
                  <label
                    for="cover-upload"
                    class="cursor-pointer text-sm text-blue-500 hover:underline"
                  >
                    Chỉnh sửa ảnh
                  </label>
                  <input
                    type="file"
                    id="cover-upload"
                    class="hidden"
                    accept="image/*"
                  />
                </div>
                <p class="text-xs text-gray-500">
                  Cho phép ảnh jpeg, jpg, png. Size ảnh tối đa 3.1 MB
                </p>
              </div>
            </n-form-item>
          </n-gi>
          <n-gi></n-gi>
          <n-gi>
            <n-form-item label="Màu hiển thị">
              <n-select
                v-model:value="formValue.color"
                :options="options"
                placeholder="Chọn màu sắc"
              />
            </n-form-item>
          </n-gi>
          <n-gi></n-gi>
          <n-gi>
            <n-form-item label="Mã môn học" path="code" class="w-32">
              <n-input v-model:value="formValue.code" placeholder="0465214" />
            </n-form-item>
          </n-gi>
          <n-gi span="1 m:3" class="-ml-36">
            <n-form-item label="Môn học" path="name">
              <n-input
                v-model:value="formValue.monhoc"
                placeholder="Nhập tên môn học"
              />
            </n-form-item>
          </n-gi>
          <n-gi span="1 m:4">
            <n-form-item label="Danh mục" path="cata">
              <n-select
                v-model:value="formValue.cata"
                :options="optionsStatus"
                placeholder="Chọn danh mục"
              />
            </n-form-item>
          </n-gi>
          <n-gi span="1 m:4">
            <n-form-item label="Giảng viên phụ trách" path="teacher">
              <n-select
                v-model:value="formValue.teacher"
                :options="optionsStatus"
                placeholder="Chọn giảng viên"
              />
            </n-form-item>
          </n-gi>
          <n-gi span="1 m:4">
            <n-form-item label="Số buổi học" path="session">
              <n-input
                v-model:value="formValue.session"
                placeholder="Nhập số buổi"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Học phí" path="session">
              <n-space>
                <n-radio
                  :checked="checkedValue === 'Miễn phí'"
                  value="Miễn phí"
                  @change="handleChange"
                >
                  Miễn phí
                </n-radio>
                <n-radio
                  :checked="checkedValue === 'Trả phí'"
                  value="Trả phí"
                  @change="handleChange"
                >
                  Trả phí
                </n-radio>
              </n-space>
            </n-form-item>
          </n-gi>
          <n-gi></n-gi>
          <n-gi>
            <n-form-item label="Giá gốc" path="price">
              <n-input v-model:value="formValue.price" placeholder="0" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Giá khuyến mại nếu có" path="discount">
              <n-input
                v-model:value="formValue.discount"
                placeholder="Nhập giá"
              />
            </n-form-item>
          </n-gi>
          <n-gi span="1 m:4">
            <n-form-item label="Mô tả" path="description">
              <n-input
                v-model:value="formValue.description"
                placeholder="Nhập mô tả"
              />
            </n-form-item>
          </n-gi>
          <n-gi span="1 m:4">
            <n-form-item label="Yêu cầu đầu vào" path="in">
              <n-input v-model:value="formValue.in" placeholder="Nhập mô tả" />
            </n-form-item>
          </n-gi>
          <n-gi span="1 m:4">
            <n-form-item label="Tiêu chuẩn đầu ra" path="out">
              <n-input v-model:value="formValue.out" placeholder="Nhập mô tả" />
            </n-form-item>
          </n-gi>

          <n-gi>
            <n-form-item
              class="flex text-4xl"
              label="Trạng thái hoạt động"
              label-placement="left"
              path="switchValue"
            >
              <n-switch
                :unchecked-value="1"
                :checked-value="2"
                v-model:value="formValue.status"
                :rail-style="railStyle"
              />
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-form>
    </div>
  </n-spin>
</template>
