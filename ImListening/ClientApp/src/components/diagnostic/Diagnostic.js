
import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';

const Diagnostic = () => {
    const [data, setData] = useState([]);
    const chartRef = React.createRef();
    let chart = null;

    useEffect(() => {
        // Fetch the diagnostic data every 1 second
        const interval = setInterval(fetchDiagnostics, 1000);

        // Clean up the interval on component unmount
        return () => clearInterval(interval);
    }, []);

    const fetchDiagnostics = async () => {
        // Call the API to fetch the diagnostic data
        const response = await fetch('/api/diagnostics');
        const diagnostics = await response.json();

        // Update the state with the new data
        setData(prevData => [...prevData, diagnostics]);
    };

    useEffect(() => {
        // Render the chart when the data changes
        renderChart();
    }, [data]);

    const renderChart = () => {
        if (chart) {
            chart.destroy(); // Destroy the existing chart instance
        }

        const labels = data.map((_, index) => `#${index + 1}`);
        const cpuData = data.map(item => item.CPU);
        const rpsData = data.map(item => item.RPS);

        if (chart) {
            // Update the existing chart with new data
            chart.data.labels = labels;
            chart.data.datasets[0].data = cpuData;
            chart.data.datasets[1].data = rpsData;
            chart.update();
        } else {
            // Create a new chart
            const chartCanvas = chartRef.current.getContext('2d');
            chart = new Chart(chartCanvas, {
                type: 'line',
                data: {
                    labels,
                    datasets: [
                        {
                            label: 'CPU',
                            data: cpuData,
                            borderColor: 'red',
                            fill: false
                        },
                        {
                            label: 'RPS',
                            data: rpsData,
                            borderColor: 'blue',
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            type: 'category',
                            display: true,
                            title: {
                                display: true,
                                text: 'Time'
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Value'
                            }
                        }
                    }
                }
            });
        }
    };

    return (
        <div>
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

export default Diagnostic;
