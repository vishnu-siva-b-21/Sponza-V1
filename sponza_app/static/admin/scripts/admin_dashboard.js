document.addEventListener("DOMContentLoaded", function () {
  const areaChartContainer = document.querySelector(".col-xl-8.col-lg-7");
  const pieChartContainer = document.querySelector(".col-xl-4.col-lg-5");

  function hideContainer(container) {
    container.style.display = "none";
  }

  function isDataEmpty(data) {
    return Object.keys(data).length === 0;
  }

  fetch("/admin/get-graph-data")
    .then((response) => response.json())
    .then((data) => {
      if (isDataEmpty(data)) {
        hideContainer(areaChartContainer);
        return;
      }

      const labels = [];
      const dataPoints = [];

      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          labels.push(key);
          dataPoints.push(data[key]);
        }
      }

      var ctx = document.getElementById("myAreaChart");
      var myLineChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Expenses",
              lineTension: 0.3,
              backgroundColor: "rgba(78, 115, 223, 0.05)",
              borderColor: "rgba(78, 115, 223, 1)",
              pointRadius: 3,
              pointBackgroundColor: "rgba(78, 115, 223, 1)",
              pointBorderColor: "rgba(78, 115, 223, 1)",
              pointHoverRadius: 3,
              pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
              pointHoverBorderColor: "rgba(78, 115, 223, 1)",
              pointHitRadius: 10,
              pointBorderWidth: 2,
              data: dataPoints
            }
          ]
        },
        options: {
          maintainAspectRatio: false,
          layout: {
            padding: {
              left: 10,
              right: 25,
              top: 25,
              bottom: 0
            }
          },
          scales: {
            xAxes: [
              {
                scaleLabel: {
                  display: true,
                  labelString: "Campaigns",
                  fontSize: 16,
                  fontColor: "#4e73df",
                  fontFamily:
                    'Nunito, -apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
                  fontStyle: "bold"
                },
                ticks: {
                  display: false
                },
                gridLines: {
                  display: false,
                  drawBorder: false
                }
              }
            ],
            yAxes: [
              {
                scaleLabel: {
                  display: true,
                  labelString: "Expenses",
                  fontSize: 16,
                  fontColor: "#4e73df",
                  fontFamily:
                    'Nunito, -apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
                  fontStyle: "bold"
                },
                ticks: {
                  display: false,
                  callback: function (value, index, values) {
                    return "₹" + number_format(value);
                  }
                },
                gridLines: {
                  color: "rgb(234, 236, 244)",
                  zeroLineColor: "rgb(234, 236, 244)",
                  drawBorder: false,
                  borderDash: [2],
                  zeroLineBorderDash: [2]
                }
              }
            ]
          },
          legend: {
            display: false
          },
          tooltips: {
            backgroundColor: "rgb(255,255,255)",
            bodyFontColor: "#858796",
            titleMarginBottom: 10,
            titleFontColor: "#6e707e",
            titleFontSize: 14,
            borderColor: "#dddfeb",
            borderWidth: 1,
            xPadding: 15,
            yPadding: 15,
            displayColors: false,
            intersect: false,
            mode: "index",
            caretPadding: 10,
            callbacks: {
              label: function (tooltipItem, chart) {
                var datasetLabel =
                  chart.datasets[tooltipItem.datasetIndex].label || "";
                return datasetLabel + ": ₹" + number_format(tooltipItem.yLabel);
              }
            }
          }
        }
      });
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      hideContainer(areaChartContainer);
    });

  fetch("/admin/get-pie-data")
    .then((response) => response.json())
    .then((data) => {
      if (isDataEmpty(data)) {
        hideContainer(pieChartContainer);
        return;
      }

      const dynamicData = {
        values: [data.influencer, data.campaign],
        labels: ["Influencer", "Campaigns"]
      };

      const chartContainer = document.getElementById("chartPie");
      chartContainer.setAttribute(
        "data-values",
        JSON.stringify(dynamicData.values)
      );
      chartContainer.setAttribute(
        "data-labels",
        JSON.stringify(dynamicData.labels)
      );

      const values = JSON.parse(chartContainer.getAttribute("data-values"));
      const labels = JSON.parse(chartContainer.getAttribute("data-labels"));

      const chartData = {
        labels: labels,
        datasets: [
          {
            data: values,
            backgroundColor: ["#4e73df", "#1cc88a"],
            hoverBackgroundColor: ["#2e59d9", "#17a673"],
            hoverBorderColor: "rgba(234, 236, 244, 1)"
          }
        ]
      };

      const valuePlugin = {
        id: "valuePlugin",
        afterDatasetsDraw(chart) {
          const { ctx, data } = chart;
          chart.data.datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);
            meta.data.forEach((element, index) => {
              ctx.fillStyle = "white";
              const fontSize = 16;
              const fontStyle = "normal";
              const fontFamily = "Helvetica Neue";
              ctx.font = Chart.helpers.fontString(
                fontSize,
                fontStyle,
                fontFamily
              );
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";

              const padding = 5;
              const position = element.tooltipPosition();
              const total = dataset.data.reduce((a, b) => a + b, 0);
              const value = dataset.data[index];
              const text = `${((value / total) * 100).toFixed(1)}%`;

              ctx.fillText(
                text,
                position.x,
                position.y - fontSize / 2 - padding
              );
            });
          });
        }
      };

      const config = {
        type: "pie",
        data: chartData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          }
        },
        plugins: [valuePlugin]
      };

      const myPieChart = new Chart(
        document.getElementById("myPieChart"),
        config
      );
    })
    .catch((error) => {
      console.error("Error fetching pie data:", error);
      hideContainer(pieChartContainer);
    });
});

