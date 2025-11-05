// Load todos from localStorage or use default items
let todo_items = [];

// Add new todo
function addTodo() {
  const todoInput = document.getElementById("todo-input");
  const user_input = todoInput.value.trim();

  if (user_input === "") {
    alert("Please enter a valid todo item.");
    return;
  }

  const payload = {
    id: crypto.randomUUID(),
    task: user_input,
    done: false,
  };

  fetch("http://127.0.0.1:8000/todo/add-item", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then(async (response) => {
      let dataFromServer = await response.json();
      console.log("🚀 ~ addTodo ~ dataFromServer:", dataFromServer);

      if (dataFromServer.success) {
        alert("Item added successfully!");
        renderTodoList(); // refresh list from DB
      }
    })
    .catch((error) => {
      console.error("Error From Server:", error);
    });

  todoInput.value = "";
}

// Render Todo List
async function renderTodoList() {
  try {
    let todoItems = await fetch("http://127.0.0.1:8000/todo/get-items");
    todoItems = await todoItems.json();

    console.log("🚀 ~ renderTodoList ~ todoItems:", todoItems);

    todo_items = todoItems.items;

    const todoList = document.getElementById("todo-list");
    todoList.innerHTML = "";

    todo_items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card p-4 rounded";
      card.innerHTML = `
        <div class="flex items-center justify-between shadow p-3 px-5 rounded-xl bg-gray-300">
          <p class="text-gray-700">${item.task}</p>
          <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded" onclick="deleteTodo('${item.id}')">
            Delete
          </button>
        </div>
      `;
      todoList.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching todos:", error);
  }
}

// Delete Todo
function deleteTodo(id) {
  fetch(`http://127.0.0.1:8000/todo/delete-item/${id}`, {
    method: "DELETE",
  })
    .then(async (response) => {
      let dataFromServer = await response.json();
      console.log("🚀 ~ deleteTodo ~ dataFromServer:", dataFromServer);

      if (dataFromServer.success) {
        alert("Item deleted successfully!");
        renderTodoList(); // refresh list from DB
      } else {
        alert("Error: " + dataFromServer.message);
      }
    })
    .catch((error) => {
      console.error("Error From Server:", error);
    });
}

async function renderTodoList() {
  try {
    let todoItems = await fetch("http://127.0.0.1:8000/todo/get-items");
    todoItems = await todoItems.json();

    todo_items = todoItems.items;

    const todoList = document.getElementById("todo-list");
    todoList.innerHTML = "";

    todo_items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card p-4 rounded";

      card.innerHTML = `
        <div class="flex items-center justify-between shadow p-3 px-5 rounded-xl bg-gray-300">
          <p class="text-gray-700 ${item.done ? `line-through text-green-600`: ''}">
            ${item.task}
          </p>
          <div class="flex gap-2">
            <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded" onclick="updateTodo('${item.id}')">
              ${item.done ? 'Done' : 'Mark Done'}
            </button>
            <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded" onclick="deleteTodo('${item.id}')">
              Delete
            </button>
          </div>
        </div>
      `;
      todoList.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching todos:", error);
  }
}
function updateTodo(id, currentStatus) {
  fetch(`http://127.0.0.1:8000/todo/update-item/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(!currentStatus), // toggle status
  })
    .then(async (response) => {
      let dataFromServer = await response.json();
      console.log("🚀 ~ updateTodo ~ dataFromServer:", dataFromServer);

      if (dataFromServer.success) {
        renderTodoList();
      } else {
        alert("Error: " + dataFromServer.message);
      }
    })
    .catch((error) => {
      console.error("Error From Server:", error);
    });
}

// Input enter key listener
document.getElementById("todo-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addTodo();
  }
});

// Initial load
renderTodoList();


