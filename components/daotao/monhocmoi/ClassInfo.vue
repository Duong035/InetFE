<script setup>
import { message } from "ant-design-vue";
import { ref, reactive, onMounted, nextTick, computed } from "vue";
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

const { restAPI } = useApi();
const isLoading = ref(false);
const showSpin = ref(false);
const checkedValue = ref(null);
const handleChange = (e) => {
  checkedValue.value = e.target.value;
};
const Staffarray = ref([]);
const formValue = reactive({
  img: null,
  color: "Sáng",
  id: "123456",
  name: "Toán",
  catagory: "Khối A",
  teacher: "MrBeen",
  days: "20",
  type: "Trả phí",
  price: "200.000",
  discount: "10",
  description: "lorem",
  description2: "lorem",
  description3: "lorem",
  state: 2,
  // img: null,
  // color: null,
  // id: null,
  // name: null,
  // catagory: null,
  // teacher: null,
  // days: null,
  // type: null,
  // price: null,
  // discount: null,
  // description: null,
  // description2: null,
  // state: null,
});
const displayPrice = computed(() =>
  formValue.type === "Miễn phí" ? "0" : formValue.price,
);
const displayDiscount = computed(() =>
  formValue.type === "Miễn phí" ? "0" : formValue.discount,
);
const options = [
  { label: "Sáng", value: "Sáng" },
  { label: "Tối", value: "Tối" },
];

const optionsStatus = [
  { label: "Đang học", value: "1" },
  { label: "Bảo lưu", value: "2" },
  { label: "Chưa xếp lớp", value: "3" },
  { label: "6", value: "6" },
];
const loadTeacher = async () => {
  try {
    const { data: resData } = await restAPI.cms.getStaff({});
    if (resData.value?.status) {
      Staffarray.value = resData.value.data.data
        .map(({ id, full_name }) => ({
          id,
          full_name,
        }))
        .sort((a, b) => a.full_name.localeCompare(b.full_name));
    } else {
      message.error("Failed to load Teachers!");
      Staffarray.value = [];
    }
  } catch (err) {
    message.error("Error fetching Teachers!");
    console.error(err);
    Staffarray.value = [];
  }
};

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
    password: "aohvaklvnh",
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
onMounted(async () => {
  await nextTick();
  loadTeacher();
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
              <n-input v-model:value="formValue.id" placeholder="0465214" />
            </n-form-item>
          </n-gi>
          <n-gi span="1 m:3" class="-ml-36">
            <n-form-item label="Môn học" path="name">
              <n-input
                v-model:value="formValue.name"
                placeholder="Nhập tên môn học"
              />
            </n-form-item>
          </n-gi>
          <n-gi span="1 m:4">
            <n-form-item label="Danh mục" path="cata">
              <n-select
                v-model:value="formValue.catagory"
                :options="optionsStatus"
                placeholder="Chọn danh mục"
              />
            </n-form-item>
          </n-gi>
          <n-gi span="1 m:4">
            <n-form-item label="Giảng viên phụ trách" path="teacher">
              <n-select
                v-model:value="formValue.teacher"
                :options="Staffarray"
                label-field="full_name"
                value-field="id"
                placeholder="Chọn giảng viên"
              />
            </n-form-item>
          </n-gi>
          <n-gi span="1 m:4">
            <n-form-item label="Số buổi học" path="session">
              <n-input
                v-model:value="formValue.days"
                placeholder="Nhập số buổi"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Học phí" path="session">
              <n-radio-group v-model:value="formValue.type">
                <n-space>
                  <n-radio value="Miễn phí"> Miễn phí </n-radio>
                  <n-radio value="Trả phí"> Trả phí </n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>
          </n-gi>
          <n-gi></n-gi>
          <n-gi>
            <n-form-item label="Giá gốc" path="price">
              <n-input
                v-model:value="displayPrice"
                placeholder="0"
                :disabled="formValue.type === 'Miễn phí'"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Giá khuyến mại nếu có" path="discount">
              <n-input
                v-model:value="displayDiscount"
                placeholder="Nhập giá"
                :disabled="formValue.type === 'Miễn phí'"
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
              <n-input
                v-model:value="formValue.description2"
                placeholder="Nhập mô tả"
              />
            </n-form-item>
          </n-gi>
          <n-gi span="1 m:4">
            <n-form-item label="Tiêu chuẩn đầu ra" path="out">
              <n-input
                v-model:value="formValue.description3"
                placeholder="Nhập mô tả"
              />
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
                :rail-style="railStyle"
                v-model:value="formValue.state"
              />
            </n-form-item>
          </n-gi>
          <n-gi span="3"></n-gi>
          <n-gi class="pt-2">
            <n-button round type="info" class="h-12 w-52 rounded-2xl text-lg">
              Lưu
            </n-button>
          </n-gi>
        </n-grid>
      </n-form>
    </div>
  </n-spin>
</template>
