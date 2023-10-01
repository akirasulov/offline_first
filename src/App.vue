<script>
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
      database: null,
      notes: [],
    };
  },

  async created() {
    this.database = await this.getDB();
    let notes = await this.getNotes();
    this.notes = notes.reverse();
  },

  mounted() {
    this.editor = new Editor({
      content: "<p>I’m running Tiptap with Vue.js. 🎉</p>",
      extensions: [StarterKit],
      editorProps: {
        attributes: {
          class: "prose my-6 mx-auto focus:outline-none",
        },
      },
    });
  },

  beforeUnmount() {
    this.editor.destroy();
  },

  methods: {
    async getDB() {
      return new Promise((resolve, reject) => {
        let db = window.indexedDB.open("notes", 2);

        db.onerror = (e) => {
          reject("Error opening database.");
        };
        db.onsuccess = (e) => {
          console.log("db.onsuccess", e);
          resolve(e.target.result);
        };
        db.onupgradeneeded = (e) => {
          console.log("db.onupgradeneeded", e);
          e.target.result.deleteObjectStore("notes");
          e.target.result.createObjectStore("notes", { keyPath: "created" });
        };
      });
    },
    saveNote() {
      return new Promise((resolve, reject) => {
        let transaction = this.database.transaction("notes", "readwrite");
        transaction.oncomplete = (e) => {
          resolve();
        };

        let now = new Date();
        let note = {
          content: this.editor.getHTML(),
          created: now.getTime(),
        };
        this.notes.unshift(note);
        transaction.objectStore("notes").add(note);
      });
    },
    getNotes() {
      return new Promise((resolve, reject) => {
        this.database
          .transaction("notes")
          .objectStore("notes")
          .getAll().onsuccess = (e) => {
          console.log("getNotes()", e.target.result);
          resolve(e.target.result);
        };
      });
    },
  },
};
</script>

<template>
  <aside class="flex w-screen h-screen text-gray-700">
    <section
      class="flex flex-col flex-shrink-0 w-64 border-r border-gray-300 bg-gray-100"
    >
      <!-- SideBar -->
      <div class="h-0 overflow-auto flex-grow">
        <div class="mt-4">
          <a
            class="flex items-center h-8 text-sm pl-8 pr-3"
            href="#"
            v-for="note in notes"
            :key="note.created"
          >
            <span class="ml-2 leading-none">
              {{ new Date(note.created).toLocaleString() }}
            </span></a
          >
        </div>
      </div>
    </section>
    <main class="flex flex-col flex-grow">
      <!-- Main Content -->
      <div class="flex flex-col flex-grow overflow-auto">
        <editor-content :editor="editor" />
      </div>
      <div class="h-16 bg-gray-100 border-t border-gray-300 text-right">
        <button @click="saveNote()">Save Note</button>
      </div>
    </main>
  </aside>
</template>

<style lang="postcss" scoped>
button {
  @apply bg-none border border-gray-900 rounded py-1 px-4 mr-4 mt-3 hover:bg-gray-900 hover:text-white transition-colors duration-300;
}
</style>
