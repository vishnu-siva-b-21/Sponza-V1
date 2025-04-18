document.querySelectorAll(".reject").forEach((button) => {
  button.addEventListener("click", function () {

    const inf_id = this.getAttribute("data-inf-id");
    const camp_id = this.getAttribute("data-camp-id");
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to proceed with this Reject?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes"
    }).then((result) => {
      if (result.isConfirmed) {
        const data = {
          inf_id: inf_id,
          camp_id: camp_id
        };
        console.log(data);
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

document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll(".search-form");

  forms.forEach((form) => {
    const searchInput = form.querySelector("input[type='search']");
    const searchButton = form.querySelector("input[type='submit']");

    searchButton.addEventListener("click", (event) => {
      event.preventDefault(); 
      const query = searchInput.value.toLowerCase();
      const section = form.closest(".details");
      const influencers = section.querySelectorAll(".influencer-box");
      const noMatchesMessage = section.querySelector(".no-matches");

      let hasMatches = false;
      influencers.forEach((influencer) => {
        const influencerName = influencer
          .querySelector("h5")
          .textContent.toLowerCase();
        if (influencerName.includes(query)) {
          influencer.classList.add("show");
          influencer.style.display = "flex";
          setTimeout(() => (influencer.style.opacity = 1), 0); 
          hasMatches = true;
        } else {
          influencer.style.opacity = 0;
          setTimeout(() => {
            influencer.classList.remove("show");
            influencer.style.display = "none";
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

document.querySelectorAll(".views").forEach((button) => {
  button.addEventListener("click", function () {
    const inf_id = this.getAttribute("data-inf-id");
    const camp_id = this.getAttribute("data-camp-id");
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
          <p><strong>Payment Requested:</strong> ₹${amt}</p>

        </div>
      `,
      icon: "info",
      showCancelButton: true,
      cancelButtonText: "Close",
      showDenyButton: true,
      showConfirmButton: true,
      confirmButtonText: "Accept",
      denyButtonText: "Reject"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Are you sure?",
          text: "Do you want to proceed with this Accept?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes"
        }).then((result) => {
          if (result.isConfirmed) {
            data = {
              inf_id: inf_id,
              camp_id: camp_id
            };
            console.log(data);
            fetch("/influencer/accept-ad-req", {
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
                    icon: "error",
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
                  willClose: () => {
                    location.reload();
                  }
                });
              });
          }
        });
      } else if (result.isDenied) {
        Swal.fire({
          title: "Are you sure?",
          text: "Do you want to proceed with this Reject?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes"
        }).then((result) => {
          if (result.isConfirmed) {
            const data = {
              inf_id: inf_id,
              camp_id: camp_id
            };
            console.log(data);
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
      }
    });
  });
});

function showError(form, message) {
  const errorMessage = form.querySelector(".error-message");
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

document.querySelector("#edit-salary").addEventListener("click", (event) => {
  const form = document.querySelector("#change-salary");
  const span = document.querySelector("#salary");
  const input = form.querySelector("#product-salary-input");
  const saveIcon = form.querySelector("#save-salary");
  const cancelIcon = form.querySelector("#cancel-salary");
  const errorMessage = form.querySelector(".error-message");

  span.classList.add("hidden");
  form.classList.remove("hidden");
  input.classList.remove("hidden");
  saveIcon.classList.remove("hidden");
  cancelIcon.classList.remove("hidden");
  event.target.classList.add("hidden");
  if (errorMessage) errorMessage.classList.add("hidden"); 
  input.dataset.initialValue = input.value.trim(); 
});

document.querySelector("#save-salary").addEventListener("click", (event) => {
  const form = event.target.closest("form");
  const input = form.querySelector("#product-salary-input");
  const initialValue = input.dataset.initialValue;

  if (!input.value.trim()) {
    showError(form, "Salary is required");
    return;
  }

  if (input.value.trim() === initialValue) {
    showError(form, "No change detected");
    return;
  }

  form.submit();
});

document.querySelector("#cancel-salary").addEventListener("click", (event) => {
  const container = event.target.closest("div");
  const form = container.querySelector("form");
  const input = form.querySelector("#product-salary-input");
  const span = container.querySelector("span");
  const errorMessage = form.querySelector(".error-message");

  input.value = span.textContent.trim();
  span.classList.remove("hidden");
  input.classList.add("hidden");
  form.classList.add("hidden");
  container.querySelector(".edit-icon").classList.remove("hidden");
  container.querySelector(".save-icon").classList.add("hidden");
  container.querySelector(".cancel-icon").classList.add("hidden");
  if (errorMessage) errorMessage.classList.add("hidden"); 
});