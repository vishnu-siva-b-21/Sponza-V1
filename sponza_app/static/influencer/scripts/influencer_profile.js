document.addEventListener("DOMContentLoaded", function () {
  const checkboxes = document.querySelectorAll(".checkbox");
  const form = document.querySelector(".profile-form");
  const platformIcons = document.getElementById("platform-icons");
  let hasChanges = false;

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const platform = this.dataset.platform;
      const platformRow = this.closest(".platform-row");
      document.querySelectorAll(".url-input").forEach((inputField) => {
        inputField.classList.remove("show");
        setTimeout(() => {
          inputField.remove();
        }, 100);
      });

      if (this.checked) {
        const inputField = document.createElement("input");
        inputField.type = "text";
        inputField.placeholder = "Enter your URL";
        inputField.className = "url-input";
        inputField.id = `${checkbox.id}-url`;
        inputField.name = "influencer_social_media_link";
        inputField.dataset.platform = platform;
        inputField.style.width = "200px";
        inputField.style.padding = "7px";
        inputField.style.borderRadius = "4px";
        inputField.style.marginTop = "10px";

        platformRow.appendChild(inputField);

        setTimeout(() => {
          inputField.classList.add("show");
        }, 100);

        inputField.addEventListener("input", validatePlatformUrl);
      }
    });
  });

  form.addEventListener("input", () => {
    hasChanges = true; 
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault(); 

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const profilePic = document.getElementById("profile-pic").files[0];

    let isValid = true;

    document.getElementById("username-error").textContent = "";
    document.getElementById("email-error").textContent = "";
    document.getElementById("profile-pic-error").textContent = "";
    document.getElementById("platform-error").textContent = "";

    if (username === "") {
      document.getElementById("username-error").textContent =
        "Username cannot be empty.";
      isValid = false;
    } else if (/\s/.test(username)) {
      document.getElementById("username-error").textContent =
        "Username cannot contain spaces.";
      isValid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === "") {
      document.getElementById("email-error").textContent =
        "Email cannot be empty.";
      isValid = false;
    } else if (!emailPattern.test(email)) {
      document.getElementById("email-error").textContent =
        "Please enter a valid email address.";
      isValid = false;
    }

    if (profilePic) {
      const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.heif)$/i;
      if (!allowedExtensions.exec(profilePic.name)) {
        document.getElementById("profile-pic-error").textContent =
          "Only .jpg, .jpeg, .png, .heif formats are allowed.";
        isValid = false;
      }
    }

    if (!hasChanges) {
      Swal.fire({
        icon: "info",
        title: "No Changes Made",
        text: "Please make some changes before submitting.",
        confirmButtonText: "OK"
      });
      return; 
    }

    if (isValid) {
      form.submit(); 
    }
  });

  platformIcons.addEventListener("click", (e) => {
    if (e.target.tagName === "I") {
      const platform = e.target.dataset.platform;

      if (e.target.classList.contains("selected")) {
        e.target.classList.remove("selected");
        hasChanges = false; 
      } else {
        e.target.classList.add("selected");
        hasChanges = true; 
      }
    }
  });
  function validatePlatformUrl() {
    const errorContainer = document.getElementById("platform-error");
    const platform = this.dataset.platform;
    const urlValue = this.value.trim();

    let platformPattern;

    switch (platform) {
      case "youtube":
        platformPattern = /^https?:\/\/(www\.)?youtube\.com\/.+$/;
        break;
      case "instagram":
        platformPattern = /^https?:\/\/(www\.)?instagram\.com\/.+$/;
        break;
      case "x":
        platformPattern = /^https?:\/\/(www\.)?x\.com\/.+$/;
        break;

      default:
        platformPattern = /^https?:\/\/.+$/;
        break;
    }

    if (!platformPattern.test(urlValue)) {
      errorContainer.textContent = `Invalid ${platform} URL format.`;
      return false; 
    } else {
      errorContainer.textContent = "";
      return true; 
    }
  }

  document.querySelector(".delete").addEventListener("click", function () {
    const influencer_id = this.getAttribute("data-influencer-id");
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes"
    }).then((result) => {
      if (result.isConfirmed) {
        const data = { id: influencer_id }; 
        fetch("/influencer/delete-influencer", {
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
                  window.location.href = "/";
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