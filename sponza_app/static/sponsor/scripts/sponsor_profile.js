document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".profile-form");
  let hasChanges = false; 

  form.addEventListener("input", () => {
    hasChanges = true; 
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault(); 

    const companyName = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const profilePic = document.getElementById("profile-pic").files[0];

    let isValid = true;

    document.getElementById("username-error").textContent = "";
    document.getElementById("email-error").textContent = "";
    document.getElementById("profile-pic-error").textContent = "";

    if (companyName === "") {
      document.getElementById("username-error").textContent =
        "Company name cannot be empty.";
      isValid = false;
    } else if (/\s/.test(companyName)) {
      document.getElementById("username-error").textContent =
        "Company name cannot contain spaces.";
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
});

document.querySelector(".delete").addEventListener("click", function () {
  const sponsor_id = this.getAttribute("data-sponsor-id");
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
      data = sponsor_id;
      fetch("/sponsor/delete-sponsor", {
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