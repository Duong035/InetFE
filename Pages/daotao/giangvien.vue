<script lang="ts">
import type { DataTableColumns, DataTableRowKey } from "naive-ui";
import {
  defineComponent,
  ref,
  h,
  reactive,
  computed,
  onMounted,
  toRaw,
  nextTick,
} from "vue";
import { NButton, NDataTable, useMessage } from "naive-ui";
import { useRouter } from "vue-router";

export default defineComponent({
  setup() {
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
    const loading = ref(false);
    const message = useMessage();
    const paginationReactive = reactive({
      page: 1,
      pageSize: 9,
      showSizePicker: true,
      pageSizes: [3, 5, 7, 9, 12],
      itemCount: computed(() => data.value.length),
      onUpdatePage: (page: number) => {
        paginationReactive.page = page;
      },
      onUpdatePageSize: (pageSize: number) => {
        paginationReactive.pageSize = pageSize;
        paginationReactive.page = 1;
      },
    });
    const dayjs = useDayjs();
    const { restAPI } = useApi();
    const router = useRouter();
    const checkedRowKeysRef = ref<DataTableRowKey[]>([]);
    const dataTableInstRef = ref<InstanceType<typeof NDataTable> | null>(null);
    const activeItem = ref("Tất cả trạng thái");
    const accountStatus = ref("");
    const postref = ref<{ setAddNew: (value: boolean) => void } | null>(null);

    const showPostModal = async () => {
      await nextTick();
      console.log("postref:", postref.value);
      if (postref.value && typeof postref.value.setAddNew === "function") {
        postref.value.setAddNew(true);
      } else {
        console.error("postref is not initialized or setAddNew is missing.");
      }
    };
    const delModal = ref(false);
    const deleteTarget = ref<{ id: string } | null>(null);
    function filterStatus() {
      if (dataTableInstRef.value) {
        return dataTableInstRef.value.filter(null);
      }
    }

    onMounted(async () => {
      loadData();
      filterStatus();
      console.log("DaotaoGiangvienTest is mounted!");
      await nextTick(); // Wait for DOM updates
      console.log("postref in onMounted:", postref.value);
    });
    // function edit(value: RowData) {
    //   router.push({
    //     path: "hocvieninfo",
    //     query: { id: value.id },
    //   });
    // }

    function createColumns(): DataTableColumns<RowData> {
      return [
        {
          title: "STT",
          key: "stt",
          defaultSortOrder: "ascend",
          sorter: "default",
          titleAlign: "center",
        },
        { title: "Tên người dùng", key: "username" },
        { title: "Họ và tên", key: "full_name" },
        {
          title: "Ảnh đại diện",
          key: "avatar",
          render(row) {
            return h("img", {
              src: row.avatar || "",
              alt: "Avatar",
              style: "width: 40px; height: 40px; border-radius: 50%",
            });
          },
        },
        {
          title: "Trạng thái tài khoản",
          key: "is_active",
          render(row) {
            let color = "";
            let background = "";
            switch (row.is_active) {
              case "Hoạt động":
                color = "#00974F";
                background = "#F0FFF8";
                break;
              case "Dừng hoạt động":
                color = "#4D6FA8";
                background = "#ECF1F9";
                break;
              default:
                color = "gray";
            }
            return h(
              "span",
              {
                style: {
                  padding: "5px 10px",
                  borderRadius: "10px",
                  color,
                  background,
                },
              },
              row.is_active,
            );
          },
          defaultFilterOptionValues: ["Hoạt động", "Dừng hoạt động"],
          filter(value, row) {
            return row.is_active.includes(value as string);
          },
        },
        {
          title: "Lương",
          key: "salary",
          render: (row) =>
            row.salary ? row.salary.toLocaleString() + " VND" : "N/A",
        },
        {
          title: "Ngày tạo",
          key: "created_at",
          render(row) {
            return dayjs(row.created_at).format("YYYY-MM-DD");
          },
        },

        {
          title: "Actions",
          key: "actions",
          titleAlign: "center",
          render(row) {
            return h("div", [
              h(
                NButton,
                {
                  size: "small",
                  quaternary: true,
                  style: { backgroundColor: "transparent", color: "blue" },
                  // onClick: () => editUser(row),
                },
                {
                  default: () =>
                    h("i", {
                      class: "fa-regular fa-pen-to-square",
                    }),
                },
              ),
              h(
                NButton,
                {
                  size: "small",
                  quaternary: true,
                  style: { backgroundColor: "transparent", color: "red" },
                  // onClick: () => deleteUser(row),
                },
                { default: () => h("i", { class: "fa-solid fa-trash" }) },
              ),
            ]);
          },
        },
      ];
    }
    const data = ref<RowData[]>([]);
    const loadData = async () => {
      try {
        const { data: resData, error } = await restAPI.cms.getUser();

        if (error?.value) {
          message.error(error?.value?.data?.message || "Lỗi tải dữ liệu");
          return;
        }

        const rawData = toRaw(resData.value)?.data;
        const Teachersdata = rawData.data;
        console.log(resData);
        if (Array.isArray(Teachersdata)) {
          data.value = Teachersdata.map((item: any, index) => ({
            id: item.id,
            stt: index + 1,
            username: item.username,
            full_name: item.full_name,
            avatar: item.avatar,
            created_at: item.created_at ? item.created_at.split("T")[0] : "N/A",
            salary: item.salary || 0,

            is_active:
              item.is_active === true
                ? "Hoạt động"
                : item.is_active === false
                  ? "Dừng hoạt động"
                  : "N/A",
          }));
        } else {
          console.error("Unexpected API response:", rawData);
          message.error("Dữ liệu không hợp lệ từ API.");
        }
      } catch (err) {
        console.error("Error loading data:", err);
        message.error("Lỗi tải dữ liệu.");
      }
    };

    return {
      rules,
      isLoading,
      formRef,
      formValue,
      loading,
      showPostModal,
      deleteTarget,
      delModal,
      activeItem,
      accountStatus,
      data,
      columns: createColumns(),
      dataTableInst: dataTableInstRef,
      checkedRowKeys: checkedRowKeysRef,
      pagination: paginationReactive,

      filterStatus() {
        if (dataTableInstRef.value) {
          if (accountStatus.value == "All") {
            dataTableInstRef.value.filter(null);
          } else {
            dataTableInstRef.value.filter({
              is_active: [accountStatus.value || ""],
            });
          }
        }
      },
      rowKey: (row: RowData) => row.id,
      options: [
        {
          label: "Select",
          value: "song0",
          disabled: true,
        },
        {
          label: "A",
          value: "A",
        },
        {
          label: "B",
          value: "B",
        },
        {
          label: "C",
          value: "C",
        },
      ],
      statusoptions: [
        {
          label: "All",
          value: "All",
        },
        {
          label: "Hoạt động",
          value: "Hoạt động",
        },
        {
          label: "Không hoạt động",
          value: "Không hoạt động",
        },
      ],
    };
  },
});
interface RowData {
  id: string;
  stt: number;
  username: string;
  full_name: string;
  avatar?: string;
  created_at: string;
  salary: number;

