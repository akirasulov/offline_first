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
      activeNote: {},
    };
  },

  async created() {
    this.database = await this.getDB();
    let notes = await this.getNotes();
    this.notes = notes.reverse();
  },

  mounted() {
    this.editor = new Editor({
      content: "Your note",
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
        let noteStore = this.database
          .transaction("notes", "readwrite")
          .objectStore("notes");
        let noteRequest = noteStore.get(this.activeNote.created);

        noteRequest.onerror = (e) => {
          reject("Error saving the note in the database.");
        };
        noteRequest.onsuccess = (e) => {
          let note = e.target.result;
          note.content = this.editor.getHTML();

          let updateRequest = noteStore.put(note);

          updateRequest.onerror = (e) => {
            reject("Error storing the updated note in the database.");
          };

          updateRequest.onsuccess = (e) => {
            let noteIndex = this.notes.findIndex(
              (n) => n.created == note.created
            );
            this.notes[noteIndex] = note;
            resolve();
          };
        };
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
    openNote(note) {
      this.editor.commands.setContent(note.content);
      this.activeNote = note;
    },
    showAllNotes() {
      this.editor.commands.clearContent();
      this.activeNote = {};
    },
    addNewNote() {
      return new Promise((resolve, reject) => {
        let transaction = this.database.transaction("notes", "readwrite");
        transaction.oncomplete = (e) => {
          resolve();
        };

        let now = new Date();
        let note = {
          content: "",
          created: now.getTime(),
        };
        this.notes.unshift(note);
        this.activeNote = note;
        transaction.objectStore("notes").add(note);
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
        <div
          class="flex mt-4 items-center justify-between flex-grow focus:outline-none"
        >
          <a
            class="ml-2 leading-none font-medium text-sm hover:text-gray-900"
            href=""
            @click.prevent="showAllNotes"
            >All Notes</a
          >
          <button @click="addNewNote">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-4 h-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </button>
        </div>

        <div class="mt-4">
          <a
            class="flex items-center h-8 text-sm pl-8 pr-3"
            href="#"
            v-for="note in notes"
            :key="note.created"
            @click.prevent="openNote(note)"
          >
            <span class="ml-2 leading-none">
              {{ new Date(note.created).toLocaleString() }}
            </span></a
          >
        </div>
      </div>
    </section>
    <main class="flex flex-col flex-grow" v-if="Object.keys(activeNote).length">
      <!-- Main Content - Editor -->
      <div class="flex flex-col flex-grow overflow-auto">
        <editor-content :editor="editor" />
      </div>
      <div class="h-16 bg-gray-100 border-t border-gray-300 text-right">
        <button @click="saveNote()">Save Note</button>
      </div>
    </main>
    <main class="flex flex-col flex-grow" v-else>
      <!-- Main Content - Notes List -->
      <div class="flex flex-col flex-grow overflow-auto">
        <div v-for="note in notes" :key="note.created">
          <div class="flex px-4 pt-3 pb-4">
            <div class="prose my-2 mx-auto">
              <div>
                <span class="ml-1 text-xs text-gray-500"
                  >Created on
                  {{ new Date(note.created).toLocaleString() }}</span
                >
              </div>
              <div v-html="note.content"></div>
            </div>
          </div>
          <hr class="w-full" />
        </div>
      </div>
    </main>
  </aside>
</template>

<style lang="postcss" scoped>
button {
  @apply bg-none border border-gray-900 rounded py-1 px-4 mr-4 mt-3 hover:bg-gray-900 hover:text-white transition-colors duration-300;
}
</style>
