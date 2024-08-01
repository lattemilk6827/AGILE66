document.addEventListener('DOMContentLoaded', function() {
    const gameId = document.getElementById('progress-bar').dataset.gameid;
    const userId = document.getElementById('progress-bar').dataset.userid;
    const maxMinutes = 15;
    let elapsedMinutes = localStorage.getItem(`elapsedMinutes_${gameId}_${userId}`) || 0;
    let secondsRemaining = (maxMinutes - elapsedMinutes) * 60;

    const updateProgressBar = () => {
        const percentage = ((maxMinutes * 60 - secondsRemaining) / (maxMinutes * 60)) * 100;
        const progressBar = document.getElementById('progress-bar');
        progressBar.style.width = percentage + '%';
        progressBar.setAttribute('aria-valuenow', percentage);
        if (secondsRemaining <= 0) {
            progressBar.textContent = 'Completed';
        } else {
            const minutes = Math.floor(secondsRemaining / 60);
            const seconds = secondsRemaining % 60;
            document.getElementById('time-remaining').textContent = `Time remaining: ${minutes} minutes ${seconds} seconds`;
        }
    };

    const saveProgress = () => {
        const updatedElapsedMinutes = (maxMinutes * 60 - secondsRemaining) / 60;
        localStorage.setItem(`elapsedMinutes_${gameId}_${userId}`, updatedElapsedMinutes);
        $.post('/games/progress', { gameId, elapsedMinutes: updatedElapsedMinutes }, (response) => {
            console.log('Progress saved:', response);
        }).fail((error) => {
            console.error('Error saving progress:', error);
        });
    };

    // Update the countdown timer every second
    const timerInterval = setInterval(() => {
        if (secondsRemaining > 0) {
            secondsRemaining--;
            updateProgressBar();
        } else {
            clearInterval(timerInterval);
            document.getElementById('time-remaining').textContent = 'Completed';
        }
    }, 1000);

    // Save progress every minute
    const progressInterval = setInterval(saveProgress, 60000);

    // Save progress before leaving the page
    window.addEventListener('beforeunload', function() {
        clearInterval(timerInterval);
        clearInterval(progressInterval);
        saveProgress();
    });

    // Initial update
    updateProgressBar();
});
