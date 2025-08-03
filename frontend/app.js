const BASE_URL = "http://localhost:8000/api/analytics";

fetch(`${BASE_URL}/summary`)
  .then(res => res.json())
  .then(data => {
    document.getElementById("totalEvents").innerText = data.total_events;
    document.getElementById("avgDuration").innerText = data.avg_duration.toFixed(2);
  });

fetch(`${BASE_URL}/top-pages`)
  .then(res => res.json())
  .then(data => {
    const ctx = document.getElementById("topPagesChart").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map(item => item.page),
        datasets: [{
          label: "Views",
          data: data.map(item => item.views),
          backgroundColor: "#3b82f6"
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  });

fetch(`${BASE_URL}/pages`)
  .then(res => res.json())
  .then(data => {
    const tbody = document.getElementById("pageStats");
    tbody.innerHTML = data.map(row => `
      <tr>
        <td class="p-2">${row.page}</td>
        <td class="p-2">${row.views}</td>
        <td class="p-2">${row.avg_duration.toFixed(2)}s</td>
      </tr>
    `).join("");
  });
const BASE_URL = "http://localhost:8000/api/analytics";

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function getDateQueryParams() {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  let params = [];
  if (startDate) params.push(`start=${startDate}`);
  if (endDate) params.push(`end=${endDate}`);
  return params.length > 0 ? "?" + params.join("&") : "";
}

async function fetchSummary() {
  const res = await fetch(`${BASE_URL}/summary${getDateQueryParams()}`);
  const data = await res.json();
  document.getElementById("totalEvents").innerText = data.total_events ?? 0;
  document.getElementById("avgDuration").innerText = (data.avg_duration ?? 0).toFixed(2);
}

async function fetchTopPages() {
  const res = await fetch(`${BASE_URL}/top-pages${getDateQueryParams()}`);
  const data = await res.json();
  const ctx = document.getElementById("topPagesChart").getContext("2d");
  if (window.topPagesChart) window.topPagesChart.destroy(); // destroy old chart
  window.topPagesChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map(item => item.page),
      datasets: [{
        label: "Views",
        data: data.map(item => item.views),
        backgroundColor: "#3b82f6"
      }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });
}

async function fetchPageStats() {
  const res = await fetch(`${BASE_URL}/pages${getDateQueryParams()}`);
  const data = await res.json();
  const tbody = document.getElementById("pageStats");
  tbody.innerHTML = data.map(row => `
    <tr>
      <td class="p-2">${row.page}</td>
      <td class="p-2">${row.views}</td>
      <td class="p-2">${row.avg_duration.toFixed(2)}s</td>
    </tr>
  `).join("");
}

async function refreshData() {
  await fetchSummary();
  await fetchTopPages();
  await fetchPageStats();
}

// Set default date range to last 7 days
const today = new Date();
document.getElementById("endDate").value = formatDate(today);
const lastWeek = new Date();
lastWeek.setDate(today.getDate() - 7);
document.getElementById("startDate").value = formatDate(lastWeek);

// Load data on page load
window.addEventListener("DOMContentLoaded", refreshData);

// Refresh on button click
document.getElementById("refreshBtn").addEventListener("click", refreshData);
