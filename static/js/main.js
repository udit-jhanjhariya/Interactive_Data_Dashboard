// Global variables to store data and chart instances
let allData = [];
let columnMetadata = {};
let salesChartInstance = null;
let categoryChartInstance = null;
let regionChartInstance = null;
let scatterChartInstance = null;
let currentFilteredData = [];

// Global Chart.js Defaults for Dark Theme
Chart.defaults.color = '#7d8590';
Chart.defaults.font.family = "'Inter', sans-serif";
if (Chart.defaults.scale) {
    Chart.defaults.scale.grid.color = 'rgba(255,255,255,0.05)';
    Chart.defaults.scale.grid.borderColor = 'rgba(255,255,255,0.1)';
}

// Performance optimizations for large datasets
Chart.defaults.animation = false;
Chart.defaults.elements.point.radius = 1;

// Premium Color Palette
const chartColors = [
    'rgba(88, 166, 255, 0.7)',  // Blue
    'rgba(188, 140, 255, 0.7)', // Purple
    'rgba(63, 185, 80, 0.7)',   // Green
    'rgba(210, 153, 34, 0.7)',  // Yellow
    'rgba(248, 81, 73, 0.7)',   // Red
    'rgba(47, 129, 247, 0.7)'   // Dark Blue
];

document.addEventListener('DOMContentLoaded', () => {
    fetchData();

    document.getElementById('uploadForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const fileInput = document.getElementById('csvFile');
        const file = fileInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        fetch('/api/upload', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) throw new Error('Upload failed');
                return response.json();
            })
            .then(data => {
                alert('Upload successful!');
                fetchData();
            })
            .catch(error => {
                alert('Error during upload: ' + error.message);
            });
    });
});

function fetchData() {
    fetch('/api/data')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(result => {
            allData = result.data;
            if (result.metadata) {
                columnMetadata = result.metadata;
            } else {
                allData = result;
                columnMetadata = { categorical: ['Category', 'Region'], numerical: ['Sales', 'Profit'], date: ['Order Date'] };
            }

            buildFilters();
            applyFilters();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            const alert = document.getElementById('error-alert');
            alert.textContent = `Error loading dashboard: ${error.message}`;
            alert.classList.remove('d-none');
        });
}

function buildFilters() {
    const container = document.getElementById('dynamicFiltersContainer');
    container.innerHTML = '';

    // 1. Metric Selector
    const numCols = columnMetadata.numerical || [];
    if (numCols.length > 0) {
        const metricDiv = document.createElement('div');
        metricDiv.className = 'col-md-3';
        const metricLabel = document.createElement('label');
        metricLabel.className = 'form-label';
        metricLabel.textContent = 'Analyze Metric (Y-Axis)';

        const metricSelect = document.createElement('select');
        metricSelect.className = 'form-select';
        metricSelect.id = 'metricSelector';
        metricSelect.onchange = applyFilters;

        numCols.forEach(col => {
            const opt = document.createElement('option');
            opt.value = col;
            opt.textContent = col;
            metricSelect.appendChild(opt);
        });

        metricDiv.appendChild(metricLabel);
        metricDiv.appendChild(metricSelect);
        container.appendChild(metricDiv);
    }

    // 2. Category Filters (Up to 2)
    const filterCols = columnMetadata.categorical.slice(0, 2);
    filterCols.forEach((col, index) => {
        const uniqueVals = [...new Set(allData.map(item => item[col]))].filter(v => v !== null && String(v).trim() !== '');

        const colDiv = document.createElement('div');
        colDiv.className = 'col-md-3';

        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = col;

        const select = document.createElement('select');
        select.className = 'form-select dynamic-filter';
        select.dataset.column = col;
        select.id = `filter_${index}`;

        const defaultOption = document.createElement('option');
        defaultOption.value = 'all';
        defaultOption.textContent = `All ${col}`;
        select.appendChild(defaultOption);

        uniqueVals.forEach(val => {
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = val;
            select.appendChild(opt);
        });

        colDiv.appendChild(label);
        colDiv.appendChild(select);
        container.appendChild(colDiv);
    });

    // 3. Apply Button
    const hasMetrics = filterCols.length > 0 || numCols.length > 0;
    if (hasMetrics) {
        const btnDiv = document.createElement('div');
        btnDiv.className = 'col-md-3 d-flex align-items-end mt-4';
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary w-100';
        btn.textContent = 'Apply Filters';
        btn.onclick = applyFilters;
        btnDiv.appendChild(btn);
        container.appendChild(btnDiv);
    }
}

function resetFilters() {
    const selects = document.querySelectorAll('.dynamic-filter');
    selects.forEach(sel => sel.value = 'all');
    if (document.getElementById('tableSearch')) document.getElementById('tableSearch').value = '';
    applyFilters();
}

