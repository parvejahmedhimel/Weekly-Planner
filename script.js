document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const homePage = document.getElementById('home-page');
    const plannerPage = document.getElementById('planner-page');
    const startPlanningBtn = document.getElementById('start-planning');
    const viewSummaryBtn = document.getElementById('view-summary');
    const resetWeekBtn = document.getElementById('reset-week');
    const summaryModal = document.getElementById('summary-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const downloadSummaryBtn = document.getElementById('download-summary');
    const weekContainer = document.querySelector('.week-container');
    const summaryStats = document.getElementById('summary-stats');
    const summaryFeedback = document.getElementById('summary-feedback');

    // Days of the week
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Initialize the app
    initApp();

    // Event Listeners
    startPlanningBtn.addEventListener('click', showPlannerPage);
    viewSummaryBtn.addEventListener('click', showSummaryModal);
    resetWeekBtn.addEventListener('click', resetWeek);
    closeModalBtn.addEventListener('click', closeSummaryModal);
    downloadSummaryBtn.addEventListener('click', downloadSummary);
    window.addEventListener('click', outsideModalClick);

    // Initialize the app
    function initApp() {
        // Check if there's any saved data
        const savedData = localStorage.getItem('weeklyPlannerData');
        
        if (!savedData) {
            // Create initial data structure
            const initialData = {
                tasks: {},
                lastUpdated: new Date().toISOString()
            };
            
            daysOfWeek.forEach(day => {
                initialData.tasks[day] = [
                    { text: 'Sample task - edit or delete me', completed: false }
                ];
            });
            
            localStorage.setItem('weeklyPlannerData', JSON.stringify(initialData));
        }
        
        // Render the week view
        renderWeekView();
    }

    // Show planner page
    function showPlannerPage() {
        homePage.classList.remove('active');
        plannerPage.classList.add('active');
    }

    // Render week view
    function renderWeekView() {
        weekContainer.innerHTML = '';
        
        const savedData = JSON.parse(localStorage.getItem('weeklyPlannerData'));
        
        daysOfWeek.forEach(day => {
            const dayCard = document.createElement('div');
            dayCard.className = 'day-card';
            
            // Calculate progress for the day
            const dayTasks = savedData.tasks[day] || [];
            const completedTasks = dayTasks.filter(task => task.completed).length;
            const progress = dayTasks.length > 0 ? Math.round((completedTasks / dayTasks.length) * 100) : 0;
            
            dayCard.innerHTML = `
                <div class="day-header">
                    <div class="day-name">${day}</div>
                    <div class="day-progress">${progress}%</div>
                </div>
                <div class="tasks-container" id="tasks-${day.toLowerCase()}"></div>
                <button class="add-task-btn" data-day="${day}">+ Add Task</button>
            `;
            
            weekContainer.appendChild(dayCard);
            
            // Render tasks for this day
            const tasksContainer = dayCard.querySelector(`#tasks-${day.toLowerCase()}`);
            renderTasksForDay(day, tasksContainer);
            
            // Add event listener for the add task button
            dayCard.querySelector('.add-task-btn').addEventListener('click', function() {
                addNewTask(day, tasksContainer);
            });
        });
    }

    // Render tasks for a specific day
    function renderTasksForDay(day, container) {
        container.innerHTML = '';
        
        const savedData = JSON.parse(localStorage.getItem('weeklyPlannerData'));
        const tasks = savedData.tasks[day] || [];
        
        tasks.forEach((task, index) => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" data-day="${day}" data-index="${index}" ${task.completed ? 'checked' : ''}>
                <input type="text" class="task-text ${task.completed ? 'completed' : ''}" value="${task.text}" data-day="${day}" data-index="${index}">
                <button class="delete-task-btn" data-day="${day}" data-index="${index}">×</button>
            `;
            
            container.appendChild(taskItem);
            
            // Add event listeners
            const checkbox = taskItem.querySelector('.task-checkbox');
            const textInput = taskItem.querySelector('.task-text');
            const deleteBtn = taskItem.querySelector('.delete-task-btn');
            
            checkbox.addEventListener('change', function() {
                toggleTaskComplete(day, index, this.checked);
            });
            
            textInput.addEventListener('change', function() {
                updateTaskText(day, index, this.value);
            });
            
            deleteBtn.addEventListener('click', function() {
                deleteTask(day, index);
            });
        });
    }

    // Add a new task
    function addNewTask(day, container) {
        const savedData = JSON.parse(localStorage.getItem('weeklyPlannerData'));
        
        if (!savedData.tasks[day]) {
            savedData.tasks[day] = [];
        }
        
        savedData.tasks[day].push({
            text: '',
            completed: false
        });
        
        localStorage.setItem('weeklyPlannerData', JSON.stringify(savedData));
        renderTasksForDay(day, container);
        
        // Focus on the new task input
        const newTaskInput = container.lastElementChild.querySelector('.task-text');
        newTaskInput.focus();
    }

    // Toggle task complete status
    function toggleTaskComplete(day, index, isCompleted) {
        const savedData = JSON.parse(localStorage.getItem('weeklyPlannerData'));
        
        if (savedData.tasks[day] && savedData.tasks[day][index]) {
            savedData.tasks[day][index].completed = isCompleted;
            savedData.lastUpdated = new Date().toISOString();
            
            localStorage.setItem('weeklyPlannerData', JSON.stringify(savedData));
            
            // Update the task text style
            const taskText = document.querySelector(`.task-text[data-day="${day}"][data-index="${index}"]`);
            if (taskText) {
                taskText.classList.toggle('completed', isCompleted);
            }
            
            // Update the day progress
            updateDayProgress(day);
        }
    }

    // Update task text
    function updateTaskText(day, index, newText) {
        const savedData = JSON.parse(localStorage.getItem('weeklyPlannerData'));
        
        if (savedData.tasks[day] && savedData.tasks[day][index]) {
            savedData.tasks[day][index].text = newText;
            savedData.lastUpdated = new Date().toISOString();
            
            localStorage.setItem('weeklyPlannerData', JSON.stringify(savedData));
        }
    }

    // Delete a task
    function deleteTask(day, index) {
        const savedData = JSON.parse(localStorage.getItem('weeklyPlannerData'));
        
        if (savedData.tasks[day] && savedData.tasks[day][index]) {
            savedData.tasks[day].splice(index, 1);
            savedData.lastUpdated = new Date().toISOString();
            
            localStorage.setItem('weeklyPlannerData', JSON.stringify(savedData));
            
            // Re-render the tasks for this day
            const tasksContainer = document.querySelector(`#tasks-${day.toLowerCase()}`);
            if (tasksContainer) {
                renderTasksForDay(day, tasksContainer);
                updateDayProgress(day);
            }
        }
    }

    // Update day progress
    function updateDayProgress(day) {
        const savedData = JSON.parse(localStorage.getItem('weeklyPlannerData'));
        const dayTasks = savedData.tasks[day] || [];
        const completedTasks = dayTasks.filter(task => task.completed).length;
        const progress = dayTasks.length > 0 ? Math.round((completedTasks / dayTasks.length) * 100) : 0;
        
        const dayProgressElement = document.querySelector(`.day-card:has(#tasks-${day.toLowerCase()}) .day-progress`);
        if (dayProgressElement) {
            dayProgressElement.textContent = `${progress}%`;
        }
    }

    // Show summary modal
    function showSummaryModal() {
        const savedData = JSON.parse(localStorage.getItem('weeklyPlannerData'));
        
        // Calculate totals
        let totalTasks = 0;
        let completedTasks = 0;
        
        daysOfWeek.forEach(day => {
            const dayTasks = savedData.tasks[day] || [];
            totalTasks += dayTasks.length;
            completedTasks += dayTasks.filter(task => task.completed).length;
        });
        
        const accuracy = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        // Update the summary stats
        summaryStats.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Total Tasks:</span>
                <span class="stat-value">${totalTasks}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Completed Tasks:</span>
                <span class="stat-value">${completedTasks}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Accuracy:</span>
                <span class="stat-value">${accuracy}%</span>
            </div>
        `;
        
        // Update the feedback
        summaryFeedback.className = '';
        summaryFeedback.classList.add('feedback');
        
        if (accuracy >= 90) {
            summaryFeedback.classList.add('feedback-excellent');
            summaryFeedback.textContent = '⭐ Excellent! Keep up the great work!';
        } else if (accuracy >= 70) {
            summaryFeedback.classList.add('feedback-good');
            summaryFeedback.textContent = '👍 Good job! You can do even better!';
        } else {
            summaryFeedback.classList.add('feedback-poor');
            summaryFeedback.textContent = '⚠️ Keep trying! Every small step counts!';
        }
        
        // Show the modal
        summaryModal.style.display = 'flex';
    }

    // Close summary modal
    function closeSummaryModal() {
        summaryModal.style.display = 'none';
    }

    // Close modal when clicking outside
    function outsideModalClick(e) {
        if (e.target === summaryModal) {
            closeSummaryModal();
        }
    }

    // Reset the week
    function resetWeek() {
        if (confirm('Are you sure you want to reset all tasks for this week?')) {
            const initialData = {
                tasks: {},
                lastUpdated: new Date().toISOString()
            };
            
            daysOfWeek.forEach(day => {
                initialData.tasks[day] = [];
            });
            
            localStorage.setItem('weeklyPlannerData', JSON.stringify(initialData));
            renderWeekView();
        }
    }

    // Download summary (simplified version)
    function downloadSummary() {
        alert('In a complete implementation, this would generate and download a summary image or PDF. For this demo, we\'re showing this message instead.');
    }
});
