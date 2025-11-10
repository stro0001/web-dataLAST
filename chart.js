

// Chart 4 - Genre Growth Popularity
const ctx = document.getElementById('chart-growth');

new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['2009', '2010', '2011', '2012', '2013'],
        datasets: [
            {
                label: 'TV Shows',
                data: [0, 13, 14, 13, 7],
                borderColor: '#E74C3C',
                fill: false,
                tension: 0.3
            },
            {
                label: 'Drama',
                data: [0, 9, 6, 9, 5],
                borderColor: '#3498DB',
                fill: false,
                tension: 0.3
            },
            {
                label: 'Bossa Nova',
                data: [1, 2, 8, 0, 4],
                borderColor: '#2ECC71',
                fill: false,
                tension: 0.3
            }
        ]
    },
    options: {
        plugins: {
            title: {
                display: true,
                text: 'Udvikling i solgte tracks pr. genre (2009–2013)'
            },
            legend: { position: 'bottom' }
        },
        scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Solgte tracks' } }
        }
    }
});