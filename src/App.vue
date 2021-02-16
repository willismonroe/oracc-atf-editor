<template>
<div class="content">
  <Editor />
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Editor from '@/components/Editor.vue'

export default defineComponent({
  name: 'App',
  components: {
    Editor
  }
});
</script>

<style>
/* custom font */
@import url('https://fonts.googleapis.com/css2?family=Jost');

/* variables */
:root {
    --primary: #6886c5;
    --secondary: #ebebeb;
    --warning: #da0f41;
}

/* base styles  */
* {
    /* margin: 0;
    padding: 0; */
    font-family: "Jost", sans-serif;
    color: #444444;
}
body {
    background: #f9f9f9;
}
.content {
  max-width: 1100px;
  margin: 20px auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 1px 2px 3px rgba(50, 50, 50, 0.05);
  border: 1px solid var(--secondary);
  background: white;
}
</style>
