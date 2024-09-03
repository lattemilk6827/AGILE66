$(document).ready(function() {
    // Retrieve the gameId and userId from data attributes in the progress bar element
    const gameId = $('#progress-bar').data('gameid');
    const userId = $('#progress-bar').data('userid');

    // Set the maximum time for game completion in minutes
    const maxMinutes = 15;

    // Retrieve the elapsed minutes from local storage, or default to 0 if not found
    let elapsedMinutes = localStorage.getItem(`elapsedMinutes_${gameId}_${userId}`) || 0;

    // Calculate the remaining seconds based on the elapsed time
    let secondsRemaining = (maxMinutes - elapsedMinutes) * 60;

    // Function to update the progress bar and display the remaining time
    const updateProgressBar = () => {
        // Calculate the progress percentage based on the time remaining
        const percentage = ((maxMinutes * 60 - secondsRemaining) / (maxMinutes * 60)) * 100;

        // Update the progress bar's width and ARIA value to reflect progress
        $('#progress-bar').css('width', percentage + '%').attr('aria-valuenow', percentage);

        // Check if the timer has completed
        if (secondsRemaining <= 0) {
            // If completed, update the progress bar text to indicate completion
            $('#progress-bar').text('Completed');
        } else {
            // If not completed, calculate the remaining minutes and seconds
            const minutes = Math.floor(secondsRemaining / 60);
            const seconds = Math.round(secondsRemaining % 60); // Round off seconds to the nearest whole number
            
            // Update the displayed remaining time
            $('#time-remaining').text(`Time remaining: ${minutes} minutes ${seconds} seconds`);
        }
    };

    // Function to save the current progress to local storage and the server
    const saveProgress = () => {
        // Calculate the updated elapsed time in minutes
        const updatedElapsedMinutes = (maxMinutes * 60 - secondsRemaining) / 60;

        // Save the updated elapsed minutes to local storage
        localStorage.setItem(`elapsedMinutes_${gameId}_${userId}`, updatedElapsedMinutes);

        // Send a POST request to the server to save the progress
        $.post('/games/progress', { gameId, elapsedMinutes: updatedElapsedMinutes }, (response) => {
            // Log a message on successful save
            console.log(`Progress saved: ${response}`);
        }).fail((error) => {
            // Log an error message if the save fails
            console.error('Error saving progress:', error);
        });
    };

    // Set up an interval to update the countdown timer every second
    const timerInterval = setInterval(() => {
        if (secondsRemaining > 0) {
            // Decrement the remaining seconds
            secondsRemaining--;

            // Update the progress bar and displayed time
            updateProgressBar();
        } else {
            // If the timer has completed, stop the timer and update the display
            clearInterval(timerInterval);
            $('#time-remaining').text('Completed');
        }
    }, 1000); // Update every second

    // Set up an interval to save the progress every minute
    const progressInterval = setInterval(saveProgress, 60000); // Save progress every 60 seconds

    // Save the current progress before the user leaves the page
    $(window).on('beforeunload', function() {
        // Clear the timer and progress intervals
        clearInterval(timerInterval);
        clearInterval(progressInterval);

        // Save the final progress
        saveProgress();
    });

    // Perform an initial update of the progress bar and time display when the page loads
    updateProgressBar();
});
