<template>
  <div class="editor">
    <div id="toolbar">
      <button class="ql-script" value="sub"></button>
      <button class="ql-check-atf" style="width: 80px; border: 1px solid black">
        Check ATF
      </button>
      <button class="ql-lemmatize" style="width: 75px; border: 1px solid black">
        Lemmatize
      </button>
    </div>
    <div ref="editorNode"></div>
    <pre>{{ editorContent}}</pre>
  </div>
</template>

<script lang="ts">
// See this for general idea: https://lobotuerto.com/blog/a-wysiwyg-editor-component-with-vuejs-and-quill/

import { defineComponent, ref, onMounted } from "vue";
import Quill from "quill";

export default defineComponent({
  name: "Editor",
  setup() {
    const editorContent = ref(null);
    const editorNode = ref<Element | null>(null);
    let editorInstance: any;

    const setEditorContent = () => {
      editorContent.value = editorInstance.getText().trim()
        ? editorInstance.root.innerHTML
        : "";
    };

    const onEditorContentChange = () => {
      console.log("Contents changed!");
      setEditorContent()
    };

    onMounted(() => {
      if (editorNode.value !== null) {
        console.log("Loading editor");
        const editorOpts = {
          modules: {
            toolbar: {
              container: "#toolbar",
              handlers: {
                "check-atf": function() {
                  console.log("Check atf!");
                },
                lemmatize: function() {
                  console.log("Lemmatize!");
                },
              },
            },
          },
          theme: "snow",
        };
        editorInstance = new Quill(editorNode.value, editorOpts);
        editorInstance.on("text-change", onEditorContentChange);
      }
    });

    return { editorContent, editorNode };
  },
});
</script>

<style src="quill/dist/quill.snow.css"></style>
<style>
.ql-container {
  font-family: monospace;
}
.ql-editor {
  counter-reset: line;
  padding-left: 0;
}

.ql-editor p:before {
  counter-increment: line;
  content: counter(line);
  display: inline-block;
  border-right: 1px solid #ddd;
  padding: 0 0.5em;
  margin-right: 0.5em;
  color: #888;
}
</style>