function applyFilters() {
    let filteredData = allData;
    const selects = document.querySelectorAll('.dynamic-filter');

    selects.forEach(sel => {
        const col = sel.dataset.column;
        const val = sel.value;
        if (val !== 'all') {
            filteredData = filteredData.filter(item => item[col] === val || String(item[col]) === val);
        }
    });

    currentFilteredData = filteredData;

    // Figure out selected metric
    const metricSel = document.getElementById('metricSelector');
    const mainNum = metricSel ? metricSel.value : (columnMetadata.numerical[0] || null);

    updateKPIs(filteredData, mainNum);
    renderCharts(filteredData, mainNum);

    if (document.getElementById('tableSearch')) document.getElementById('tableSearch').value = '';
    populateTable(filteredData);
}

function updateKPIs(data, mainNum) {
    if (document.getElementById('kpiTotalRows')) document.getElementById('kpiTotalRows').textContent = data.length.toLocaleString();

    if (!mainNum || data.length === 0) {
        if (document.getElementById('kpiSum')) document.getElementById('kpiSum').textContent = '0';
        if (document.getElementById('kpiAvg')) document.getElementById('kpiAvg').textContent = '0';
        return;
    }

    if (document.getElementById('kpiSumLabel')) document.getElementById('kpiSumLabel').textContent = `Sum of ${mainNum}`;
    if (document.getElementById('kpiAvgLabel')) document.getElementById('kpiAvgLabel').textContent = `Avg of ${mainNum}`;

    let sum = 0;
    data.forEach(row => {
        const val = parseFloat(row[mainNum]);
        if (!isNaN(val)) sum += val;
    });

    let avg = sum / data.length;

    if (document.getElementById('kpiSum')) document.getElementById('kpiSum').textContent = sum % 1 !== 0 ? sum.toFixed(2) : sum.toLocaleString();
    if (document.getElementById('kpiAvg')) document.getElementById('kpiAvg').textContent = avg.toFixed(2);
}

function renderCharts(data, mainNum) {
    if (data.length === 0 || !mainNum) return;

    const catCols = columnMetadata.categorical;
    const dateCols = columnMetadata.date;
    const numCols = columnMetadata.numerical;

    const lineTitle = document.getElementById('lineChartTitle');
    const barTitle = document.getElementById('barChartTitle');
    const doughnutTitle = document.getElementById('doughnutChartTitle');
    const scatterTitle = document.getElementById('scatterChartTitle');

    const lineChartRow = document.getElementById('lineChartRow');
    const catChartsRow = document.getElementById('catChartsRow');
    const doughnutContainer = document.getElementById('doughnutChartContainer');
    const scatterContainer = document.getElementById('scatterChartContainer');

    // 1. Line Chart
    if (salesChartInstance) salesChartInstance.destroy();
    if (dateCols.length > 0) {
        if (lineChartRow) lineChartRow.style.display = '';
        const dateCol = dateCols[0];
        if (lineTitle) lineTitle.textContent = `${mainNum} Trend over ${dateCol}`;

        const valByDate = {};
        data.forEach(item => {
            const date = item[dateCol];
            if (!date) return;
            const val = parseFloat(item[mainNum]) || 0;
            if (valByDate[date]) valByDate[date] += val;
            else valByDate[date] = val;
        });

        const sortedDates = Object.keys(valByDate).sort((a, b) => new Date(a) - new Date(b));
        const values = sortedDates.map(d => valByDate[d]);

        salesChartInstance = new Chart(document.getElementById('salesChart'), {
            type: 'line',
            data: {
                labels: sortedDates,
                datasets: [{
                    label: `Total ${mainNum} over ${dateCol}`,
                    data: values,
                    borderColor: '#58a6ff',
                    backgroundColor: 'rgba(88, 166, 255, 0.15)',
                    tension: 0.1, fill: true, pointRadius: 2
                }]
            },
            options: { responsive: true }
        });
    } else {
        if (lineChartRow) lineChartRow.style.display = 'none';
        if (lineTitle) lineTitle.textContent = 'No Time-Series Data Available';
    }

    if (catCols.length === 0 && numCols.length < 2) {
        if (catChartsRow) catChartsRow.style.display = 'none';
        return;
    } else {
        if (catChartsRow) catChartsRow.style.display = '';
    }

    // 2. Bar Chart
    if (categoryChartInstance) categoryChartInstance.destroy();
    if (catCols.length > 0) {
        const catCol1 = catCols[0];
        if (barTitle) barTitle.textContent = `${mainNum} by ${catCol1}`;
        const valByCat = {};
        data.forEach(item => {
            const val = parseFloat(item[mainNum]) || 0;
            const label = item[catCol1] || 'Unknown';
            if (valByCat[label]) valByCat[label] += val;
            else valByCat[label] = val;
        });

        const sortedCats = Object.entries(valByCat).sort((a, b) => b[1] - a[1]).slice(0, 20);

        categoryChartInstance = new Chart(document.getElementById('categoryChart'), {
            type: 'bar',
            data: {
                labels: sortedCats.map(x => x[0]),
                datasets: [{
                    label: `${mainNum} by ${catCol1}`,
                    data: sortedCats.map(x => x[1]),
                    backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)']
                }]
            },
            options: { responsive: true }
        });
    }

    // 3. Doughnut Chart
    if (regionChartInstance) regionChartInstance.destroy();
    if (catCols.length > 1) {
        if (doughnutContainer) doughnutContainer.style.display = 'block';
        const catCol2 = catCols[1];
        if (doughnutTitle) doughnutTitle.textContent = `${mainNum} by ${catCol2}`;
        const valByCat2 = {};
        data.forEach(item => {
            const val = parseFloat(item[mainNum]) || 0;
            const label = item[catCol2] || 'Unknown';
            if (valByCat2[label]) valByCat2[label] += val;
            else valByCat2[label] = val;
        });

        const sortedCats2 = Object.entries(valByCat2).sort((a, b) => b[1] - a[1]).slice(0, 10);

        regionChartInstance = new Chart(document.getElementById('regionChart'), {
            type: 'doughnut',
            data: {
                labels: sortedCats2.map(x => x[0]),
                datasets: [{
                    label: `${mainNum} by ${catCol2}`,
                    data: sortedCats2.map(x => x[1]),
                    backgroundColor: ['rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)', 'rgba(201, 203, 207, 0.6)', 'rgba(54, 162, 235, 0.6)']
                }]
            },
            options: { responsive: true }
        });
    } else {
        if (doughnutContainer) doughnutContainer.style.display = 'none';
    }

    // 4. Scatter Plot
    if (scatterChartInstance) scatterChartInstance.destroy();
    const otherNums = numCols.filter(c => c !== mainNum);
    if (otherNums.length > 0) {
        if (scatterContainer) scatterContainer.style.display = 'block';
        const secNum = otherNums[0];
        if (scatterTitle) scatterTitle.textContent = `${mainNum} vs ${secNum}`;

        const scatterData = data.filter(d => d[mainNum] != null && d[secNum] != null).map(d => ({
            x: parseFloat(d[secNum]),
            y: parseFloat(d[mainNum])
        })).slice(0, 500);

        scatterChartInstance = new Chart(document.getElementById('scatterChart'), {
            type: 'scatter',
            data: {
                datasets: [{
                    label: `${mainNum} vs ${secNum}`,
                    data: scatterData,
                    backgroundColor: 'rgba(188, 140, 255, 0.6)'
                }]
            },
            options: { responsive: true }
        });
    } else {
        if (scatterContainer) scatterContainer.style.display = 'none';
    }
}

