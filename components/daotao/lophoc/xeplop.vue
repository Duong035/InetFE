<script lang="ts">
import { defineComponent, ref, computed, onMounted, toRaw } from "vue";
import { message } from "ant-design-vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

export default defineComponent({
  components: { VueDatePicker },
  setup() {
    interface RowData {
      id: string;
      subjectName: string;
      classType: string;
      startAt: string;
      status: string;
      endAt: string;
      name: string;
      totalLessons: number;
    }

    const { restAPI } = useApi();
    const data = ref<RowData[]>([]);
    const showSchedule = ref(false);
    const currentClass = ref<RowData | null>(null);
    const scheduleMode = ref<"date" | "week">("week");
    const classrooms = ref<{ id: string; name: string }[]>([]);

    const route = useRoute();
    const newId = route.query.id;
    const selectedDates = ref<Date[]>([]);
    const schedule = ref<
      {
        date: string;
        session: string | null;
        time: string | null;
        teacher: string | null;
        assistant: string | null;
        room: string | null;
      }[]
    >([]);

    //  Lọc ngày hợp lệ dựa trên startAt và endAt
    const availableDates = computed(() => {
      if (!currentClass.value) return [];
      return selectedDates.value.filter(
        (date) =>
          new Date(date) >= new Date(currentClass.value!.startAt) &&
          new Date(date) <= new Date(currentClass.value!.endAt),
      );
    });

    // Lọc ngày nếu ngày bắt đầu từ trước
    const computedMinDate = computed(() => {
      if (!currentClass.value) return new Date();

      const startAt = currentClass.value.startAt
        ? new Date(currentClass.value.startAt)
        : null;
      const today = new Date();

      return startAt && startAt > today ? startAt : today;
    });

    // Load danh sách phòng học từ API
    const loadClassrooms = async () => {
      try {
        const { data: resData, error } = await restAPI.cms.getClassrooms({});
        if (error?.value) {
          message.error(
            error.value.data?.message || "Lỗi tải danh sách phòng học",
          );
          return;
        }
        classrooms.value = resData.value?.data?.classrooms || [];
      } catch (err) {
        message.error("Lỗi tải danh sách phòng học.");
      }
    };

    const loadData = async () => {
      try {
        const { data: resData, error } = await restAPI.cms.getClasses({});
        if (error?.value) {
          message.error(error.value.data?.message || "Lỗi tải dữ liệu");
          return;
        }
        const rawData = toRaw(resData.value)?.data?.classes;
        if (Array.isArray(rawData)) {
          data.value = rawData.map((item: any) => ({
            id: item.id || "N/A",
            classType: item.type ? `${item.type}` : "N/A",
            startAt: item.start_at?.split("T")[0] || "N/A",
            endAt: item.end_at?.split("T")[0] || "N/A",
            status: item.status,
            name: item.name,
            subjectName: item.subject?.name || "N/A",
            totalLessons: item.subject?.total_lessons || 0,
          }));
        }
      } catch (err) {
        message.error("Lỗi tải dữ liệu.");
      }
    };

    // Khi chọn ngày, cập nhật danh sách lịch học
    const handleDateChange = (dates: Date[]) => {
      selectedDates.value = dates;
      schedule.value = dates.map((date) => ({
        date: date.toISOString().split("T")[0],
        session: null,
        time: null,
        teacher: null,
        assistant: null,
        room: null,
      }));
    };

    // Xoá một dòng lịch học
    const removeSchedule = (index: number) => {
      schedule.value.splice(index, 1);
    };

    // Xử lý lưu lịch học
    const handleSave = () => {
      if (schedule.value.some((s) => !s.session || !s.teacher || !s.room)) {
        message.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
        return;
      }
      console.log("Lịch học được lưu:", schedule.value);
    };

    const handleClose = () => {
      showSchedule.value = false;
      currentClass.value = null;
      selectedDates.value = [];
      scheduleMode.value = "week";
    };

    onMounted(async () => {
      await loadData();
      if (newId) {
        const foundClass = data.value.find((cls) => cls.id === newId);
        if (foundClass) {
          currentClass.value = foundClass;
          showSchedule.value = true;
        } else {
          message.error("Không tìm thấy lớp học");
        }
      }
    });

    return {
      data,
      showSchedule,
      currentClass,
      scheduleMode,
      computedMinDate,
      availableDates,
      handleSave,
      handleClose,
      handleDateChange,
      selectedDates,
      schedule,
      removeSchedule,
    };
  },
});
</script>

