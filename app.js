// 1. Load Google Charts API for GeoChart
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
                "Spain": "🇪🇸", "Sweden": "🇸🇪", "United Kingdom": "🇬🇧", "United States": "🇺🇸"
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

// 2. Pie Chart – Global Genre
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

// 3. Doughnut Chart – Top 1 Artist & Songs
// Henter data fra en lokal JSON-fil i stedet for, at det sker direkte fra databasen.
// Det er hurtigere og nemmere på klientsiden, fordi dataen allerede er færdigbehandlet vha. sql's export.
fetch('querie3.json')
    .then(res => res.json())
    .then(data => {
// Henter alle artisternes navne som labels til diagrammet.        
        const labels = data.map(item => item.Artist);
// Henter deres samlede salgstal som datasæt.        
        const sales = data.map(item => item.TotalSales);
// Finder canvas-elementet fra HTML, hvor diagrammet skal placeres.        
        const ctx = document.getElementById("artistChart").getContext('2d');
// Her skaber vi den type diagram vi gerne vil have såsom doughnut eller pie.        
        new Chart(ctx, {
            type: 'doughnut', // Diagramtypen
            data: {
                labels: labels, // Artisternes navne.
                datasets: [{
                    label: 'Total Sales',
                    data: sales, // Salgstal for hver artist.
                    // 3 forskellige farver til de tre top artister, hvilket skaber en visuel adskillelse.
                    backgroundColor: ["#5C6BC0", "#FBC02D", "#81C784"],
                    borderColor: 'rgba(75,192,192,1)',
                    borderWidth: 1,
                }]
            }
        });
    });

// 4. Line Chart – Genre Growth Popularity
// Samme princip: Data hentes som JSON i stedet for via SQL, SQL2 & app.get.
// Vi bruger statiske JSON-filer fordi browseren ikke selv kan lave SQL-queries direkte.
// Med mindre det er gjort vha. insomnia/webstorm osv. som nævnt ovenover.
fetch('querie4.json')
    .then(response => {
        if (!response.ok) throw new Error('HTTP error ' + response.status);
        return response.json();
    })
// Når data er klar, så kører vores arrow function.    
    .then(data => {
// Finder alle kolonner der ligner årstal, dvs. 2009,2010,2011,2012 & 2013.        
        const labels = Object.keys(data[0]).filter(key => /^\d{4}$/.test(key));
// Bestemmer farver til vores genrer.
        const colors = ["#BA68C8", "#FBC02D", "#FF8A65"];
// Opretter et datasæt PER genre.        
        const datasets = data.map((item, idx) => ({
            label: item.Genre, // Genrens navn vises i legenden.
            data: labels.map(year => item[year]), // Værdier for hvert årstal.
            backgroundColor: colors[idx % colors.length],
            borderColor: colors[idx % colors.length],
            fill: false, // Linjen udfyldes ikke nedenunder.
            tension: 0.3 // giver linjen en blød kurve.
        }));
// Opretter et line chart for vores genrers udvikling.      
        const ctx = document.getElementById('growthChart');
        new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                plugins: {
                    title: {
                        display: true,
// Titel på diagrammet som beskriver konteksten.                        
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
// Viser fejl i konsollen, hvis nu vores JSON-fil ikke kunne hentes eller parses.    
    .catch(error => console.error('Error fetching JSON:', error));



