document.querySelectorAll(".view1").forEach((button) => {
  button.addEventListener("click", function () {
    const sponsorName = this.getAttribute("data-sponsor-name");
    const campaignId = this.getAttribute("data-camp-id");
    const influencerId = this.getAttribute("data-inf-id");
    const campaignTitle = this.getAttribute("data-campaign-title");
    const description = this.getAttribute("data-campaign-desc");
    const endDate = this.getAttribute("data-end-date");

    Swal.fire({
      title: "Campaign Details",
      html: `
                <div style="text-align:left;">
                <p><strong>Sponsor Company Name:</strong> ${sponsorName}</p>
                <p><strong>Campaign Name:</strong> ${campaignTitle}</p>
                <p><strong>Description:</strong> ${description}</p>
                <p><strong>End Date:</strong> ${endDate}</p>
                <p><strong>Payment:</strong> ₹<input id="payment-amount" class="swal2-input" style="display: inline-block; width: auto; padding: 2px 4px;" placeholder="Enter amount"></p>
                <div id="error-message" style="color: red; display: none;">Please enter a valid payment amount.</div>
                <div>
            `,
      icon: "info",
      confirmButtonText: "Request",
      showCancelButton: true,
      cancelButtonText: "Close",
      preConfirm: () => {
        const paymentAmount = document.getElementById("payment-amount").value;
        if (!paymentAmount) {
          document.getElementById("error-message").style.display = "block";
          return false;
        }
        return {
          adCampaignId: campaignId,
          adInfluencerid: influencerId,
          adPayment: paymentAmount
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const adData = result.value;
        console.log(adData);
        fetch(`/influencer/send-ad-request/${campaignId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(adData)
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
            } else {
              Swal.fire({
                title: "Error",
                text: data.error,
                icon: "error",
                confirmButtonText: "OK",
                willClose: () => {
                  location.reload();
                }
              });
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            Swal.fire({
              title: "Error",
              text: "There was an error sending the ad request",
              icon: "error",
              confirmButtonText: "OK",
              willClose: () => {
                location.reload();
              }
            });
          });
      }
    });
  });
});
document.addEventListener("DOMContentLoaded", function () {

  var form = document.getElementById("searchForm");
  var searchInput = document.getElementById("searchInput");

  form.addEventListener("submit", function (event) {
   
      if (searchInput.value.trim() === "") {
          event.preventDefault();
          window.location.href = "/influencer/campaigns";
      }
  });
});