<template>
  <div class="h-full w-full overflow-auto rounded-2xl bg-white">
    <div class="mt-4 rounded-md border p-4">
      <h2 class="mb-2 text-xl font-bold">
        Xếp lịch học cho lớp: {{ currentClass?.name }}
      </h2>

      <div>
        <div class="mb-4 flex items-center gap-3">
          <n-radio-group v-model:value="scheduleMode">
            <n-space>
              <n-radio value="week">Tuần</n-radio>
              <n-radio value="date">Chọn ngày</n-radio>
            </n-space>
          </n-radio-group>
          <span v-if="scheduleMode === 'date'" class="text-xs text-gray-400">
            (Hệ thống sẽ không tự tạo buổi học theo lịch tuần)
          </span>
        </div>

        <VueDatePicker
          v-if="scheduleMode === 'date'"
          v-model="selectedDates"
          :min-date="computedMinDate"
          :max-date="currentClass?.endAt"
          multi-dates
          inline
          auto-apply
          time-picker-inline
          @update:model-value="handleDateChange"
        />

        <div v-if="scheduleMode === 'date'">
          <div class="mt-4 flex items-center justify-between">
            <span>Số buổi cuối tháng: 0 buổi</span>
          </div>
          <span>Số buổi của lớp: {{ currentClass?.totalLessons }}</span>
        </div>
      </div>

      <div class="mt-4">
        <n-button type="primary" @click="handleSave">Lưu</n-button>
        <n-button class="ml-2" @click="handleClose">Đóng</n-button>
      </div>
      <div v-if="schedule.length" class="mt-4">
        <table class="w-full border-collapse border text-sm">
          <thead>
            <tr class="bg-gray-100">
              <th class="border p-2">Ngày học</th>
              <th class="border p-2">Ca học *</th>
              <th class="border p-2">Thời gian học *</th>
              <th class="border p-2">Giảng viên *</th>
              <th class="border p-2">Trợ giảng</th>
              <th class="border p-2">Phòng học *</th>
              <th class="border p-2">Xoá</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in schedule" :key="index">
              <td class="border p-2">{{ item.date }}</td>
              <td class="border p-2">
                <select
                  v-model="item.session"
                  class="w-full rounded border p-1"
                >
                  <option value="" disabled>Chọn ca học</option>
                  <option value="Sáng">Sáng</option>
                  <option value="Chiều">Chiều</option>
                  <option value="Tối">Tối</option>
                </select>
              </td>
              <td class="border p-2">
                <input
                  v-model="item.time"
                  type="text"
                  placeholder="Giờ bắt đầu - Giờ kết thúc"
                  class="w-full rounded border p-1"
                />
              </td>
              <td class="border p-2">
                <select
                  v-model="item.teacher"
                  class="w-full rounded border p-1"
                >
                  <option value="" disabled>Chọn giảng viên</option>
                  <option value="GV1">GV1</option>
                  <option value="GV2">GV2</option>
                </select>
              </td>
              <td class="border p-2">
                <select
                  v-model="item.assistant"
                  class="w-full rounded border p-1"
                >
                  <option value="">Chọn trợ giảng</option>
                  <option value="TA1">TA1</option>
                  <option value="TA2">TA2</option>
                </select>
              </td>
              <td class="border p-2">
                <select v-model="item.room" class="w-full rounded border p-1">
                  <option value="" disabled>Chọn phòng học</option>
                  <option value="Phòng 101">Phòng 101</option>
                  <option value="Phòng 102">Phòng 102</option>
                </select>
              </td>
              <td class="border p-2 text-center">
                <button @click="removeSchedule(index)" class="text-red-500">
                  ❌
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="mt-4 flex justify-center">
          <button
            @click="handleSave"
            class="rounded bg-blue-500 px-4 py-2 text-white"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
table {
  border: 1px solid #ddd;
}
th,
td {
  text-align: center;
}
</style>
