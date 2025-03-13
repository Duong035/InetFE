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
} from "vue";
import { NButton, NDataTable, useMessage } from "naive-ui";

export default defineComponent({
  setup() {
    const postref = ref<{
      setAddNew: (value: boolean, id: RowData | string) => void;
    } | null>(null);
    const delref = ref<{
      setAddNew: (title: string) => void;
    } | null>(null);
    const itemId = ref<string | null>(null);
    const showModal = (value: boolean, id: RowData | string) => {
      postref.value?.setAddNew(value, id);
    };

    const message = useMessage();
    const loading = ref(false);
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
    const checkedRowKeysRef = ref<DataTableRowKey[]>([]);
    const dataTableInstRef = ref<InstanceType<typeof NDataTable> | null>(null);
    const activeItem = ref("Tất cả trạng thái");
    const accountStatus = ref("");
    const Brancharray = ref([]);
    const PermissionGrouparray = ref([]);

    onMounted(async () => {
      loadData();
      fetchBranch_id();
      fetchPermissonGroup();
    });

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
              case "Không hoạt động":
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
          defaultFilterOptionValues: ["Hoạt động", "Không hoạt động"],
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
                  onClick: () => showModal(true, row.id),
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
                  onClick: () => showDeleteModal("Xóa nhân viên?", row.id),
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
      loading.value = true;
      try {
        const { data: resData, error } = await restAPI.cms.getStaff();

        if (error?.value) {
          message.error(error?.value?.data?.message || "Lỗi tải dữ liệu");
          return;
        }

        const rawData = toRaw(resData.value)?.data;
        const Teachersdata = rawData.data;
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
                  ? "Không hoạt động"
                  : "N/A",
          }));
        } else {
          console.error("Unexpected API response:", rawData);
          message.error("Dữ liệu không hợp lệ từ API.");
        }
        loading.value = false;
      } catch (err) {
        console.error("Error loading data:", err);
        message.error("Lỗi tải dữ liệu.");
      }
    };

    const fetchBranch_id = async () => {
      try {
        const { data: resData } = await restAPI.cms.getBranches({});

        if (resData.value?.status) {
          Brancharray.value = resData.value.data
            .map(({ id, Name, address }) => ({
              id,
              display: `${Name}: ${address}`,
            }))
            .sort((a, b) => a.display.localeCompare(b.display));
        } else {
          message.error("Failed to load Branches!");
          Brancharray.value = [];
        }
      } catch (err) {
        message.error("Error fetching Branches!");
        console.error(err);
        Brancharray.value = [];
      }
    };

    const fetchPermissonGroup = async () => {
      try {
        const { data: resData } = await restAPI.cms.getPermissionGroups({});
        if (resData.value?.status) {
          PermissionGrouparray.value = resData.value.data.data
            .map(({ id, name }) => ({
              id,
              name,
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
        } else {
          message.error("Failed to load permission group!");
          PermissionGrouparray.value = [];
        }
      } catch (err) {
        message.error("Error fetching permission group!");
        console.error(err);
        PermissionGrouparray.value = [];
      }
    };

    const handleFormSubmit = async (body: { id?: string }) => {
      if (body.id) {
        const id = body.id;
        await updateStaff(body, id);
      } else {
        await createStaff(body);
      }
      loadData();
    };
    const createStaff = async (body: object) => {
      const { data: resCreate, error } = await restAPI.cms.createStaff({
        body,
      });
      if (resCreate?.value?.status) {
        message.success("Tạo nhân viên thành công!");
      } else {
        const errorCode: keyof typeof ERROR_CODES = error.value?.data?.error;
        const errorMessage =
          ERROR_CODES[errorCode] ||
          resCreate?.value?.message ||
          "Đã xảy ra lỗi, vui lòng thử lại!";
        message.warning(errorMessage);
      }
    };

    const updateStaff = async (body: object, id: string) => {
      const { data: resUpdate, error } = await restAPI.cms.updateStaff({
        id,
        body,
      });
      if (resUpdate?.value?.status) {
        message.success("Cập nhật nhân viên thành công!");
      } else {
        const errorCode: keyof typeof ERROR_CODES = error.value?.data?.error;
        const errorMessage =
          ERROR_CODES[errorCode] ||
          resUpdate?.value?.message ||
          "Đã xảy ra lỗi, vui lòng thử lại!";

        message.warning(errorMessage);
      }
    };

    const showDeleteModal = (title: string, id: string) => {
      itemId.value = id;
      if (delref.value) {
        delref.value.setAddNew(title);
      }
    };

    const handleConfirmDelete = async () => {
      if (itemId.value !== null) {
        const body = {
          ids: [itemId.value],
        };
        console.log(JSON.stringify(body, null, 2));
        const { data: delData, error } = await restAPI.cms.deleteStaff({
          body,
        });
        if (delData?.value?.status) {
          message.success("Xóa nhân viên thành công!");
        } else {
          const errorCode: keyof typeof ERROR_CODES = error.value?.data?.error;
          const errorMessage =
            ERROR_CODES[errorCode] ||
            delData?.value?.message ||
            "Đã xảy ra lỗi, vui lòng thử lại!";

          message.warning(errorMessage);
        }
        itemId.value = null;
        loadData();
      }
    };
    return {
      Brancharray,
      PermissionGrouparray,
      postref,
      delref,
      handleConfirmDelete,
      handleFormSubmit,
      showModal,
      activeItem,
      accountStatus,
      data,
      loading,
      columns: createColumns(),
      dataTableInst: dataTableInstRef,
      checkedRowKeys: checkedRowKeysRef,
      pagination: paginationReactive,

      filterStatus() {
        if (dataTableInstRef.value) {
          if (accountStatus.value == "") {
            dataTableInstRef.value.filter(null);
          } else {
            dataTableInstRef.value.filter({
              is_active: [accountStatus.value || ""],
            });
          }
        }
      },
      rowKey: (row: RowData) => row.id,
      statusoptions: [
        {
          label: "Tất cả trạng thái",
          value: "",
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
                  placeholder="Tất cả cơ cấu tổ chức"
                  style="margin-right: 20px"
                />
                <n-select
                  v-model="accountStatus"
                  :options="PermissionGrouparray"
                  label-field="name"
                  value-field="id"
                  @change="filterStatus"
                  placeholder="Tất cả nhóm quyền"
                  style="margin-right: 20px"
                />
                <n-select
                  :options="Brancharray"
                  label-field="display"
                  value-field="id"
                  placeholder="Tất cả chi nhánh"
                  style="margin-right: 20px"
                />
                <n-select
                  v-model:value="accountStatus"
                  :options="statusoptions"
                  placeholder="Tất cả trạng thái"
                  @update:value="filterStatus"
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
                      @click="showModal(false, '')"
                    >
                      Thêm mới
                      <i class="fa-solid fa-plus ml-3"></i>
                    </n-button>
                  </n-form-item>
                </n-gi>
                <n-gi
                  span="4"
                  class="flex-cols-6 flex gap-x-10 justify-self-end"
                >
                  <n-form-item>
                    <n-button
                      type="info"
                      ghost
                      @click="$router.push('phanquyen')"
                    >
                      Cài đặt nhóm quyền
                      <i class="fa-solid fa-sitemap pl-2"></i>
                    </n-button>
                  </n-form-item>

                  <n-form-item>
                    <n-button type="info">
                      Thêm từ file
                      <i class="fa-solid fa-file-import pl-2"></i>
                    </n-button>
                  </n-form-item>

                  <n-form-item>
                    <n-button type="info">
                      Xuất file
                      <i class="fa-solid fa-file-export pl-2"></i>
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
    <DaotaoGiangvienModal
      @submit="handleFormSubmit"
      ref="postref"
      :Brancharray="Brancharray"
      :PermissionGrouparray="PermissionGrouparray"
    />
    <DelModal @confirm-delete="handleConfirmDelete" ref="delref" />
  </div>
</template>
