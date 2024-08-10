// Drawing piechart in dashboard.ejs

// Destructure the useState and useEffect hooks from React object
const { useState, useEffect } = React;

// Defining as a functional React component
// Data variable used which holds the total time spent on each category of games
function PieChartComponent({ data }) {
    // Create a reference using React's useRef hook
    // Reference will be attached to the canvas element where the chart will be displayed
    const chartRef = React.useRef(null);

    // The useEffect hook is used to perform side effects in function components
    // Runs the code inside it after the component has rendered
    // Data Array ensures that the effect re-run only when data changes
    useEffect(() => {
        // Get the 2D drawing context of the canvas element 
        // Chart.js aids in drawing the pie chart
        const ctx = chartRef.current.getContext('2d');
        
        // Create a new Chart instance
        // First argument ctx specifies the rendering context
        // Second argument is a configuration object that defines the type, data and options for the chart
        new Chart(ctx, {
            // Defining the type of chart to be drawn, in our case is pie
            type: 'pie',
            data: {
                // Labels are the categories that will appear as legend and tooltips
                labels: ['Mind Games', 'Relaxation Games', 'Educational Games'],
                
                // Defining the datasets to be plotted
                datasets: [{
                    // Label for the dataset, can be used in the tooltips or legend
                    label: 'Total Time Spent (minutes)',
                    
                    // Data array corresponds to the labels ---> each value represents time spent on each category
                    data: [data.mind.toFixed(2), data.relaxation.toFixed(2), data.educational.toFixed(2)],
                    
                    // Background colors for each segment of the pie chart
                    // The colors correspond to the labels (Mind Games, Relaxation Games, Educational Games)
                    backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe'],
                    
                    // Hover effect for the segments; increases the size of the segment when hovered over
                    hoverOffset: 4
                }]
            },
            options: {
                // Make the chart responsive to changes in the screen size
                responsive: true,
                
                // Plugins provide additional functionality like legends, tooltips, etc.
                plugins: {
                    // Configure the legend that displays the labels and color codes
                    legend: {
                        // Position the legend at the top of the chart
                        position: 'top',
                    },
                    
                    // Title plugin displays a title at the top of the chart
                    title: {
                        // Enable the display of the title
                        display: true,
                        // The text to be displayed as the title
                        text: 'Find Out Where You Spent The Most/Least Time'
                    },
                    
                    // Tooltip plugin provides interactivity and shows additional data on hover
                    tooltip: {
                        // Customize the tooltips by using callbacks
                        callbacks: {
                            // Callback customises the content of the tooltips
                            label: function(context) {
                                // Calculate the total time spent by summing up all values in dataset
                                const total = context.dataset.data.reduce((sum, value) => sum + parseFloat(value), 0);
                                
                                // Calculate the percentage of the total time that each segment represents
                                const percentage = ((context.raw / total) * 100).toFixed(2);
                                
                                // Return the formatted label to be displayed in the tooltip
                                // The label includes the category name, raw time in minutes, and the percentage of total time
                                return `${context.label}: ${context.raw} minutes (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }, [data]); 

    // The component returns a canvas element to the DOM where the pie chart will be drawn
    // `ref` attribute links the canvas element to the `chartRef` reference, allowing access to the canvas from JavaScript
    return (
        React.createElement('canvas', { ref: chartRef, width: '450', height: '450' })
    );
}
