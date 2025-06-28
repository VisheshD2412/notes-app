/* Script for Notes App functionality */

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function () {
  // Select DOM elements
  const addNoteBtn = document.getElementById("addNoteBtn");
  const noteModal = document.getElementById("noteModal");
  const closeButton = document.querySelector(".close-button");
  const saveNoteBtn = document.getElementById("saveNoteBtn");
  const notesContainer = document.getElementById("notesContainer");
  const themeToggleBtn = document.getElementById("themeToggle");
  const searchInput = document.getElementById("searchInput");

  const noteTitleInput = document.getElementById("noteTitle");
  const noteBodyInput = document.getElementById("noteBody");
  const noteColorSelect = document.getElementById("noteColor");
  const notePinnedCheckbox = document.getElementById("notePinned");
  const modalTitle = document.getElementById("modalTitle");

  let notes = [];
  let editingNoteId = null;

  // Load saved notes and theme from localStorage
  loadNotes(); // loads notes array from localStorage
  loadTheme(); // applies saved theme (dark/light) if any
  displayNotes(); // render notes on page

  // Event listeners
  addNoteBtn.addEventListener("click", () => openModal("new"));
  closeButton.addEventListener("click", closeModal);
  saveNoteBtn.addEventListener("click", saveNote);
  themeToggleBtn.addEventListener("click", toggleTheme);
  searchInput.addEventListener("input", () => displayNotes(searchInput.value));

  /**
   * Open the modal for creating a new note or editing an existing one.
   */
  function openModal(mode, noteId) {
    noteModal.classList.add("show");
    if (mode === "edit" && noteId != null) {
      modalTitle.textContent = "Edit Note";
      const note = notes.find((n) => n.id === noteId);
      if (note) {
        noteTitleInput.value = note.title;
        noteBodyInput.value = note.body;
        noteColorSelect.value = note.color;
        notePinnedCheckbox.checked = note.pinned;
        editingNoteId = noteId;
      }
    } else {
      modalTitle.textContent = "New Note";
      noteTitleInput.value = "";
      noteBodyInput.value = "";
      noteColorSelect.value = "blue";
      notePinnedCheckbox.checked = false;
      editingNoteId = null;
    }
  }

  /** Close the modal without saving. */
  function closeModal() {
    noteModal.classList.remove("show");
    editingNoteId = null;
  }

  /** Save a new note or update an existing one. */
  function saveNote() {
    const title = noteTitleInput.value.trim();
    const body = noteBodyInput.value.trim();
    const color = noteColorSelect.value;
    const pinned = notePinnedCheckbox.checked;

    if (title === "" && body === "") {
      alert("Cannot save an empty note.");
      return;
    }

    const timestamp = new Date().toLocaleString();
    if (editingNoteId) {
      // Update existing note
      notes = notes.map((n) => {
        if (n.id === editingNoteId) {
          // Update properties of the note
          return { ...n, title, body, color, pinned, timestamp };
        }
        return n;
      });
    } else {
      // Create new note
      const newNote = {
        id: Date.now(), // unique ID based on timestamp
        title,
        body,
        color,
        pinned,
        timestamp,
      };
      notes.push(newNote);
    }

    saveNotes(); // Persist notes to localStorage
    displayNotes(searchInput.value); // Refresh displayed notes
    closeModal();
  }

  /**
   * Display notes in the page, optionally filtering by a search query.
   * Pinned notes are shown first.
   */
  function displayNotes(filter = "") {
    notesContainer.innerHTML = "";

    // Filter notes by title/body if a search query is provided
    let filteredNotes = notes;
    if (filter) {
      const query = filter.toLowerCase();
      filteredNotes = notes.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.body.toLowerCase().includes(query)
      );
    }

    // Sort: pinned notes first, then by newest
    filteredNotes.sort((a, b) => {
      if (a.pinned === b.pinned) {
        return b.id - a.id; // Newer (larger ID) first
      }
      return a.pinned ? -1 : 1;
    });

    // Create note card elements
    filteredNotes.forEach((note) => {
      const noteDiv = document.createElement("div");
      noteDiv.className = "note";
      noteDiv.dataset.color = note.color; // for color label styling

      // Pin icon
      if (note.pinned) {
        const pin = document.createElement("div");
        pin.className = "pin-icon";
        pin.textContent = "📌";
        noteDiv.appendChild(pin);
      }

      // Note title
      const titleElem = document.createElement("h3");
      titleElem.textContent = note.title;
      noteDiv.appendChild(titleElem);

      // Note body
      const bodyElem = document.createElement("p");
      bodyElem.textContent = note.body;
      noteDiv.appendChild(bodyElem);

      // Timestamp
      const timeElem = document.createElement("div");
      timeElem.className = "timestamp";
      timeElem.textContent = note.timestamp;
      noteDiv.appendChild(timeElem);

      // Action buttons: Edit, Delete, Pin/Unpin
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "actions";

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.className = "edit";
      editBtn.onclick = () => openModal("edit", note.id);
      actionsDiv.appendChild(editBtn);

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "delete";
      deleteBtn.onclick = () => {
        if (confirm("Delete this note?")) {
          notes = notes.filter((n) => n.id !== note.id);
          saveNotes();
          displayNotes(searchInput.value);
        }
      };
      actionsDiv.appendChild(deleteBtn);

      const pinBtn = document.createElement("button");
      pinBtn.textContent = note.pinned ? "Unpin" : "Pin";
      pinBtn.className = "pin";
      pinBtn.onclick = () => {
        note.pinned = !note.pinned;
        saveNotes();
        displayNotes(searchInput.value);
      };
      actionsDiv.appendChild(pinBtn);

      noteDiv.appendChild(actionsDiv);
      notesContainer.appendChild(noteDiv);
    });
  }

  /** Save the current notes array to localStorage for persistence [oai_citation_attribution:5‡developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#:~:text=,browser%20is%20closed%20and%20reopened). */
  function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(notes));
  }

  /** Load notes from localStorage, if available. */
  function loadNotes() {
    const saved = localStorage.getItem("notes");
    if (saved) {
      notes = JSON.parse(saved);
    }
  }

  /**
   * Toggle between dark and light themes.
   * Uses HTML data-theme attribute and saves preference [oai_citation_attribution:6‡whitep4nth3r.com](https://whitep4nth3r.com/blog/best-light-dark-mode-theme-toggle-javascript/#:~:text=We%20can%20use%20the%20localStorage,we%E2%80%99ll%20look%20for%20that%20first).
   */
  function toggleTheme() {
    const htmlElem = document.documentElement;
    if (htmlElem.getAttribute("data-theme") === "dark") {
      htmlElem.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    } else {
      htmlElem.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    }
  }

  /** On load, apply the saved theme from localStorage if it exists. */
  function loadTheme() {
    const htmlElem = document.documentElement;
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      htmlElem.setAttribute("data-theme", savedTheme);
    }
  }
});
