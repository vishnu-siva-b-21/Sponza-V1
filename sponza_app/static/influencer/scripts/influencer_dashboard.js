
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

fetch("/influencer/get-graph-data")
  .then((response) => response.json())
  .then((data) => {
    const labels = [];
    const dataPoints = [];

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        labels.push(key);
        dataPoints.push(data[key]);
      }
    }

    const areaChartContainer = document.querySelector(".col-xl-8.col-lg-7");

    if (labels.length === 0 || dataPoints.length === 0) {
      areaChartContainer.style.display = "none";
    } else {
      const ctx = document.getElementById("myAreaChart");
      new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Earnings",
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
                  maxTicksLimit: 7,
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
                  labelString: "Income",
                  fontSize: 16,
                  fontColor: "#4e73df",
                  fontFamily:
                    'Nunito, -apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
                  fontStyle: "bold"
                },
                ticks: {
                  maxTicksLimit: 5,
                  padding: 10,
                  display: false,
                  callback: function (value) {
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
    }
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
    document.querySelector(".col-xl-8.col-lg-7").style.display = "none";
  });

document.querySelectorAll(".views").forEach((button) => {
  button.addEventListener("click", function () {
    const sponsorName = this.getAttribute("data-sponsor-name");
    const campDesc = this.getAttribute("data-camp-desc");
    const endDate = this.getAttribute("data-camp-end-date");
    const amt = this.getAttribute("data-camp-amt");

    Swal.fire({
      title: "Influencer Details",
      html: `
          <div style="text-align: left;">
            <p><strong>Company Name:</strong> ${sponsorName}</p>
            <p><strong>Description:</strong> ${campDesc}</p>
            <p><strong>End Date:</strong> ${endDate}</p>
            <p><strong>Income:</strong> ₹${amt}</p>
          </div>
        `,
      icon: "info",
      confirmButtonText: "OK",
      confirmButtonColor: "#3085d6",
      showConfirmButton: true,
      showCancelButton: false,
      focusConfirm: true
    });
  });
});

document.querySelectorAll(".leave").forEach((button) => {
  button.addEventListener("click", function () {
    const inf_id = this.getAttribute("data-inf-id");
    const camp_id = this.getAttribute("data-camp-id");
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to leave the campaign?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes"
    }).then((result) => {
      if (result.isConfirmed) {
        const data = { inf_id: inf_id, camp_id: camp_id };
        fetch("/influencer/rm-ad-req", {
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
              text: "There was an error sending the ad request",
              icon: "error"
            });
          });
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  fetch("/influencer/get-pie-data")
    .then((response) => response.json())
    .then((data) => {
      const dynamicData = {
        values: [data.your_camp, data.not_your_camp],
        labels: ["Your Campaigns", "Rest All Campaigns"]
      };

      const pieChartContainer = document.querySelector(".col-xl-4.col-lg-5");

      if (dynamicData.values[0] === 0) {
        pieChartContainer.style.display = "none";
      } else {
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
                const percentage = ((value / total) * 100).toFixed(1);
                let text = "";

                if (index === 0) {
                  text = `${percentage}%`;
                } else {
                  const remainingPercentage = (
                    (dataset.data[1] / total) *
                    100
                  ).toFixed(1);
                  text = `${remainingPercentage}%`;
                }

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

        new Chart(document.getElementById("myPieChart"), config);
      }
    })
    .catch((error) => {
      console.error("Error fetching pie data:", error);
      document.querySelector(".col-xl-4.col-lg-5").style.display = "none";
    });
});
