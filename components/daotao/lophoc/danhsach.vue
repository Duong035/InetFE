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
import { NButton, NDataTable } from "naive-ui";
import { useRoute } from "vue-router";

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
    const classId = ref(route.params.id);
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

        const rawData = resData.value?.data;
        const allStudents = Array.isArray(rawData?.data) ? rawData.data : [];

        // Lấy danh sách ID của học viên đã có trong lớp
        const existingStudentIds = new Set(
          data.value.map((student) => student.id),
        );

        studentsList.value = allStudents
          .filter((student: any) => !existingStudentIds.has(student.id))
          .map((student: any) => ({
            ...student,
            accstatus:
              Number(student.status) === 2
                ? "Hoạt động"
                : Number(student.status) === 1
                  ? "Không hoạt động"
                  : "N/A",
          }));

        // Lọc ra các học viên chưa có trong lớp
        studentsList.value = allStudents.filter(
          (student: any) => !existingStudentIds.has(student.id),
        );

        showModal.value = true;
      } catch (err) {
        message.error("Lỗi tải danh sách học viên.");
      }
    };
    // const fetchStudents = async () => {
    //   try {
    //     const { data: resData, error } = await restAPI.cms.getStudents({});

    //     if (error?.value) {
    //       message.error(
    //         error?.value?.data?.message || "Lỗi tải danh sách học viên",
    //       );
    //       return;
    //     }

    //     // Kiểm tra dữ liệu trả về có phải là một mảng không
    //     const rawData = resData.value?.data;

    //     studentsList.value = Array.isArray(rawData?.data)
    //       ? rawData.data.filter(
    //           (student) =>
    //             !data.value.map((record) => record.id).includes(student.id),
    //         )
    //       : [];
    //     showModal.value = true;
    //   } catch (err) {
    //     message.error("Lỗi tải danh sách học viên.");
    //   }
    // };

    // Gửi danh sách học viên đã chọn lên API
    const handleSubmit = async () => {
      try {
        const classIdFromPath = newId || route.params.id;

        if (!classIdFromPath) {
          message.error("Không tìm thấy ID lớp học!");
          return;
        }

        if (!selectedStudents.value || selectedStudents.value.length === 0) {
          message.error("Vui lòng chọn ít nhất một học viên!");
          return;
        }

        const requestData = {
          class_id: classIdFromPath,
          student_id: selectedStudents.value,
        };

        const { error } = await restAPI.cms.addStudentsToClass({
          body: requestData,
        });

        if (error?.value) {
          message.error(error?.value?.data?.message || "Lỗi thêm học viên");
          return;
        }

        message.success("Thêm học viên thành công!");
        showModal.value = false;
        await loadData();
      } catch (err) {
        console.error("Lỗi khi gửi dữ liệu:", err);
        message.error("Lỗi khi gửi dữ liệu.");
      }
    };

    // Cấu hình cột cho bảng học viên
    const studentColumns: DataTableColumns<any> = [
      { type: "selection" },
      { title: "Tên học viên", key: "full_name" },
      { title: "Số điện thoại", key: "phone" },
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
          <div class="mb-5 flex items-center justify-between text-[#133D85]">
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
          <n-modal v-model:show="showModal" :closable="false">
            <n-card style="width: 800px" @close="showModal = false">
              <h1 class="mb-5 text-2xl font-bold text-[#133D85]">
                Chọn học viên
              </h1>
              <n-data-table
                :columns="studentColumns"
                :data="studentsList"
                :row-key="(row) => row.id"
                v-model:checked-row-keys="selectedStudents"
              />

              <template #footer>
                <div class="flex justify-end space-x-2">
                  <n-button
                    ghost
                    @click="showModal = false"
                    style="width: 100px"
                  >
                    Hủy
                  </n-button>
                  <n-button
                    type="info"
                    @click="handleSubmit"
                    style="width: 100px"
                  >
                    Xác nhận
                  </n-button>
                </div>
              </template>
            </n-card>
          </n-modal>
        </n-card>
      </div>
    </div>
  </div>
</template>
