<script lang="ts" setup>
import { ref, onMounted } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const events = ref<any[]>([]);
const { restAPI } = useApi();

const fetchEvents = async () => {
  try {
    const data = await restAPI.cms.getClasses({});
    events.value = data.map((event: any) => ({
      title: event.name,
      date: event.start_date,
      start: event.start_time,
      end: event.end_time,
    }));
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu sự kiện:", error);
  }
};

onMounted(fetchEvents);

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: "timeGridWeek",
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay",
  },
  slotMinTime: "06:00:00", // Bắt đầu từ 6AM
  slotMaxTime: "23:00:00", // Kết thúc lúc 10PM
  editable: false,
  selectable: false,
  alldaySlot: false,
  contentHeight: "auto",
  events: [
    // nếu có data từ api trả về thì xóa hết trong event đi
    {
      title: "Design Thinking 1",
      start: "2025-03-22T08:00:00",
      end: "2025-03-22T10:30:00",
      color: "#FBCFE8",
    },
    {
      title: "Design Thinking 1",
      start: "2025-03-18T10:30:00",
      end: "2025-03-18T12:00:00",
      color: "#86EFAC",
    },
    {
      title: "Design Thinking 1",
      start: "2025-03-19T08:00:00",
      end: "2025-03-19T10:30:00",
      color: "#93C5FD",
    },
    {
      title: "Design Thinking 1",
      start: "2025-03-17T13:00:00",
      end: "2025-03-17T14:30:00",
      color: "#FCA5A5",
    },
    {
      title: "Design Thinking 1",
      start: "2025-03-19T15:00:00",
      end: "2025-03-19T16:30:00",
      color: "#E9D5FF",
    },
  ],
  select: (info: any) => {
    alert(`Bạn đã chọn: ${info.startStr} đến ${info.endStr}`);
  },
  eventClick: (info: any) => {
    alert(`Sự kiện: ${info.event.title}`);
  },
});
</script>

<template>
  <div class="h-fit w-full overflow-auto rounded-2xl bg-white">
    <FullCalendar
      :options="calendarOptions"
      class="rounded-lg bg-white p-4 shadow-md"
    />
  </div>
</template>
