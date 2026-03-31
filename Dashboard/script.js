// Revenue
new Chart(document.getElementById("revenueChart"), {
  type: "bar",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr"],
    datasets: [{
      data: [4000, 5000, 3000, 6500],
      backgroundColor: "#6366f1",
      borderRadius: 6
    }]
  },
  options: {
    plugins: { legend: { display: false } }
  }
});

// Pie
new Chart(document.getElementById("productChart"), {
  type: "doughnut",
  data: {
    labels: ["Laptop", "Phone", "Car"],
    datasets: [{
      data: [50, 33, 17],
      backgroundColor: ["#6366f1", "#22c55e", "#f59e0b"]
    }]
  }
});

// Line
new Chart(document.getElementById("customerChart"), {
  type: "line",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr"],
    datasets: [{
      data: [120, 200, 260, 400],
      borderColor: "#6366f1",
      tension: 0.4,
      fill: true
    }]
  }
});

// Theme Toggle
const btn = document.getElementById("themeToggle")

btn.onclick = () => {
  document.body.classList.toggle("dark")
}