// Load Google Charts API for GeoChart
google.charts.load('current', {
    packages: ['geochart']
});
google.charts.setOnLoadCallback(drawWorldMap);

function drawWorldMap() {
    fetch("querie1.json")
        .then(res => res.json())
        .then(data => {
            // Country to Flag mapping
            const flagMap = {
                "Argentina": "🇦🇷", "Australia": "🇦🇺", "Austria": "🇦🇹", "Belgium": "🇧🇪",
                "Brazil": "🇧🇷", "Canada": "🇨🇦", "Chile": "🇨🇱", "Czech Republic": "🇨🇿",
                "Denmark": "🇩🇰", "Finland": "🇫🇮", "France": "🇫🇷", "Germany": "🇩🇪",
                "Hungary": "🇭🇺", "India": "🇮🇳", "Ireland": "🇮🇪", "Italy": "🇮🇹",
                "Netherlands": "🇳🇱", "Norway": "🇳🇴", "Poland": "🇵🇱", "Portugal": "🇵🇹",
                "Spain": "🇪🇸", "Sweden": "🇸🇪", "United Kingdom": "🇬🇧", "USA": "🇺🇸"
            };
            // Genre to value mapping
            const genreMap = { "Rock": 1, "Latin": 2 };

            // Tooltip returns innerHTML using CSS classes (not inline styles)
            function tooltipHTML(country, genre) {
                const flag = flagMap[country] || "🌍";
                const dotClass = genre === "Rock" ? "geo-dot-rock" : "geo-dot-latin";
                return `
                    <div class="geo-tooltip">
                        <span class="geo-flag">${flag} ${country}</span>
                        <div class="geo-row">
                            <span class="${dotClass}"></span>
                            <span>${genre}</span>
                        </div>
                    </div>
                `;
            }

            // Google-format with HTML-tooltip
            const chartData = [
                ["Country", "GenreValue", { type: "string", role: "tooltip", p: { html: true } }]
            ];
            data.forEach(item => {
                chartData.push([
                    item.Country,
                    genreMap[item.Genre],
                    tooltipHTML(item.Country, item.Genre)
                ]);
            });

            const dataTable = google.visualization.arrayToDataTable(chartData);
            const chart = new google.visualization.GeoChart(
                document.getElementById('chart-worldMap')
            );
            chart.draw(dataTable, {
                colorAxis: {
                    minValue: 1,
                    maxValue: 2,
                    colors: ['#5C6BC0', '#FBC02D']
                },
                legend: 'none',
                backgroundColor: '#263238',
                datalessRegionColor: '#37474F',
                tooltip: { isHtml: true }
            });
        });
}

// Pie Chart – Global Genre
fetch("globalChart.json")
    .then(response => response.json())
    .then(data => {
        data.sort((a, b) => b.PercentShare - a.PercentShare);
        const top4 = data.slice(0, 4);
        const other = data.slice(4).reduce((sum, item) => sum + item.PercentShare, 0);
        const labels = [...top4.map(item => item.Genre), "Other"];
        const values = [...top4.map(item => item.PercentShare), other];
        new Chart(document.getElementById("globalChart"), {
            type: "pie",
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: ["#5C6BC0", "#FBC02D", "#81C784", "#4DB6AC", "#FF8A65"]
                }]
            }
        });
    });

// Doughnut Chart – Top 1 Artist & Songs
fetch('querie3.json')
    .then(res => res.json())
    .then(data => {
        const labels = data.map(item => item.Artist);
        const sales = data.map(item => item.TotalSales);
        const ctx = document.getElementById("artistChart").getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Sales',
                    data: sales,
                    backgroundColor: ["#5C6BC0", "#FBC02D", "#81C784"],
                    borderColor: 'rgba(75,192,192,1)',
                    borderWidth: 1,
                }]
            }
        });
    });

// Line Chart – Genre Growth Popularity
fetch('querie4.json')
    .then(response => {
        if (!response.ok) throw new Error('HTTP error ' + response.status);
        return response.json();
    })
    .then(data => {
        const labels = Object.keys(data[0]).filter(key => /^\d{4}$/.test(key));
        const colors = ["#BA68C8", "#FBC02D", "#FF8A65"];
        const datasets = data.map((item, idx) => ({
            label: item.Genre,
            data: labels.map(year => item[year]),
            backgroundColor: colors[idx % colors.length],
            borderColor: colors[idx % colors.length],
            fill: false,
            tension: 0.3
        }));
        const ctx = document.getElementById('growthChart');
        new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Development in sold tracks per genre (2009–2013) for the three genres that have evolved the most'
                    },
                    legend: { position: 'bottom' }
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Solgte tracks' } }
                }
            }
        });
    })
    .catch(error => console.error('Error fetching JSON:', error));
