<script setup>
import { ref } from "vue";
import TipTap from "../src/components/Tiptap.vue";

let content = ref("TipTap placeholder");
</script>

<template>
  <!-- <header></header> -->
  <aside class="flex w-screen h-screen text-gray-700">
    <section
      class="flex flex-col flex-shrink-0 w-64 border-r border-gray-300 bg-gray-100"
    >
      <!-- SideBar -->
    </section>
    <main class="flex flex-col flex-grow">
      <div class="flex flex-col flex-grow overflow-auto">
        <TipTap v-model="content" />
      </div>
    </main>
  </aside>
</template>