let searchTimeout = null;
function handleSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const searchBox = document.getElementById('tableSearch');
        const query = searchBox.value.toLowerCase();
        if (!query) {
            populateTable(currentFilteredData);
            return;
        }

        const columns = Object.keys(currentFilteredData[0] || {});
        const searchData = currentFilteredData.filter(row => {
            for (let col of columns) {
                if (String(row[col]).toLowerCase().includes(query)) return true;
            }
            return false;
        });

        populateTable(searchData);
    }, 300);
}

function exportCSV() {
    if (currentFilteredData.length === 0) {
        alert("No data to export!");
        return;
    }

    const cols = Object.keys(currentFilteredData[0]);
    let csvContent = "data:text/csv;charset=utf-8," + cols.join(",") + "\n";

    currentFilteredData.forEach(row => {
        let rowData = cols.map(c => {
            let val = row[c] !== null ? String(row[c]) : "";
            if (val.includes(",") || val.includes('"') || val.includes('\n')) {
                val = '"' + val.replace(/"/g, '""') + '"';
            }
            return val;
        });
        csvContent += rowData.join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "dashboard_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function populateTable(data) {
    const headerRow = document.getElementById('tableHeaderRow');
    const tableBody = document.querySelector('#dataTable tbody');

    if (data.length === 0) {
        if (headerRow) headerRow.innerHTML = '';
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="100%" class="text-center">No matching data</td></tr>';
        return;
    }

    if (headerRow) {
        headerRow.innerHTML = '';
        const columns = Object.keys(data[0]);
        columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            headerRow.appendChild(th);
        });
    }

    if (tableBody) {
        tableBody.innerHTML = '';
        const columns = Object.keys(data[0]);
        const visibleRowsData = data.slice(0, 100);
        visibleRowsData.forEach(row => {
            const tr = document.createElement('tr');
            columns.forEach(col => {
                const td = document.createElement('td');
                let val = row[col];
                if (typeof val === 'number' && !isNaN(val)) {
                    td.textContent = (val % 1 !== 0) ? val.toFixed(2) : val;
                } else {
                    td.textContent = val;
                }
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });
    }
}

// EOF
