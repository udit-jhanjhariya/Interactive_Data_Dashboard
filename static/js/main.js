// Global variables to store data and chart instances
let allData = [];
let salesChartInstance = null;
let categoryChartInstance = null;
let regionChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/data')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log("Data fetched:", data.length, "rows");
            if (!data || data.length === 0) {
                throw new Error('No data received from server');
            }

            // Store data globally
            allData = data;

            // Initial Render
            renderCharts(allData);
            populateTable(allData);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            const alert = document.getElementById('error-alert');
            alert.textContent = `Error loading dashboard: ${error.message}. Please restart the server.`;
            alert.classList.remove('d-none');
        });
});

function applyFilters() {
    const categoryVal = document.getElementById('categoryFilter').value;
    const regionVal = document.getElementById('regionFilter').value;

    console.log("Applying filters:", categoryVal, regionVal);

    let filteredData = allData;

    if (categoryVal !== 'all') {
        filteredData = filteredData.filter(item => item.Category === categoryVal);
    }

    if (regionVal !== 'all') {
        filteredData = filteredData.filter(item => item.Region === regionVal);
    }

    console.log("Filtered data rows:", filteredData.length);

    renderCharts(filteredData);
    populateTable(filteredData);
}

function renderCharts(data) {
    // Process data for charts

    // 1. Sales over time (Line Chart)
    const salesByDate = {};
    data.forEach(item => {
        const date = item['Order Date'];
        if (salesByDate[date]) {
            salesByDate[date] += item.Sales;
        } else {
            salesByDate[date] = item.Sales;
        }
    });

    const sortedDates = Object.keys(salesByDate).sort((a, b) => new Date(a) - new Date(b));
    const salesValues = sortedDates.map(date => salesByDate[date]);

    // Destroy existing chart if it exists
    if (salesChartInstance) {
        salesChartInstance.destroy();
    }

    salesChartInstance = new Chart(document.getElementById('salesChart'), {
        type: 'line',
        data: {
            labels: sortedDates,
            datasets: [{
                label: 'Total Sales',
                data: salesValues,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
                fill: true,
                pointRadius: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Sales Trends Over Time'
                }
            },
            scales: {
                x: {
                    ticks: {
                        maxTicksLimit: 20
                    }
                }
            }
        }
    });

    // 2. Sales by Category (Bar Chart)
    const salesByCategory = {};
    data.forEach(item => {
        if (salesByCategory[item.Category]) {
            salesByCategory[item.Category] += item.Sales;
        } else {
            salesByCategory[item.Category] = item.Sales;
        }
    });

    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }

    categoryChartInstance = new Chart(document.getElementById('categoryChart'), {
        type: 'bar',
        data: {
            labels: Object.keys(salesByCategory),
            datasets: [{
                label: 'Sales by Category',
                data: Object.values(salesByCategory),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)'
                ]
            }]
        },
        options: {
            responsive: true
        }
    });

    // 3. Sales by Region (Doughnut Chart)
    const salesByRegion = {};
    data.forEach(item => {
        if (salesByRegion[item.Region]) {
            salesByRegion[item.Region] += item.Sales;
        } else {
            salesByRegion[item.Region] = item.Sales;
        }
    });

    if (regionChartInstance) {
        regionChartInstance.destroy();
    }

    regionChartInstance = new Chart(document.getElementById('regionChart'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(salesByRegion),
            datasets: [{
                label: 'Sales by Region',
                data: Object.values(salesByRegion),
                backgroundColor: [
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(201, 203, 207, 0.6)',
                    'rgba(54, 162, 235, 0.6)'
                ]
            }]
        },
        options: {
            responsive: true
        }
    });
}

function populateTable(data) {
    const tableBody = document.querySelector('#dataTable tbody');
    tableBody.innerHTML = ''; // Clear existing

    // Limit to first 100 rows of the filtered data for performance
    const displayData = data.slice(0, 100);

    displayData.forEach(row => {
        const tr = document.createElement('tr');
        // Handle Profit color
        const profitClass = row.Profit >= 0 ? 'text-success' : 'text-danger';

        tr.innerHTML = `
            <td>${row['Order Date']}</td>
            <td>${row.Category}</td>
            <td>${row['Sub-Category']}</td>
            <td>${row.Region}</td>
            <td>$${parseFloat(row.Sales).toFixed(2)}</td>
            <td class="${profitClass}">$${parseFloat(row.Profit).toFixed(2)}</td>
        `;
        tableBody.appendChild(tr);
    });
}
