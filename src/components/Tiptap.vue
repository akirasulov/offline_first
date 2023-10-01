<template>
  <editor-content :editor="editor" />
</template>

<script>
import StarterKit from "@tiptap/starter-kit";
import { Editor, EditorContent } from "@tiptap/vue-3";

export default {
  components: {
    EditorContent,
  },

  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },

  emits: ["update:modelValue"],

  data() {
    return {
      editor: null,
      database: null,
    };
  },

  watch: {
    modelValue(value) {
      // HTML
      const isSame = this.editor.getHTML() === value;

      // JSON
      // const isSame = JSON.stringify(this.editor.getJSON()) === JSON.stringify(value)

      if (isSame) {
        return;
      }

      this.editor.commands.setContent(value, false);
    },
  },

  async created() {
    this.database = await this.getDB();
  },

  mounted() {
    this.editor = new Editor({
      extensions: [StarterKit],
      editorProps: {
        attributes: {
          class: "prose my-6 mx-auto focus:outline-none",
        },
      },
      content: this.modelValue,
      onUpdate: () => {
        // HTML
        this.$emit("update:modelValue", this.editor.getHTML());

        // JSON
        // this.$emit('update:modelValue', this.editor.getJSON())
      },
    });
  },

  beforeUnmount() {
    this.editor.destroy();
  },

  methods: {
    async getDB() {
      return new Promise((resolve, reject) => {
        let db = window.indexedDB.open("notes");

        db.onerror = (e) => {
          reject("Error opening database.");
        };
        db.onsuccess = (e) => {
          console.log("db.onsuccess", e);
          resolve(e.target.result);
        };
        db.onupgradeneeded = (e) => {
          console.log("db.onupgradeneeded", e);
          e.target.result.createObjectStore("notes", {});
        };
      });
    },
  },
};
</script>
