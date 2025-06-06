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
import { NButton, NDataTable, NDropdown } from "naive-ui";
import { useRouter } from "vue-router";

export default defineComponent({
  setup() {
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

    const delModal = ref(false);
    const deleteTarget = ref<{ id: string } | null>(null);
    function filterStatus() {
      if (dataTableInstRef.value) {
        return dataTableInstRef.value.filter(null);
      }
    }
    onMounted(() => {
      loadData();
      filterStatus();
    });

    function edit(value: RowData) {
      router.push({
        path: "hocvieninfo",
        query: { id: value.id },
      });
    }

    function createColumns(): DataTableColumns<RowData> {
      return [
        {
          type: "selection",
        },

        {
          title: "STT",
          key: "stt",
          titleAlign: "center",
          width: "80px",
          defaultSortOrder: "ascend",
          sorter: "default",
        },
        {
          title: "Thông tin học viên",
          key: "tthv",
          defaultSortOrder: "ascend",
          sorter: "default",
        },

        {
          title: "Số môn học hoàn thành",
          key: "mhht",
          defaultSortOrder: "ascend",
          sorter: "default",
        },
        {
          title: "Môn đã xếp lớp",
          key: "mdxl",
          defaultSortOrder: "ascend",
          sorter: "default",
        },
        {
          title: "Ngày cập nhật",
          key: "ncn",
          defaultSortOrder: "ascend",
          sorter: "default",
          render(row) {
            return dayjs(row.ncn).format("DD-MM-YYYY");
          },
        },

        {
          title: "Trạng thái tài khoản",
          key: "accstatus",
          render(row) {
            let color = "";
            let background = "";
            switch (row.accstatus) {
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
              row.accstatus,
            );
          },
          defaultFilterOptionValues: ["Hoạt động", "Dừng hoạt động"],
          filter(value, row) {
            return row.accstatus.includes(value as string);
          },
        },
        {
          title: "Action",
          key: "actions",
          titleAlign: "center",
          render(row) {
            return h(
              "div",
              {
                style: {
                  padding: "0",
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  justifyContent: "center",
                },
              },
              [
                h(
                  NButton,
                  {
                    size: "small",
                    quaternary: true,
                    style: {
                      padding: "0",
                      backgroundColor: "transparent",
                      color: "green",
                    },
                    onClick: () => edit(row),
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
                    style: {
                      backgroundColor: "transparent",
                      color: "red",
                    },
                    onClick: () => openDeleteModal("single", row.id),
                  },
                  {
                    default: () =>
                      h("i", {
                        class: "fa-solid fa-trash",
                      }),
                  },
                ),
                h(
                  NDropdown,
                  {
                    trigger: "click",
                    options: actionMenu,
                    quaternary: true,
                    style: { color: "gray" },
                    onSelect(key) {
                      if (key === "Xếp lớp") {
                        edit(row);
                      } else if (key === "Dừng hoạt động") {
                        // your logic
                      }
                    },
                  },
                  {
                    default: () =>
                      h("i", {
                        class: "fa-solid fa-ellipsis-v",
                      }),
                  },
                ),
              ],
            );
          },
        },
      ];
    }
    const data = ref<RowData[]>([]);

    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));

      try {
        const { data: resData, error } = await restAPI.cms.getStudents();

        if (error?.value) {
          message.error(error?.value?.data?.message || "Lỗi tải dữ liệu");
          return;
        }

        const rawData = toRaw(resData.value)?.data;
        const Studentsdata = rawData.data;
        if (Array.isArray(Studentsdata)) {
          data.value = Studentsdata.map((item: any, index) => ({
            id: item.id || "N/A",
            stt: index + 1,
            tthv: item.full_name || "N/A",
            mhht: item.mhht || "N/A",
            mdxl: item.mdxl || "N/A",
            ncn: item.updated_at ? item.updated_at.split("T")[0] : "N/A",

            accstatus:
              item.status === 2
                ? "Hoạt động"
                : item.status === 1
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

    const selectedRows = ref<RowData[]>([]);
    const selectedId = computed(() => selectedRows.value.map((row) => row.id));

    const massEdit = async (value: number) => {
      let successCount = 0;
      let errorCount = 0;
      const status = value;

      const updatePromises = selectedId.value.map(async (id) => {
        const row = data.value.find((row) => row.id === id);
        if (!row) return;

        try {
          const body = { status };
          const { data: resUpdate, error } = await restAPI.cms.updateStudent({
            id,
            body,
          });

          if (resUpdate?.value?.status) {
            successCount++;
          } else {
            errorCount++;
            message.error(
              error?.value?.data?.message || `Lỗi cập nhật học viên ${id}`,
            );
          }
        } catch (err) {
          errorCount++;
          message.error(
            `Lỗi cập nhật học viên ${id}: ${(err as Error).message}`,
          );
        }
        loadData();
      });

      await Promise.all(updatePromises);

      if (successCount > 0) {
        message.success(`Cập nhật thành công ${successCount} học viên!`);
      }

      if (errorCount > 0) {
        message.error(`Có ${errorCount} học viên cập nhật thất bại.`);
      }

      return selectedId.value;
    };

    const showDeleteModal = ref(false);
    const deleteType = ref("single"); // 'single' or 'mass'
    const isDeleting = ref(false);
    const deleteId = ref("");

    const openDeleteModal = (type: string, id = "") => {
      deleteType.value = type;
      deleteId.value = id;
      showDeleteModal.value = true;
    };

    const confirmDelete = async () => {
      isDeleting.value = true;
      if (deleteType.value === "single") {
        await deleteSingleItem(deleteId.value);
      } else {
        await deleteMultipleItems();
      }
      isDeleting.value = false;
      showDeleteModal.value = false;
    };

    const deleteSingleItem = async (id: string) => {
      try {
        const body = { ids: [id] };
        const { data: resdel, error } = await restAPI.cms.deleteStudents({
          body,
        });

        if (resdel?.value?.status) {
          message.success("Xóa học viên thành công!");
          await loadData(); // Refresh the data
        } else {
          const errorCode = error.value?.data?.error;
          const errorMessage =
            ERROR_CODES[errorCode as keyof typeof ERROR_CODES] ||
            resdel?.value?.message ||
            "Đã xảy ra lỗi, vui lòng thử lại!";

          message.warning(errorMessage);
        }
      } catch (err) {
        message.error("Lỗi khi xóa học viên.");
      } finally {
        isDeleting.value = false;
        delModal.value = false;
        deleteTarget.value = null;
      }
    };

    const deleteMultipleItems = async () => {
      let successCount = 0;
      let errorCount = 0;
      let body = { ids: selectedId.value };

      try {
        const { data: resdel, error } = await restAPI.cms.deleteStudents({
          body,
        });

        if (resdel?.value?.status) {
          successCount = body.ids.length;
          message.success(`Xóa thành công ${successCount} học viên!`);
        } else {
          errorCount = body.ids.length;
          const errorCode = error?.value?.data?.error;
          const errorMessage =
            ERROR_CODES[errorCode as keyof typeof ERROR_CODES] ||
            resdel?.value?.message ||
            "Đã xảy ra lỗi, vui lòng thử lại!";
          message.warning(errorMessage);
        }
      } catch (err) {
        errorCount = body.ids.length;
        message.error(
          `Lỗi xóa ${errorCount} học viên: ${(err as Error).message}`,
        );
      }

      loadData();
    };

    return {
      isDeleting,
      deleteTarget,
      showDeleteModal,
      deleteType,
      confirmDelete,
      openDeleteModal,
      edit,
      delModal,
      activeItem,
      accountStatus,
      data,
      columns: createColumns(),
      dataTableInst: dataTableInstRef,
      checkedRowKeys: checkedRowKeysRef,
      massEdit,
      pagination: paginationReactive,
      // filterStatus() {
      //   if (dataTableInstRef.value) {
      //     if (activeItem.value === "Tất cả trạng thái") {
      //       if (accountStatus.value == "All") {
      //         dataTableInstRef.value.filter(null);
      //       } else {
      //         dataTableInstRef.value.filter({
      //           accstatus: [accountStatus.value || ""],
      //         });
      //       }
      //     } else {
      //       if (accountStatus.value == "All") {
      //         dataTableInstRef.value.filter({
      //           status: [activeItem.value || ""],
      //         });
      //       } else {
      //         dataTableInstRef.value.filter({
      //           status: [activeItem.value || ""],
      //           accstatus: [accountStatus.value || ""],
      //         });
      //       }
      //     }
      //   }
      // },

      filterStatus() {
        if (dataTableInstRef.value) {
          if (accountStatus.value == "All") {
            dataTableInstRef.value.filter(null);
          } else {
            dataTableInstRef.value.filter({
              accstatus: [accountStatus.value || ""],
            });
          }
        }
      },
      rowKey: (row: RowData) => row.id,
      handleCheck(rowKeys: DataTableRowKey[]) {
        checkedRowKeysRef.value = rowKeys;
        selectedRows.value = data.value.filter((row) =>
          rowKeys.includes(row.id),
        );
      },
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
          label: "Dừng hoạt động",
          value: "Dừng hoạt động",
        },
      ],
    };
  },
});
interface RowData {
  id: string;
  stt: number;
  tthv: string;
  mhht: string;
  mdxl: string;
  ncn: string;

  accstatus: string;
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
  <div class="flex h-full w-full overflow-auto rounded-2xl">
    <!-- Main Content -->
    <div class="flex-1">
      <!-- Content Area -->
      <div class="h-full text-black">
        <n-card class="h-full bg-gray-50" :body-style="{ padding: '0' }">
          <div class="text-[#133D85] md:flex md:justify-between">
            <h1 class="text-3xl font-bold">Danh sách học viên</h1>
            <n-button
              type="info"
              class="h-15 mt-2 flex w-52 items-center justify-center text-center text-xl md:mt-0"
              @click="$router.push('hocvieninfo')"
            >
              Thêm học viên
              <i class="fa-solid fa-plus ml-1 px-2"></i>
            </n-button>
          </div>
          <div class="mt-3 grid w-full grid-cols-1 gap-2.5 md:grid-cols-3">
            <div>
              <n-input
                type="text"
                placeholder="Tìm kiếm tên, số điện thoại, email học viên"
              />
            </div>
            <div>
              <n-select :options="options" placeholder="Tuần này" />
            </div>
            <div>
              <n-select
                v-model="accountStatus"
                :options="statusoptions"
                @update-value="
                  (() => {
                    accountStatus = $event;
                    filterStatus();
                  })()
                "
                placeholder="Trạng thái tài khoản"
              />
            </div>

            <div
              class="flex flex-col-reverse justify-between gap-3 md:col-span-3 md:flex-row"
            >
              <!-- Left Action Buttons -->
              <div
                class="flex flex-col gap-3 md:flex-row md:items-center md:gap-3"
              >
                <div class="flex gap-3">
                  <n-button type="info" class="max-w-full" @click="massEdit(1)">
                    Dừng hoạt động
                  </n-button>

                  <n-button type="info" class="max-w-full" @click="massEdit(2)">
                    Hoạt động
                  </n-button>
                </div>

                <n-button
                  type="error"
                  ghost
                  @click="openDeleteModal('multiple')"
                  class="w-1/3 min-w-[128px] md:ml-auto"
                >
                  <i class="fa-solid fa-trash mr-1"></i>
                  Xóa lựa chọn
                </n-button>
              </div>

              <!-- Right Action Buttons -->
              <div class="flex gap-3">
                <n-button type="info">
                  Nhập file
                  <i class="fa-solid fa-cloud-arrow-up ml-1"></i>
                </n-button>

                <n-button type="info" class="">
                  Xuất file
                  <i class="fa-solid fa-file-export ml-1"></i>
                </n-button>
              </div>
            </div>

            <!-- Data Table -->
            <div class="col-span-1 md:col-span-3">
              <n-data-table
                ref="dataTableInst"
                :bordered="false"
                :single-line="false"
                :columns="columns"
                :data="data"
                :scroll-x="1000"
                :pagination="pagination"
                :row-key="rowKey"
                @update:checked-row-keys="handleCheck"
              />
            </div>
          </div>
        </n-card>
      </div>
    </div>
    <n-modal v-model:show="showDeleteModal">
      <n-card
        title="Xác nhận xóa"
        @close="showDeleteModal = false"
        class="mx-24"
      >
        <p v-if="deleteType === 'single'">
          Bạn có chắc chắn muốn xóa học viên này không?
        </p>
        <p v-else>Bạn có chắc chắn muốn xóa các học viên đã chọn không?</p>
        <template #footer>
          <n-space justify="end">
            <n-button @click="showDeleteModal = false">Hủy</n-button>
            <!-- ### -->
            <n-button type="error" @click="confirmDelete" :loading="isDeleting">
              Xóa
            </n-button>
          </n-space>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>
