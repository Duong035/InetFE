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
    const dates = ref<Date[]>([]);
    const route = useRoute();
    const newId = route.query.id;

    // ✅ Lọc ngày hợp lệ dựa trên startAt và endAt
    const availableDates = computed(() => {
      if (!currentClass.value) return [];
      return dates.value.filter(
        (date) =>
          new Date(date) >= new Date(currentClass.value!.startAt) &&
          new Date(date) <= new Date(currentClass.value!.endAt),
      );
    });

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

    // ✅ Hàm xử lý khi chọn ngày
    const handleDateChange = (selectedDates: Date[]) => {
      if (selectedDates.length > 0) {
        showSchedule.value = true;
        dates.value = selectedDates;
      }
    };

    const handleSave = () => {
      console.log("Lưu lịch học", {
        mode: scheduleMode.value,
        dates: dates.value,
      });
      showSchedule.value = false;
    };

    const handleClose = () => {
      showSchedule.value = false;
      currentClass.value = null;
      dates.value = [];
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
      dates,
      availableDates,
      handleSave,
      handleClose,
      handleDateChange,
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

        <!-- ✅ VueDatePicker với sự kiện update -->
        <VueDatePicker
          v-model="dates"
          :min-date="currentClass?.startAt"
          :max-date="currentClass?.endAt"
          multi-dates
          inline
          auto-apply
          @update:model-value="handleDateChange"
        />

        <div class="mt-4 flex items-center justify-between">
          <span>Số buổi cuối tháng: 0 buổi</span>
        </div>
        <span>Số buổi của lớp: {{ currentClass?.totalLessons }}</span>
      </div>

      <div class="mt-4">
        <n-button type="primary" @click="handleSave">Lưu</n-button>
        <n-button class="ml-2" @click="handleClose">Đóng</n-button>
      </div>
    </div>
  </div>
</template>
