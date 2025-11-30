function addTask() {
  let task = document.getElementById("taskInput").value;
  if (!task) return;

  let li = document.createElement("li");
  li.innerHTML = '${task} <button onclick="removeTask(this)">X</button>';
  document.getElementById("taskList").appendChild(li);

  document.getElementById("taskInput").value = "";
}

function removeTask(btn) {
  btn.parentElement.remove();
}
