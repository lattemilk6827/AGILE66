$(document).ready(function() {
    const gameId = $('#progress-bar').data('gameid');
    const userId = $('#progress-bar').data('userid');
    const maxMinutes = 15;
    let elapsedMinutes = localStorage.getItem(`elapsedMinutes_${gameId}_${userId}`) || 0;
    let secondsRemaining = (maxMinutes - elapsedMinutes) * 60;


    const updateProgressBar = () => {
        const percentage = ((maxMinutes * 60 - secondsRemaining) / (maxMinutes * 60)) * 100;
        $('#progress-bar').css('width', percentage + '%').attr('aria-valuenow', percentage);
        if (secondsRemaining <= 0) {
            $('#progress-bar').text('Completed');
        } else {
            const minutes = Math.floor(secondsRemaining / 60);
            const seconds = Math.round(secondsRemaining % 60); // Round off seconds to the nearest whole number
            $('#time-remaining').text(`Time remaining: ${minutes} minutes ${seconds} seconds`);
        }
    };

    const saveProgress = () => {
        const updatedElapsedMinutes = (maxMinutes * 60 - secondsRemaining) / 60;
        localStorage.setItem(`elapsedMinutes_${gameId}_${userId}`, updatedElapsedMinutes);
        $.post('/games/progress', { gameId, elapsedMinutes: updatedElapsedMinutes }, (response) => {
            console.log(`Progress saved: ${response}`);
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
            $('#time-remaining').text('Completed');
        }
    }, 1000);

    // Save progress every minute
    const progressInterval = setInterval(saveProgress, 60000);

    // Save progress before leaving the page
    $(window).on('beforeunload', function() {
        clearInterval(timerInterval);
        clearInterval(progressInterval);
        saveProgress();
    });

    // Initial update
    updateProgressBar();
});
