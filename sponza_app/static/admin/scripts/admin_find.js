function showDetails(button) {
  const title = button.getAttribute("data-title");
  const content = button.getAttribute("data-content");

  if (typeof Swal !== "undefined") {
    Swal.fire({
      title: title,
      html: content,
      icon: "info",
      confirmButtonText: "OK"
    });
  } else {
    console.error("Swal is not defined");
  }
}

function showLoadingScreen() {
  document.getElementById("loadingScreen").style.display = "flex";
}

function hideLoadingScreen() {
  document.getElementById("loadingScreen").style.display = "none";
}

document.querySelectorAll(".flag").forEach((button) => {
  button.addEventListener("click", () => {
    console.log("hi");
    const id = button.getAttribute("data-id");
    const role = button.getAttribute("data-role");
    Swal.fire({
      title: "Are you sure?",
      text: "You are about to flag this campaign.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, flag it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        showLoadingScreen();
        data = {
          id: id,
          role: role
        };
        fetch("/admin/flag", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        })
          .then((response) => response.json())
          .then((data) => {
            hideLoadingScreen();
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
              text: "There was an error sending the flag request",
              icon: "error"
            });
          });
      }
    });
  });
});

function performCampaignSearch(searchInput, detailBox, noMatchesMessage) {
  const searchQuery = searchInput.value.trim().toLowerCase();
  const campaignBoxes = detailBox.querySelectorAll(".campaigns-box");

  let hasMatches = false;
  campaignBoxes.forEach((box) => {
    const campaignName = box
      .querySelector("h5")
      .textContent.trim()
      .toLowerCase();
    if (campaignName.includes(searchQuery)) {
      box.style.display = "flex"; 
      hasMatches = true;
      box.style.opacity = 1;
    } else {
      box.style.opacity = 0;
      setTimeout(() => {
        box.style.display = "none"; 
      }, 500); 
    }
  });

  noMatchesMessage.style.display = hasMatches ? "none" : "block";
}

function performSponsorSearch(searchInput, detailBox, noMatchesMessage) {
  const searchQuery = searchInput.value.trim().toLowerCase();
  const sponsorBoxes = detailBox.querySelectorAll(".sponsors-box");

  let hasMatches = false;
  sponsorBoxes.forEach((box) => {
    const sponsorName = box
      .querySelector("h5")
      .textContent.trim()
      .toLowerCase();
    if (sponsorName.includes(searchQuery)) {
      box.style.display = "flex"; 
      hasMatches = true;
      box.style.opacity = 1;
    } else {
      box.style.opacity = 0;
      setTimeout(() => {
        box.style.display = "none"; 
      }, 500); 
    }
  });

  noMatchesMessage.style.display = hasMatches ? "none" : "block";
}

function performInfluencerSearch(searchInput, detailBox, noMatchesMessage) {
  const searchQuery = searchInput.value.trim().toLowerCase();
  const influencerBoxes = detailBox.querySelectorAll(".influencer-box");

  let hasMatches = false;
  influencerBoxes.forEach((box) => {
    const influencerName = box
      .querySelector("h5")
      .textContent.trim()
      .toLowerCase();
    if (influencerName.includes(searchQuery)) {
      box.style.display = "flex"; 
      hasMatches = true;
      box.style.opacity = 1;
    } else {
      box.style.opacity = 0;
      setTimeout(() => {
        box.style.display = "none"; 
      }, 500);
    }
  });

  noMatchesMessage.style.display = hasMatches ? "none" : "block";
}

document.addEventListener("DOMContentLoaded", () => {
 
  const campaignsSearchForm = document.getElementById(
    "find-campaigns-search-form"
  );
  const campaignsSearchInput = document.getElementById(
    "find-campaigns-search-input"
  );
  const campaignsDetailBox = document.getElementById("campaigns-detail-box");
  const campaignsNoMatchesMessage = document.getElementById(
    "find-campaigns-no-matches"
  );

  campaignsSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    performCampaignSearch(
      campaignsSearchInput,
      campaignsDetailBox,
      campaignsNoMatchesMessage
    );
  });

  campaignsSearchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      performCampaignSearch(
        campaignsSearchInput,
        campaignsDetailBox,
        campaignsNoMatchesMessage
      );
    }
  });

  const sponsorsSearchForm = document.getElementById(
    "find-sponsors-search-form"
  );
  const sponsorsSearchInput = document.getElementById(
    "find-sponsors-search-input"
  );
  const sponsorsDetailBox = document.getElementById("sponsors-detail-box");
  const sponsorsNoMatchesMessage = document.getElementById(
    "find-sponsors-no-matches"
  );

  sponsorsSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    performSponsorSearch(
      sponsorsSearchInput,
      sponsorsDetailBox,
      sponsorsNoMatchesMessage
    );
  });

  sponsorsSearchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      performSponsorSearch(
        sponsorsSearchInput,
        sponsorsDetailBox,
        sponsorsNoMatchesMessage
      );
    }
  });
  const influencersSearchForm = document.getElementById(
    "find-influencers-search-form"
  );
  const influencersSearchInput = document.getElementById(
    "find-influencers-search-input"
  );
  const influencersDetailBox = document.getElementById(
    "influencers-detail-box"
  );
  const influencersNoMatchesMessage = document.getElementById(
    "find-influencers-no-matches"
  );

  influencersSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    performInfluencerSearch(
      influencersSearchInput,
      influencersDetailBox,
      influencersNoMatchesMessage
    );
  });

  influencersSearchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      performInfluencerSearch(
        influencersSearchInput,
        influencersDetailBox,
        influencersNoMatchesMessage
      );
    }
  });
});

function viewDetails(type) {
  console.log("View details for " + type);
}
