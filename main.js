const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "Book_APPS";

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function addBook() {
  const inputJudul = document.getElementById("inputBookTitle").value;
  const inputPenulis = document.getElementById("inputBookAuthor").value;
  const inputTahun = parseInt(document.getElementById("inputBookYear").value);
  const isComplete = document.getElementById("inputBookIsComplete").checked;
  console.log(isComplete);
  const bookId = generateId();
  const bookObject = generateBookObject(
    bookId,
    inputJudul,
    inputPenulis,
    inputTahun,
    isComplete
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function removeBooks(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function makeBook(bookObject) {
  const inputJudul = document.createElement("h2");
  inputJudul.innerText = bookObject.title;

  const inputPenulis = document.createElement("p");
  inputPenulis.innerText = "Penulis :" + bookObject.author;

  const inputTahun = document.createElement("p");
  inputTahun.innerText = "Tahun :" + bookObject.year;

  const container = document.createElement("article");
  container.classList.add("book_item");
  container.append(inputJudul, inputPenulis, inputTahun);
  container.setAttribute("id", `book-${bookObject.id}`);

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("action");

  if (bookObject.isComplete) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("green");
    undoButton.innerText = "Belum selesai dibaca";
    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });

    const removeButton = document.createElement("button");
    removeButton.classList.add("red");
    removeButton.innerText = "Hapus Buku";
    removeButton.addEventListener("click", function () {
      document.getElementById(`book-${bookObject.id}`).remove();
      removeBooks(bookObject.id);
    });

    buttonContainer.append(undoButton, removeButton);
  } else {
    const completeButton = document.createElement("button");
    completeButton.classList.add("green");
    completeButton.innerText = "Selesai dibaca";
    completeButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });

    const removeButton = document.createElement("button");
    removeButton.classList.add("red");
    removeButton.innerText = "Hapus Buku";
    removeButton.addEventListener("click", function () {
      document.getElementById(`book-${bookObject.id}`).remove();
      removeBooks(bookObject.id);
    });

    buttonContainer.append(completeButton, removeButton);
  }

  container.append(buttonContainer);
  return container;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
  if (data !== null) {
    for (const bookShelf of data) {
      books.push(bookShelf);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  //console.log(books);
  const uncompletedBOOKList = document.getElementById(
    "incompleteBookshelfList"
  );
  uncompletedBOOKList.innerHTML = "";

  const completedBOOKList = document.getElementById("completeBookshelfList");
  completedBOOKList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) {
      uncompletedBOOKList.append(bookElement);
    } else {
      completedBOOKList.append(bookElement);
    }
  }
});

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

const searchBook = document.getElementById("searchBook");
searchBook.addEventListener("submit", function (e) {
  e.preventDefault();

  const searchTitle = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();
  const bookTitle = document.querySelectorAll(".book_item > h2");

  for (const title of bookTitle) {
    if (searchTitle) {
      if (title.innerText.toLowerCase().includes(searchTitle)) {
        title.parentElement.style.display = "";
      } else {
        title.parentElement.style.display = "none";
      }
    } else {
      title.parentElement.style.display = "";
    }
  }
});