document.querySelectorAll(".unflag").forEach((button) => {
  button.addEventListener("click", () => {
    console.log("hi");
    const id = button.getAttribute("data-id");
    const role = button.getAttribute("data-role");
    Swal.fire({
      title: "Are you sure?",
      text: "You are about to unflag this campaign.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, unflag it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        data = {
          id: id,
          role: role
        };
        fetch("/admin/unflag", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.message) {
              Swal.fire({
                title: "Success",
                text: data.message,
                icon: "success",
                confirmButtonText: "OK",
                willClose: () => {
                  location.reload();
                }
              });
            } else if (data.unauthorized) {
              Swal.fire({
                title: "Unauthorized",
                icon: "error",
                willClose: () => {
                  window.location.href = "/";
                }
              });
            } else {
              Swal.fire({
                title: "Error",
                text: data.error,
                icon: "error"
              });
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            Swal.fire({
              title: "Error",
              text: "There was an error sending the profile delete request",
              icon: "error"
            });
          });
      }
    });
  });
});

document.querySelectorAll(".view-campaign").forEach((button) => {
  button.addEventListener("click", () => {
    Swal.fire({
      title: "Campaign Details",
      html: `
                <div style="text-align:left;">
                <p><strong>Sponsor Name:</strong> Example Sponsor</p>
                <p><strong>Duration:</strong> 30 days</p>
                <p><strong>Influencers:</strong> Influencer1, Influencer2</p>
                </div>
            `,
      icon: "info"
    });
  });
});

document.querySelectorAll(".view-sponsor").forEach((button) => {
  button.addEventListener("click", () => {
    Swal.fire({
      title: "Sponsor Details",
      html: `
                <div style="text-align:left;">
                <p><strong>Sponsor Name:</strong> Example Sponsor</p>
                <p><strong>Ongoing Campaigns:</strong> Campaign1, Campaign2</p>
                </div>
            `,
      icon: "info"
    });
  });
});

document.querySelectorAll(".view-influencer").forEach((button) => {
  button.addEventListener("click", () => {
    Swal.fire({
      title: "Influencer Details",
      html: `
                <div style="text-align:left;">
                <p><strong>Followers Count:</strong> 10,000</p>
                <p><strong>Duration:</strong> 60 days</p>
                <p><strong>Ongoing Campaigns:</strong> Campaign1, Campaign2</p>
                </div>
            `,
      icon: "info"
    });
  });
});

document.getElementById("addAdminButton").addEventListener("click", () => {
  Swal.fire({
    title: "Add Admin",
    html: `
            <form id='add-admin' action='/admin/add-admin' method='POST'>
                <label for="email" style="padding-right:30px;">Email:</label>
                <input type="email" id="email" class="swal2-input" name='email' placeholder="Enter email">
                <label for="password">Password:</label>
                <input type="password" id="password" class="swal2-input" name='password' placeholder="Enter password">
            </form id='add-admin' action='' method='POST'>
        `,
    focusConfirm: false,
    preConfirm: () => {
      const email = Swal.getPopup().querySelector("#email").value;
      const password = Swal.getPopup().querySelector("#password").value;

      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      const passwordPattern =
        /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})(?!.*\s).*$/;

      if (!emailPattern.test(email)) {
        Swal.showValidationMessage("Invalid email format");
      } else if (!passwordPattern.test(password)) {
        Swal.showValidationMessage(
          "Password must be at least 8 characters long, contain one uppercase letter, one special character, and no spaces"
        );
      }

      return { email: email, password: password };
    },
    showCancelButton: true,
    confirmButtonText: "Add User"
  }).then((result) => {
    if (result.isConfirmed) {
      form = document.getElementById("add-admin");
      form.submit();
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll(".search-form");

  forms.forEach((form) => {
    const searchInput = form.querySelector("input[type='search']");
    const searchButton = form.querySelector("input[type='submit']");

    searchButton.addEventListener("click", (event) => {
      event.preventDefault();
      const query = searchInput.value.toLowerCase();
      const section = form.closest(".details");
      const noMatchesMessage = section.querySelector(".no-matches");
      const boxes = section.querySelectorAll(
        ".request-box, .campaigns-box, .influencer-box"
      );

      let hasMatches = false;
      boxes.forEach((box) => {
        const names = box.querySelectorAll("h5");
        const matchesQuery = Array.from(names).some((name) =>
          name.textContent.toLowerCase().includes(query)
        );
        if (matchesQuery) {
          box.classList.add("show");
          setTimeout(() => {
            box.style.display = "flex";
            box.style.opacity = 1;
            box.style.transform = "translateY(0)";
          }, 0); 
          hasMatches = true;
        } else {
          box.style.opacity = 0;
          box.style.transform = "translateY(20px)";
          setTimeout(() => {
            box.classList.remove("show");
            box.style.display = "none";
          }, 500); 
        }
      });

      if (hasMatches) {
        noMatchesMessage.style.display = "none";
      } else {
        noMatchesMessage.style.display = "block";
      }
    });

    searchInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        searchButton.click();
      }
    });
  });
});

(Chart.defaults.global.defaultFontFamily = "Nunito"),
  '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = "#858796";

function number_format(number, decimals, dec_point, thousands_sep) {
  number = (number + "").replace(",", "").replace(" ", "");
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = typeof thousands_sep === "undefined" ? "," : thousands_sep,
    dec = typeof dec_point === "undefined" ? "." : dec_point,
    s = "",
    toFixedFix = function (n, prec) {
      var k = Math.pow(10, prec);
      return "" + Math.round(n * k) / k;
    };
  s = (prec ? toFixedFix(n, prec) : "" + Math.round(n)).split(".");
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || "").length < prec) {
    s[1] = s[1] || "";
    s[1] += new Array(prec - s[1].length + 1).join("0");
  }
  return s.join(dec);
}