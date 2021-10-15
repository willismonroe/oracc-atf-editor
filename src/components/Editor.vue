<template>
  <div class="editor">
    <p>Select your server:</p>
    <select v-model="server">
      <option disabled value="">Please selected a server</option>
      <option value="http://oracc.ub.uni-muenchen.de">Munich</option>
      <option value="http://build-oracc.museum.upenn.edu">Penn</option>
    </select>
    <br/>
    <br/>
    <div id="toolbar">
      <button class="ql-script" value="sub"></button>
      <button class="ql-check-atf" :disabled="!server" style="width: 80px; border: 1px solid black">
        Check ATF
      </button>
      <button class="ql-lemmatize" style="width: 75px; border: 1px solid black">
        Lemmatize
      </button>
    </div>
    <div ref="editorNode" style="height: 50rem;"></div>
    <br/>
    <pre v-if="ATFErrorsRawString">
      Server response:
      {{ ATFErrorsRawString }}
    </pre>
  </div>
</template>

<script lang="ts">
// See this for general idea: https://lobotuerto.com/blog/a-wysiwyg-editor-component-with-vuejs-and-quill/

import {defineComponent, ref, onMounted, computed} from "vue";
import Quill from "quill";
import {htmlToText} from "html-to-text";


import {sendCommand} from "@/utils/oracc_client";

interface TagDefinitions {
  tags?: Record<string, Object>
}

const convertSubToUnicode = function (text: any) {
  let result = '';
  for (let c in text) {
    switch (text[c]) {
      case '0':
        result += '₀';
        break;
      case '1':
        result += '₁';
        break;
      case '2':
        result += '₂';
        break;
      case '3':
        result += '₃';
        break;
      case '4':
        result += '₄';
        break;
      case '5':
        result += '₅';
        break;
      case '6':
        result += '₆';
        break;
      case '7':
        result += '₇';
        break;
      case '8':
        result += '₈';
        break;
      case '9':
        result += '₉';
        break;
      default:
        result += text[c];
        break;
    }
  }
  return result
}

const parseATFErrors = function (rawText: string): Object {
  const lineErrors: {[k: string]: string} = {}
  rawText.split(/\r?\n/).forEach((line) => {
    if (line.split(/:/).length > 1) {
      const [, lineNo, errorMessage] = line.split(/:/)
      // Don't replace earlier error for same line
      lineErrors[lineNo] = errorMessage
    }
  })
  return lineErrors
}

export default defineComponent({
  name: "Editor",
  setup() {
    const server = ref('');
    const editorContent = ref(null);
    const editorNode = ref<Element | null>(null);
    const ATFErrorsRawString = ref('')
    const ATFErrors = ref({})
    let editorInstance: any;

    const rawText = computed(() => {
      return htmlToText(editorContent.value ?? '',
          {
            wordwrap: 500,
            preserveNewlines: true,
            formatters: {
              'subscriptFormatter': function (elem: { children: any; }, walk: (arg0: any, arg1: any) => void, builder: any) {
                let text = convertSubToUnicode(elem.children[0].data)
                builder.addInline(text)
              },
              'pFormatter': function (elem: { children: any; }, walk: (arg0: any, arg1: any) => void, builder: any) {
                walk(elem.children, builder)
                if (elem.children[0].name != 'br') {
                  builder.addInline('\n')
                }
              }
            },
            tags: {
              'sub': {format: 'subscriptFormatter', options: {leadingLineBreaks: 0, trailingLineBreaks: 0}},
              'p': {format: 'pFormatter', options: {leadingLineBreaks: 1, trailingLineBreaks: 1}},
            }
          } as TagDefinitions)
    })

    const setEditorContent = () => {
      editorContent.value = editorInstance.getText().trim()
          ? editorInstance.root.innerHTML
          : "";
      localStorage.setItem('storedText', editorContent.value ?? '')
    };

    const onEditorContentChange = (delta: any, oldDelta: any, source: any) => {
      console.log(delta, oldDelta, source)
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
                "check-atf": async function () {
                  console.log("Check atf!");
                  ATFErrorsRawString.value = await sendCommand(server.value, "oracc.atf.check", "P393071.atf", rawText.value) as string
                  ATFErrorsRawString.value = ATFErrorsRawString.value.trim()
                  ATFErrors.value = parseATFErrors(ATFErrorsRawString.value)
                  console.log(ATFErrors.value)
                  for (let [lineNo, ] of Object.entries(ATFErrors.value)) {
                    console.log("Marking line:", lineNo)
                    console.log(editorInstance.formatLine(lineNo, 1))
                  }
                },
                "lemmatize": function () {
                  console.log("Lemmatize!");
                },
              },
            },
          },
          theme: "snow",
          formats: [
            "script", "background"
          ]
        };
        editorInstance = new Quill(editorNode.value, editorOpts);
        editorInstance.clipboard.dangerouslyPasteHTML(0,
            localStorage.getItem('storedText') ?? '""')
        editorInstance.on("text-change", onEditorContentChange);
        onEditorContentChange('', '', '')
      }
    });

    return {editorContent, editorNode, rawText, server, ATFErrorsRawString};
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

.ql-editor div:before {
  counter-increment: line;
  content: counter(line);
  display: inline-block;
  border-right: 1px solid #ddd;
  padding: 0 0.5em;
  margin-right: 0.5em;
  color: #888;
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

pre {
  white-space: pre-line;
}
</style>