  is_active: string;
}
const actionMenu = [
  {
    title: "Xếp lớp",
    key: "Xep",
  },
  {
    title: "Dừng hoạt động",
    key: "Stop",
  },
];
</script>

<template>
  <div class="flex h-full w-full overflow-auto rounded-2xl bg-gray-50">
    <!-- Main Content -->
    <div class="flex-1">
      <!-- Content Area -->
      <div class="h-full text-black">
        <n-card class="h-full bg-gray-50">
          <div class="flex items-center justify-between text-[#133D85]">
            <h1 class="text-4xl font-bold">Danh sách giảng viên</h1>
          </div>
          <n-grid class="min-h-fit w-full" cols="1 m:5" responsive="screen">
            <n-gi span="1 m:5">
              <n-form-item>
                <n-input
                  type="text"
                  placeholder="Tìm kiếm tên nhân sự"
                  style="margin-right: 20px"
                />
                <n-select
                  v-model="time"
                  :options="options"
                  placeholder="Tất cả cơ cấu tổ chức"
                  style="margin-right: 20px"
                />
                <n-select
                  v-model="accountStatus"
                  :options="statusoptions"
                  @change="filterStatus"
                  placeholder="Tất cả nhóm quyền"
                  style="margin-right: 20px"
                />
                <n-select
                  v-model="time"
                  :options="options"
                  placeholder="Tất cả chi nhánh"
                  style="margin-right: 20px"
                />
                <n-select
                  v-model:value="accountStatus"
                  :options="statusoptions"
                  @change="
                    (() => {
                      accountStatus = $event;
                      filterStatus();
                    })()
                  "
                  placeholder="Tất cả trạng thái"
                  style="margin-right: 20px"
                />
              </n-form-item>
            </n-gi>

            <n-gi span="1 m:5">
              <n-grid
                class="-mt-8 w-full"
                :x-gap="30"
                cols="1 m:5"
                responsive="screen"
              >
                <n-gi span="1" class="flex-cols-3 flex gap-x-10">
                  <n-form-item>
                    <n-button
                      round
                      type="info"
                      class="h-12 w-48 rounded-2xl text-xl"
                      @click="showPostModal()"
                    >
                      Thêm mới
                      <i class="fa-solid fa-plus ml-3"></i>
                    </n-button>
                    <NhansuPost />
                  </n-form-item>
                </n-gi>
                <n-gi
                  span="4"
                  class="flex-cols-6 flex gap-x-10 justify-self-end"
                >
                  <n-form-item>
                    <n-button type="info" ghost>
                      Cài đặt nhóm quyền
                      <Icon
                        name="icomoon-free:tree"
                        width="24"
                        height="24"
                        style="margin-left: 5px"
                      />
                    </n-button>
                  </n-form-item>

                  <n-form-item>
                    <n-button type="info">
                      Thêm từ file
                      <Icon
                        name="fe:import"
                        width="24"
                        height="24"
                        style="margin-left: 5px"
                      />
                    </n-button>
                  </n-form-item>

                  <n-form-item>
                    <n-button type="info">
                      Xuất file
                      <Icon
                        name="fe:export"
                        width="24"
                        height="24"
                        style="margin-left: 5px"
                      />
                    </n-button>
                  </n-form-item>
                </n-gi>
              </n-grid>
            </n-gi>
            <n-gi span="1 m:5">
              <n-data-table
                :loading="loading"
                ref="dataTableInst"
                :bordered="false"
                :single-line="false"
                :columns="columns"
                :data="data"
                :pagination="pagination"
                :row-key="rowKey"
              />
            </n-gi>
          </n-grid>
        </n-card>
      </div>
    </div>
    <!-- <n-modal v-model:show="showDeleteModal">
      <n-card
        title="Xác nhận xóa"
        @close="showDeleteModal = false"
        style="width: 400px"
      >
        <p v-if="deleteType === 'single'">
          Bạn có chắc chắn muốn xóa học viên này không?
        </p>
        <p v-else>Bạn có chắc chắn muốn xóa các học viên đã chọn không?</p>
        <template #footer>
          <n-space justify="end">
            <n-button @click="showDeleteModal = false">Hủy</n-button>
            <n-button type="error" @click="confirmDelete" :loading="isDeleting">
              Xóa
            </n-button>
          </n-space>
        </template>
      </n-card>
    </n-modal> -->
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
  </div>
</template>
