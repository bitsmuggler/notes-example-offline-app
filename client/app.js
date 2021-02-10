const notebookChangedEventName = 'notebook-changed';
const noteDeletedEventName = 'note-deleted';
const notesSyncEventName = 'sync-notes';

let db = null;

function getNotebookChangedEvent(notebookId) {
  return new CustomEvent(notebookChangedEventName, { detail: { notebookId: notebookId } });
}

function getNotebookTemplate(note) {
  return `<a href="#/notebooks/${note.id}" class="dropdown-item"><div class="col-xs-5"><span>${note.id}</span></div><div class="col-xs-1"><span class="badge badge-${note.notes > 0 ? 'success' : 'light'}">${note.notes ? note.notes : 0} Notes</span></div></a>`;
}

function clearCurrentNotebooks() {
  let containerElement = document.querySelector('.dropdown-toggle');
  containerElement.innerHTML = '';
}

function addNotebooksToNavigationMenu(notebookId) {
  let containerElement = document.querySelector('#notebooks');
  let newNotebookElement = document.createElement('div');
  newNotebookElement.innerHTML = getNotebookTemplate(notebookId);
  containerElement.appendChild(newNotebookElement);
}

function addNotes(notes) {
  if (notes) {
debugger;
    let containerElement = document.querySelector('#notes');
    containerElement.innerHTML = '';

    notes.forEach((note) => {
      addNote(note);
    });
  } else {
    console.warn('No notes found in this notebook.');
  }
}

function addNote(note) {
  let containerElement = document.querySelector('#notes');
  let newNoteElement = new NoteElement(note, getCurrentNotebookId());
  containerElement.appendChild(newNoteElement);
}

async function getNotebooks() {
  const response = await fetch('/notebooks');
  return await response.json();
}

async function getNotes(notebookId) {
  const response = await fetch(`/notebooks/${notebookId}`);
  return await response.json();
}

function getCurrentNotebookId() {
  let hashSplitResult = location.hash.split('/');
  let currentNotebookId = hashSplitResult[hashSplitResult.length - 1]
  return currentNotebookId;
}

function setNotebookSelectionName(notebookId) {
  let dropdown = document.querySelector("#notebookSelection");
  dropdown.innerHTML = notebookId;
}

function initNavigation() {
  clearCurrentNotebooks();
  getNotebooks().then(notebooks => {
    notebooks.forEach(notebook => {
      addNotebooksToNavigationMenu(notebook);
    });
  });
}

async function createNote(notebookId, noteData) {
  if (navigator.onLine) {
    const response = await fetch(`/notebooks/${notebookId}/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: noteData });
    return await response.json();
  } else {
    let note = JSON.parse(noteData);
    return await db.notes.add({
      notebookId: notebookId,
      title: note.title,
      message: note.message,
      date: note.date,
      synch: false
    });
  }
}

function createNotebook() {
  fetch(`/notebooks/`, { method: 'POST' }).then(() => {
    initNavigation();
  });
}

function getNoteDataFromModalForm(form) {
  let formData = new FormData(form);
  let object = {};
  formData.forEach((value, key) => { object[key] = value });
  object.date = new Date();
  return JSON.stringify(object);
}

function listenToNotesCreation() {
  let form = document.querySelector('#noteForm');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    let data = getNoteDataFromModalForm(event.target);

    createNote(getCurrentNotebookId(), data).then((d) => {
      addNote(JSON.parse(data));

      // Unfortunately jQuery --> closing a bootstrap modal dialog with vanillajs is hard
      $('#addNoteModal').modal('hide');
    });
  });
}

function renderNotes(notebookId) {
  if (notebookId) {
    setNotebookSelectionName(notebookId);
    getNotes(notebookId).then(data => {
      addNotes(data.notes);
    });
  }
}

function openDatabase() {
  db = new Dexie('notes');

  db.version(1).stores({
    notes: '++id, notebookId, title, message, date, synched'
  });
}

function deleteNoteInSynchDb(note) {
  db.transaction('rw', db.notes, async () => {
     await db.notes.where("id").equals(note.id).delete();
  }).then(() => {
    console.log('Transaction committed.');
  }).catch(err => {
    console.error(err.stack);
  });
}

function syncNotes() {
  return db.transaction('rw', db.notes, async () => {
    await db.notes.each(note => {
      createNote(getCurrentNotebookId(), JSON.stringify(note));
      deleteNoteInSynchDb(note);
    });
  });
}

function bootstrap() {

  if (!window.indexedDB) {
    console.warn('Your browser has not any IndexedDB Support!');
  } else {
    openDatabase();
  }

  initNavigation();
  listenToNotesCreation();
  let selectedNotebookId = getCurrentNotebookId();
  setNotebookSelectionName(selectedNotebookId);
  renderNotes(selectedNotebookId);
}

window.onhashchange = () => {
  let currentNotebookId = getCurrentNotebookId();
  let event = getNotebookChangedEvent(currentNotebookId);
  document.body.dispatchEvent(event);
}

document.body.addEventListener(notebookChangedEventName, (event) => {
  let notebookId = event.detail.notebookId;
  renderNotes(notebookId);
});

document.body.addEventListener(noteDeletedEventName, () => {
  let notebookId = getCurrentNotebookId();
  renderNotes(notebookId);
});

window.addEventListener('online', () => {
  syncNotes();
});

bootstrap();