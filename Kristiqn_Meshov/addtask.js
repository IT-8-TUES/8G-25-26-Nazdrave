function addTask() {
    const taskInput =
        document.getElementById('task-input');
    const taskText =
        taskInput.value.trim();
    if(taskText === "") {
        alert("Въведете задача");
        return;
    }
    const taskList =
        document.getElementById('task-list');
    const li =
        document.createElement('li');
    li.textContent = taskText;
    taskList.appendChild(li);
    taskInput.value = "";
}