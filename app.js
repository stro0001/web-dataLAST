// 1. Load Google Charts API for GeoChart
google.charts.load('current', {
    packages: ['geochart']
});
google.charts.setOnLoadCallback(drawWorldMap);

function drawWorldMap() {
    //Fetch data from querie1.json (countries + top genre)
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
                "Spain": "🇪🇸", "Sweden": "🇸🇪", "United Kingdom": "🇬🇧", "United States": "🇺🇸"
            };
            // Genre to value mapping
            const genreMap = {"Rock": 1, "Latin": 2};

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
                ["Country", "GenreValue", {type: "string", role: "tooltip", p: {html: true}}]
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
                tooltip: {isHtml: true}
            });
        });
}

//2. Pie Chart – Global Genre
fetch("querie2.json")
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

// 3. Doughnut Chart – Top 1 Artist & Songs

// Fetches data from a local JSON file instead of directly from the database.
// This is faster client-side because the data is already processed via SQL export.
fetch('querie3.json')
    .then(res => res.json())
    .then(data => {

        // Extract artist names to use as labels
        const labels = data.map(item => item.Artist);
        // Extract each artist's total sales
        const sales = data.map(item => item.TotalSales);
        // Get the canvas element where the chart will be drawn
        const ctx = document.getElementById("artistChart").getContext('2d');

        // Create a Doughnut chart (could also be Pie, Bar, etc.)
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels, // artist names
                datasets: [{
                    label: 'Total Sales',
                    data: sales,  // each artist's sales numbers
                    // Three colors for the top artists to visually separate them
                    backgroundColor: ["#5C6BC0", "#FBC02D", "#81C784"],
                    borderColor: 'rgba(75,192,192,1)',
                    borderWidth: 1,
                }]
            }
        });
    });

// 4. Line Chart – Genre Growth Popularity

// Same principle: data is fetched as JSON instead of SQL queries.
// We use static JSON because the browser cannot run SQL directly
// (unless using tools like Insomnia/WebStorm etc.)
fetch('querie4.json')
    .then(response => {
        if (!response.ok) throw new Error('HTTP error ' + response.status);
        return response.json();
    })
    // When data is ready, this function runs
    .then(data => {
        // Find all keys that look like years: 2009, 2010, 2011, 2012, 2013
        const labels = Object.keys(data[0]).filter(key => /^\d{4}$/.test(key));

        // Colors for each genre line
        const colors = ["#BA68C8", "#FBC02D", "#FF8A65"];

        // Create one dataset per genre
        const datasets = data.map((item, idx) => ({
            label: item.Genre, // Genre name shown in the legend
            data: labels.map(year => item[year]), // Values for each year
            backgroundColor: colors[idx % colors.length],
            borderColor: colors[idx % colors.length],
            fill: false,  // Do not fill the area under the line
            tension: 0.3 // Adds a smooth curve to the line
        }));

        // Create the Line Chart showing genre development over time
        const ctx = document.getElementById('growthChart');
        new Chart(ctx, {
            type: 'line',
            data: {labels, datasets},
            options: {
                plugins: {
                    title: {
                        display: true,
                        // Title describing the purpose of the chart
                        text: 'Development in sold tracks per genre (2009–2013) for the three genres that have evolved the most'
                    },
                    legend: {position: 'bottom'}
                },
                scales: {
                    y: {beginAtZero: true, title: {display: true, text: 'Sold tracks'}}
                }
            }
        });
    })
    // Show error in console if JSON file cannot be loaded
    .catch(error => console.error('Error fetching JSON:', error));



