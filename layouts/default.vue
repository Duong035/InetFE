<template>
  <div class="h-full w-full bg-gray-200">
    <header class="hero w-100px xl-bg-bottom flex bg-cover bg-top lg:bg-center">
      <TopNav />
    </header>
    <div class="mt-3 flex w-[calc(100%)]">
      <!-- overflow-auto -->
      <!-- <Sidebar /> -->
      <Menu class="w-72" />
      <!-- <Test /> -->
      <main class="mx-3 my-3 w-full overflow-y-scroll rounded-2xl">
        <slot />
        <!-- <content /> -->
      </main>
    </div>
  </div>
  <!-- <h2 class="pt-24 text-9xl font-bold tracking-wide text-yellow-100">
      Hello
    </h2> -->

  <!-- <MFooter />
  </div> -->
</template>
