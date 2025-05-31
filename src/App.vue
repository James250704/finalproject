<template>
  <div id="app">
    <Headernav />
    <router-view class="container"></router-view>
  </div>
</template>

<script>
import Headernav from "@/components/Headernav.vue";

export default {
  name: "App",
  components: {
    Headernav,
  },
};
</script>