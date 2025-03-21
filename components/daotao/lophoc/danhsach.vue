<script lang="ts">
import type { DataTableColumns } from "naive-ui";
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
import { useRouter, useRoute } from "vue-router";

export default defineComponent({
  setup() {
    interface RowData {
      id: string;
      stt: number;
      tthv: string;
      ncn: string;
      accstatus: string;
    }
    const message = useMessage();

    const route = useRoute();
    const classId = computed(() => route.query.id || null);
    const { restAPI } = useApi();
    const data = ref<RowData[]>([]);

    // Modal state
    const showModal = ref(false);
    const selectedStudents = ref<string[]>([]);
    const studentsList = ref<any[]>([]);

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
    const newId = route.query.id;

    onMounted(() => {
      loadData();
      console.log("ID lớp học1:", newId);
    });
    // gọi danh sách học viên
    const loadData = async () => {
      try {
        const { data: resData, error } = await restAPI.cms.getClassStudent({
          id: newId,
        });

        if (error?.value) {
          message.error(error?.value?.data?.message || "Lỗi tải dữ liệu");
          return;
        }

        const rawData = toRaw(resData.value)?.data;
        const studentsData = rawData?.data || [];

        data.value = studentsData.map((item: any, index: any) => ({
          id: item.id || "N/A",
          stt: index + 1,
          tthv: item.full_name || "N/A",
          ncn: item.updated_at
            ? dayjs(item.updated_at).format("DD-MM-YYYY")
            : "N/A",
          accstatus:
            item.status === 2
              ? "Hoạt động"
              : item.status === 1
                ? "Dừng hoạt động"
                : "N/A",
        }));
      } catch (err) {
        message.error("Lỗi tải dữ liệu.");
      }
    };
    // Fetch danh sách học viên chưa thêm vào lớp
    const fetchStudents = async () => {
      try {
        const { data: resData, error } = await restAPI.cms.getStudents({});
        if (error?.value) {
          message.error(
            error?.value?.data?.message || "Lỗi tải danh sách học viên",
          );
          return;
        }

        // Kiểm tra dữ liệu trả về có phải là một mảng không
        const rawData = resData.value?.data;
        studentsList.value = Array.isArray(rawData?.data) ? rawData.data : [];
        showModal.value = true;
      } catch (err) {
        message.error("Lỗi tải danh sách học viên.");
      }
    };

    // Gửi danh sách học viên đã chọn lên API
    const handleSubmit = async () => {
      try {
        const body = {
          class_id: classId.value,
          student_id: selectedStudents.value,
        };
        console.log(JSON.stringify(body, null, 2));
        const { error } = await restAPI.cms.addStudentsToClass({
          body,
        });

        if (error?.value) {
          message.error(error?.value?.data?.message || "Lỗi thêm học viên");
          return;
        }

        message.success("Thêm học viên thành công!");
        showModal.value = false;
      } catch (err) {
        message.error("Lỗi khi gửi dữ liệu.");
      }
      loadData();
    };
    // Cấu hình cột cho bảng học viên
    const studentColumns: DataTableColumns<any> = [
      { type: "selection" }, // Thêm title và key
      { title: "ID", key: "id" },
      { title: "Tên học viên", key: "full_name" },
      { title: "Email", key: "email" },
    ];

    function createColumns(): DataTableColumns<RowData> {
      return [
        { type: "selection" },
        {
          title: "STT",
          key: "stt",
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
          title: "Ngày cập nhật",
          key: "ncn",
          defaultSortOrder: "ascend",
          sorter: "default",
        },
        {
          title: "Trạng thái tài khoản",
          key: "accstatus",
          render(row) {
            let color = row.accstatus === "Hoạt động" ? "#00974F" : "gray";
            return h("span", { style: { color } }, row.accstatus);
          },
        },
      ];
    }

    return {
      classId,
      data,
      columns: createColumns(),
      pagination: paginationReactive,
      showModal,
      studentsList,
      selectedStudents,
      handleSubmit,
      fetchStudents,
      studentColumns,
    };
  },
});
</script>

<template>
  <div class="flex h-full w-full overflow-auto rounded-2xl bg-gray-50">
    <div class="flex-1">
      <div class="h-full text-black">
        <n-card class="h-full bg-gray-50">
          <div class="flex items-center justify-between text-[#133D85]">
            <h1 class="text-4xl font-bold">
              Danh sách học viên của lớp {{ classId }}
            </h1>
            <n-button
              type="info"
              class="h-15 flex w-52 items-center justify-center text-center text-xl"
              @click="fetchStudents"
            >
              Thêm học viên
              <i class="fa-solid fa-plus ml-1 px-2"></i>
            </n-button>
          </div>
          <n-data-table
            :columns="columns"
            :data="data"
            :pagination="pagination"
          />
          <n-modal v-model:show="showModal">
            <n-card
              style="width: 800px"
              title="Chọn học viên"
              closable
              @close="showModal = false"
            >
              <n-data-table
                :columns="studentColumns"
                :data="studentsList"
                :row-key="(row) => row.id"
                v-model:checked-row-keys="selectedStudents"
              />

              <template #footer>
                <div class="flex justify-end space-x-2">
                  <n-button @click="showModal = false">Hủy</n-button>
                  <n-button type="primary" @click="handleSubmit"
                    >Xác nhận</n-button
                  >
                </div>
              </template>
            </n-card>
          </n-modal>
        </n-card>
      </div>
    </div>
  </div>
</template>
