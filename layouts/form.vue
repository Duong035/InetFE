<template>
  <div class="hero font-customFont h-screen w-full">
    <slot />
  </div>
</template>

<script setup></script>

<style scoped>
.hero {
  background: url("../public/images/bg.png");
  -ms-flex-align: center;
  background-attachment: fixed;
  background-color: white;
  background-size: cover;
  background-position: center;
  -ms-flex: auto;
  flex: auto;
}
</style>
