const baseOptions = {
  responsive: true,
  plugins: { legend: { display: false } }
};

// BAR
new Chart(document.getElementById("revenueChart"), {
  type: "bar",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr"],
    datasets: [
      {
        data: [2500, 6300, 6000, 4000],
        backgroundColor: "#2563eb",
        borderRadius: 8
      },
      {
        data: [2000, 5400, 5200, 3000],
        backgroundColor: "#93c5fd",
        borderRadius: 8
      }
    ]
  },
  options: baseOptions
});

// PIE
new Chart(document.getElementById("productChart"), {
  type: "doughnut",
  data: {
    labels: ["Laptop", "Phone", "Other"],
    datasets: [{
      data: [50, 33, 17],
      backgroundColor: ["#2563eb", "#22c55e", "#f59e0b"]
    }]
  }
});

// LINE
new Chart(document.getElementById("customerChart"), {
  type: "line",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [{
      data: [100, 180, 170, 300, 420],
      borderColor: "#2563eb",
      backgroundColor: "rgba(37,99,235,0.1)",
      fill: true,
      tension: 0.4
    }]
  }
});

// DARK MODE
document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("dark");
};

const menuBtn = document.getElementById("menuToggle");
const sidebar = document.querySelector(".sidebar");

menuBtn.onclick = () => {
  sidebar.classList.toggle("show");
};
