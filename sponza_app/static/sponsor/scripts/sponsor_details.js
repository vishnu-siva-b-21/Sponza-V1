document.addEventListener("DOMContentLoaded", (event) => {
  document.getElementById("updateButton").addEventListener("click", (event) => {
    event.preventDefault(); 
    showFileUploadAlert();
  });

  function showFileUploadAlert() {
    const uploadUrl = document
      .getElementById("updateButton")
      .getAttribute("data-upload-url");
    Swal.fire({
      title: "Upload Campaign Image",
      html: `<form id='camp-image-form' action="${uploadUrl}" enctype="multipart/form-data" method="post">
                <input type="file" name="camp_image" id="fileUpload" class="swal2-file-input" accept=".jpg, .jpeg, .png">
                            </form>`,
      focusConfirm: false,
      confirmButtonText: "Upload",
      showCancelButton: true,
      preConfirm: () => {
        const fileInput = document.getElementById("fileUpload");
        const file = fileInput.files[0];

        if (!file) {
          Swal.showValidationMessage("No file selected");
          return false;
        }

        const validFormats = ["image/jpeg", "image/png"];
        if (!validFormats.includes(file.type)) {
          Swal.showValidationMessage(
            "Invalid file format. Please select a .jpg, .jpeg, or .png file."
          );
          return false;
        }

        return file;
      },
      customClass: {
        container: "swal2-container",
        popup: "swal2-popup",
        header: "swal2-header",
        title: "swal2-title",
        closeButton: "swal2-close",
        icon: "swal2-icon",
        htmlContainer: "swal2-html-container",
        footer: "swal2-footer",
        confirmButton: "swal2-confirm",
        cancelButton: "swal2-cancel"
      }
    }).then((result) => {
      if (result.isConfirmed) {
        form = document.getElementById("camp-image-form");
        form.submit();
      }
    });
  }
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

document.querySelector(".create-detail").addEventListener("click", function () {
  var adInfluencer;
  Swal.fire({
    title: "Create New Ad Request",
    html: `
                  <input id="ad-payment" class="swal2-input" placeholder="Payment">
                  <input id="ad-influencer" class="swal2-input" placeholder="Search Influencer" autocomplete="off">
                  <ul id="influencer-suggestions" style="list-style: none; padding: 0; margin-top: 5px;"></ul>
              `,
    showCancelButton: true,
    confirmButtonText: "Submit",
    didOpen: () => {
      const influencerInput = document.getElementById("ad-influencer");
      const suggestionsList = document.getElementById("influencer-suggestions");

      influencerInput.addEventListener("input", function () {
        const query = influencerInput.value;
        if (query.length > 0) {
          fetch("/sponsor/search-inf", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ query: query })
          })
            .then((response) => response.json())
            .then((data) => {
              suggestionsList.innerHTML = "";

              data.users.forEach((user) => {
                const userBox = document.createElement("li");
                userBox.classList.add("influencer-box");

                userBox.innerHTML = `
                                      <div class="influencer-avatar" style="background-image: url('${
                                        user.image
                                      }');"></div>
                                      <div class="influencer-info">
                                          <h4>${user.username}</h4>
                                          <p>${
                                            user.email || "No email provided"
                                          }</p>
                                      </div>
                                  `;
                userBox.addEventListener("click", function () {
                  influencerInput.value = user.username;
                  suggestionsList.innerHTML = "";
                  adInfluencer = user.id;
                });

                suggestionsList.appendChild(userBox);
              });
            })
            .catch((error) => {
              console.error("Error fetching data:", error);
            });
        } else {
          suggestionsList.innerHTML = "";
        }
      });
    },
    preConfirm: () => {
      const adPayment = document.getElementById("ad-payment").value;

      if (!adPayment || !adInfluencer) {
        Swal.showValidationMessage("Please fill in all fields");
        return false;
      }

      if (isNaN(adPayment) || adPayment <= 0) {
        Swal.showValidationMessage("Payment must be a numbers");
        return false;
      }

      return {
        adPayment: adPayment,
        adInfluencerid: adInfluencer
      };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const adData = result.value;

      const campId = document.getElementById("product-name-container").dataset
        .campId;

      fetch(`/sponsor/send-ad-request/${campId}`, {
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

document
  .getElementById("delete-campaign-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    Swal.fire({
      title: "You are about to delete the Campaign, are you sure?",
      html: `
        <div style="margin-top: 10px;">
          <i class="fa-solid fa-exclamation-triangle" style="color: orange;"></i>
          <span>Consider the checkbox, Deleting all data is not recommended!</span>
        </div>
        <div>
          <input type="checkbox" id="accept-terms">
          <label for="accept-terms">Accept terms and conditions</label>
        </div>   
      `,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const acceptTerms = document.getElementById("accept-terms").checked;
        if (!acceptTerms) {
          Swal.showValidationMessage(
            "You need to accept the terms and conditions"
          );
          return false;
        }
        return true;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        document.getElementById("delete-campaign-form").submit();
      }
    });
  });

document.querySelectorAll(".views").forEach((button) => {
  button.addEventListener("click", function () {
    const inf_id = this.getAttribute("data-inf-id");
    const camp_id = this.getAttribute("data-camp-id");
    const userName = this.getAttribute("data-user-name");
    const niche = this.getAttribute("data-inf-niche");
    const email = this.getAttribute("data-inf-email");
    const amt = this.getAttribute("data-inf-amt");
    const platform = this.getAttribute("data-inf-platform");
    const link = this.getAttribute("data-inf-link");

    let platformIcon = "";
    let platformColor = "";

    if (platform === "youtube") {
      platformIcon = '<i class="fab fa-youtube"></i>';
      platformColor = "red";
    } else if (platform === "twitter") {
      platformIcon = '<i class="fab fa-twitter"></i>';
      platformColor = "#1DA1F2";
    } else if (platform === "instagram") {
      platformIcon = '<i class="fab fa-instagram"></i>';
      platformColor = "#E1306C";
    }

    Swal.fire({
      title: "Influencer Details",
      html: `
          <form style="text-align:left;">
              <p><strong>Username:</strong> ${userName}</p>
              <p><strong>Niche:</strong> ${niche}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Social Profile:</strong>
                  <a href="${link}" target="_blank" style="color: ${platformColor};">
                      ${platformIcon}
                  </a>
              </p>
              <p><strong>Requested Amount:</strong> ₹${amt}</p>
          </form>
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
            fetch("/sponsor/accept-ad-req", {
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
            fetch("/sponsor/rm-ad-req", {
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
      }
    });
  });
});

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
        fetch("/sponsor/rm-ad-req", {
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

function showError(form, message) {
  const errorMessage = form.querySelector(".error-message");
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

document.querySelector("#edit-name").addEventListener("click", (event) => {
  const form = document.querySelector("#change-name");
  const span = document.querySelector("#product-name");
  const input = form.querySelector("input");
  const saveIcon = form.querySelector("#save-name");
  const cancelIcon = form.querySelector("#cancel-name");
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

document.querySelector("#save-name").addEventListener("click", (event) => {
  const form = event.target.closest("form");
  const input = form.querySelector("input");
  const initialValue = input.dataset.initialValue;

  if (!input.value.trim()) {
    showError(form, "Name is required");
    return;
  }

  if (input.value.trim() === initialValue) {
    showError(form, "No change detected");
    return;
  }

  form.submit();
});

document.querySelector("#cancel-name").addEventListener("click", (event) => {
  const container = event.target.closest("div");
  const form = container.querySelector("form");
  const input = form.querySelector("input");
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

document
  .querySelector("#edit-description")
  .addEventListener("click", (event) => {
    const form = document.querySelector("#change-description");
    const span = document.querySelector("#description");
    const input = form.querySelector("textarea");
    const saveIcon = form.querySelector("#save-description");
    const cancelIcon = form.querySelector("#cancel-description");
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

document
  .querySelector("#save-description")
  .addEventListener("click", (event) => {
    const form = event.target.closest("form");
    const input = form.querySelector("textarea");
    const initialValue = input.dataset.initialValue;

    if (!input.value.trim()) {
      showError(form, "Description is required");
      return;
    }

    if (input.value.trim() === initialValue) {
      showError(form, "No change detected");
      return;
    }

    form.submit();
  });

document
  .querySelector("#cancel-description")
  .addEventListener("click", (event) => {
    const container = event.target.closest("div");
    const form = container.querySelector("form");
    const input = form.querySelector("textarea");
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

function showError(element, message) {
  const errorMessage = element.querySelector(".error-message");
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
  }
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