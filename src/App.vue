<template>
<div class="content">
  Editor here:
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
.content {
margin: 20px;
padding: 10px;
background-color: rgb(230, 222, 222);
border-radius: 5px;
}
</style>
