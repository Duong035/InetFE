<template>
  <div
    class="flex h-full w-full items-center justify-center overflow-auto rounded-2xl bg-gray-50 p-4"
  >
    <Popover class="relative">
      <PopoverButton
        class="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none"
      >
        Click me
      </PopoverButton>

      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <PopoverPanel
          class="absolute left-1/2 mt-2 w-48 -translate-x-1/2 transform rounded-lg bg-white p-4 shadow-lg"
        >
          <p class="text-gray-700">This is a popover!</p>
        </PopoverPanel>
      </transition>
    </Popover>
  </div>
</template>

<script setup>
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
</script>
