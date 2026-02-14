// Todo App JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Task Status Toggle (Complete/Incomplete)
    const statusToggles = document.querySelectorAll('.task-status-toggle');
    statusToggles.forEach(toggle => {
        toggle.addEventListener('change', async function() {
            const taskId = this.dataset.taskId;
            const newStatus = this.checked ? 'completed' : 'pending';
            
            try {
                // Show loading state
                this.disabled = true;
                const taskItem = this.closest('.list-group-item');
                taskItem.classList.add('task-fade');
                
                // Send API request
                const response = await fetch(`/tasks/${taskId}/status`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: newStatus })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Update UI
                    taskItem.classList.remove('task-fade');
                    
                    // Reload page after short delay to show updated state
                    setTimeout(() => {
                        window.location.reload();
                    }, 300);
                    
                    // Show success notification
                    showNotification('Task updated successfully!', 'success');
                } else {
                    throw new Error(data.error || 'Update failed');
                }
                
            } catch (error) {
                console.error('Error updating task:', error);
                
                // Revert checkbox
                this.checked = !this.checked;
                
                // Show error
                showNotification('Failed to update task. Please try again.', 'error');
                
                // Remove loading state
                this.disabled = false;
                const taskItem = this.closest('.list-group-item');
                taskItem.classList.remove('task-fade');
            }
        });
    });
    
    // Delete Task
    const deleteButtons = document.querySelectorAll('.delete-task');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const taskId = this.dataset.taskId;
            
            if (!confirm('Are you sure you want to delete this task?')) {
                return;
            }
            
            try {
                // Show loading state
                this.innerHTML = '<i class="bi bi-hourglass"></i>';
                this.disabled = true;
                
                // Send API request
                const response = await fetch(`/tasks/${taskId}/status`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: 'deleted' })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Remove task from UI with animation
                    const taskItem = this.closest('.list-group-item');
                    taskItem.style.opacity = '0';
                    taskItem.style.transform = 'translateX(-20px)';
                    
                    setTimeout(() => {
                        taskItem.remove();
                        showNotification('Task moved to trash', 'info');
                        
                        // Update task count if visible
                        updateTaskCount('pending', -1);
                    }, 300);
                } else {
                    throw new Error(data.error || 'Delete failed');
                }
                
            } catch (error) {
                console.error('Error deleting task:', error);
                showNotification('Failed to delete task. Please try again.', 'error');
                
                // Reset button
                this.innerHTML = '<i class="bi bi-trash"></i>';
                this.disabled = false;
            }
        });
    });
    
    // Restore Task
    const restoreButtons = document.querySelectorAll('.restore-task');
    restoreButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const taskId = this.dataset.taskId;
            
            try {
                // Show loading state
                this.innerHTML = '<i class="bi bi-hourglass"></i>';
                this.disabled = true;
                
                // Send API request
                const response = await fetch(`/tasks/${taskId}/status`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: 'pending' })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Remove task from deleted list
                    const taskItem = this.closest('.list-group-item');
                    taskItem.style.opacity = '0';
                    taskItem.style.transform = 'translateX(20px)';
                    
                    setTimeout(() => {
                        taskItem.remove();
                        showNotification('Task restored successfully!', 'success');
                    }, 300);
                } else {
                    throw new Error(data.error || 'Restore failed');
                }
                
            } catch (error) {
                console.error('Error restoring task:', error);
                showNotification('Failed to restore task. Please try again.', 'error');
                
                // Reset button
                this.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i>';
                this.disabled = false;
            }
        });
    });
    
    // Task Form Validation
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', function(e) {
            const titleInput = this.querySelector('input[name="title"]');
            
            if (!titleInput.value.trim()) {
                e.preventDefault();
                titleInput.focus();
                titleInput.classList.add('is-invalid');
                
                // Add error message
                let errorDiv = titleInput.nextElementSibling;
                if (!errorDiv || !errorDiv.classList.contains('invalid-feedback')) {
                    errorDiv = document.createElement('div');
                    errorDiv.className = 'invalid-feedback';
                    errorDiv.textContent = 'Please enter a task title';
                    titleInput.parentNode.appendChild(errorDiv);
                }
                
                return false;
            }
        });
    }
    
    // Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
    
    // Helper Functions
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        notification.innerHTML = `
            <i class="bi ${getIconForType(type)} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                const bsAlert = new bootstrap.Alert(notification);
                bsAlert.close();
            }
        }, 3000);
    }
    
    function getIconForType(type) {
        switch(type) {
            case 'success': return 'bi-check-circle';
            case 'error': return 'bi-exclamation-circle';
            case 'warning': return 'bi-exclamation-triangle';
            default: return 'bi-info-circle';
        }
    }
    
    function updateTaskCount(status, change) {
        // Update stats cards if they exist
        const statCards = {
            'pending': document.querySelector('.stat-card.bg-warning h2'),
            'completed': document.querySelector('.stat-card.bg-success h2'),
            'total': document.querySelector('.stat-card.bg-primary h2')
        };
        
        Object.entries(statCards).forEach(([key, element]) => {
            if (element) {
                let currentCount = parseInt(element.textContent) || 0;
                
                if (key === status) {
                    element.textContent = Math.max(0, currentCount + change);
                }
                
                if (key === 'total' && (status === 'pending' || status === 'completed')) {
                    element.textContent = Math.max(0, currentCount + change);
                }
            }
        });
    }
    
    // Priority Color Coding
    function applyPriorityColors() {
        document.querySelectorAll('.list-group-item').forEach(item => {
            const priorityBadge = item.querySelector('.badge');
            if (priorityBadge) {
                if (priorityBadge.textContent.includes('High')) {
                    item.classList.add('priority-high');
                } else if (priorityBadge.textContent.includes('Medium')) {
                    item.classList.add('priority-medium');
                } else if (priorityBadge.textContent.includes('Low')) {
                    item.classList.add('priority-low');
                }
            }
        });
    }
    
    // Apply on page load
    applyPriorityColors();
});