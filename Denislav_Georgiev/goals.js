document.addEventListener('DOMContentLoaded', () => {
    const goalForm = document.getElementById('goal-form');
    const goalInput = document.getElementById('goalInput');
    const goalType = document.getElementById('goalType');
    const dailyGoalsList = document.getElementById('dailyGoalsList');
    const weeklyGoalsList = document.getElementById('weeklyGoalsList');

    let goals = JSON.parse(localStorage.getItem('ff-goals')) || [
        { text: "Пиене на 2л вода", type: "daily", completed: false },
        { text: "Прочитане на 50 страници от книга", type: "weekly", completed: true }
    ];

    function saveGoals() {
        localStorage.setItem('ff-goals', JSON.stringify(goals));
    }

    function renderGoals() {
        dailyGoalsList.innerHTML = '';
        weeklyGoalsList.innerHTML = '';

        goals.forEach((goal, index) => {
            const li = document.createElement('li');

            if (goal.completed) {
                li.classList.add('completed');
            }

            li.innerHTML = `
                <label>
                    <input type="checkbox" ${goal.completed ? 'checked' : ''} data-index="${index}">
                    ${goal.text}
                </label>
                <button class="delete-btn" data-index="${index}">&times;</button>
            `;

            if (goal.type === 'daily') {
                dailyGoalsList.appendChild(li);
            } else {
                weeklyGoalsList.appendChild(li);
            }
        });
    }

    goalForm.addEventListener('submit', (e) => {
        e.preventDefault(); 

        const text = goalInput.value.trim();
        const type = goalType.value;

        if (text === '') return;

        goals.push({
            text: text,
            type: type,
            completed: false
        });

        saveGoals();
        renderGoals();

        goalInput.value = '';
    });

    function handleListClick(e) {
        const target = e.target;
        const index = target.getAttribute('data-index');

        if (index === null) return;

        if (target.type === 'checkbox') {
            goals[index].completed = target.checked;
        } else if (target.classList.contains('delete-btn')) {
            goals.splice(index, 1);
        }

        saveGoals();
        renderGoals();
    }

    dailyGoalsList.addEventListener('click', handleListClick);
    weeklyGoalsList.addEventListener('click', handleListClick);

    renderGoals();
});