document.addEventListener("DOMContentLoaded", function () {
  const checkboxes = document.querySelectorAll(".checkbox");

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
      }
    });
  });

  const signInForm = document.getElementById("signInForm");
  signInForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const role = document.getElementById("role").value;
    const email = document.getElementById("signin-email").value;
    const password = document.getElementById("signin-password").value;

    document.getElementById("role-error").textContent = "";
    document.getElementById("signin-email-error").textContent = "";
    document.getElementById("signin-password-error").textContent = "";

    let isValid = true;

    if (!role) {
      document.getElementById("role-error").textContent = "Role is required";
      document.getElementById("role").classList.add("error");
      isValid = false;
    } else if (role === "") {
      document.getElementById("role-error").textContent =
        "Please select a role";
      document.getElementById("role").classList.add("error");
      isValid = false;
    } else {
      document.getElementById("role").classList.remove("error");
    }

    if (!email) {
      document.getElementById("signin-email-error").textContent =
        "Email cannot be empty.";
      document.getElementById("signin-email").classList.add("error");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById("signin-email-error").textContent =
        "Please enter a valid email address.";
      document.getElementById("signin-email").classList.add("error");
      isValid = false;
    } else {
      document.getElementById("signin-email").classList.remove("error");
    }

    if (!password) {
      document.getElementById("signin-password-error").textContent =
        "Password is required";
      document.getElementById("signin-password").classList.add("error");
      isValid = false;
    } else {
      document.getElementById("signin-password").classList.remove("error");
    }

    if (isValid) {
      signInForm.submit();
    }
  });

  const influencerSignUpForm = document.getElementById("InfluencerForm");

  influencerSignUpForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    let isValid = true;
    const username = document.getElementById("influencer-username").value;
    const email = document.getElementById("influencer-email").value;
    const niche = document.getElementById("influencer-niche").value;
    const password = document.getElementById("influencer-password").value;
    const confirmPassword = document.getElementById(
      "influencer-confirm-password"
    ).value;
    const checkboxes = document.querySelectorAll(".checkbox");
    const checked_checkboxes = document.querySelectorAll(".checkbox:checked");

    document.getElementById("influencer-username-error").textContent = "";
    document.getElementById("influencer-email-error").textContent = "";
    document.getElementById("influencer-niche-error").textContent = "";
    document.getElementById("influencer-password-error").textContent = "";
    document.getElementById("influencer-confirm-password-error").textContent =
      "";
    document.getElementById("influencer-platform-error").textContent = "";

    const namePattern = /^[A-Za-z]{4,20}$/;
    if (!username) {
      document.getElementById("influencer-username-error").textContent =
        "Username is required";
      document.getElementById("influencer-username").classList.add("error");
      isValid = false;
    } else if (!namePattern.test(username)) {
      document.getElementById("influencer-username-error").textContent =
        "Enter a valid Username";
      document.getElementById("influencer-username").classList.add("error");
      isValid = false;
    } else {
      document.getElementById("influencer-username").classList.remove("error");
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      document.getElementById("influencer-email-error").textContent =
        "Email is required.";
      document.getElementById("influencer-email").classList.add("error");
      isValid = false;
    } else if (!emailPattern.test(email)) {
      document.getElementById("influencer-email-error").textContent =
        "Enter a valid email address.";
      document.getElementById("influencer-email").classList.add("error");
      isValid = false;
    } else {

      try {
        const response = await fetch("/get-all-users/influencer", {
          method: "POST"
        });
        const data = await response.json();
        if (data.includes(email)) {
          document.getElementById("influencer-email-error").textContent =
            "Email address already taken.";
          document.getElementById("influencer-email").classList.add("error");
          isValid = false;
        } else {
          document.getElementById("influencer-email").classList.remove("error");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        isValid = false;
      }
    }

    const nichePattern = /^[A-Za-z]{4,30}$/;
    if (!niche) {
      document.getElementById("influencer-niche-error").textContent =
        "Niche is required";
      document.getElementById("influencer-niche").classList.add("error");
      isValid = false;
    } else if (!nichePattern.test(niche)) {
      document.getElementById("influencer-niche-error").textContent =
        "Enter a valid Niche";
      document.getElementById("influencer-niche").classList.add("error");
      isValid = false;
    } else {
      document.getElementById("influencer-niche").classList.remove("error");
    }

    if (!password) {
      document.getElementById("influencer-password-error").textContent =
        "Password is required";
      document.getElementById("influencer-password").classList.add("error");
      isValid = false;
    } else if (password.length < 8) {
      document.getElementById("influencer-password-error").textContent =
        "Password must be at least 8 characters long.";
      document.getElementById("influencer-password").classList.add("error");
      isValid = false;
    } else if (!/[A-Z]/.test(password)) {
      document.getElementById("influencer-password-error").textContent =
        "Password must contain at least one uppercase letter.";
      document.getElementById("influencer-password").classList.add("error");
      isValid = false;
    } else if (!/[a-z]/.test(password)) {
      document.getElementById("influencer-password-error").textContent =
        "Password must contain at least one lowercase letter.";
      document.getElementById("influencer-password").classList.add("error");
      isValid = false;
    } else if (!/\d/.test(password)) {
      document.getElementById("influencer-password-error").textContent =
        "Password must contain at least one digit.";
      document.getElementById("influencer-password").classList.add("error");
      isValid = false;
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      document.getElementById("influencer-password-error").textContent =
        "Password must contain at least one special character.";
      document.getElementById("influencer-password").classList.add("error");
      isValid = false;
    } else {
      document.getElementById("influencer-password").classList.remove("error");
    }

    if (!confirmPassword) {
      document.getElementById("influencer-confirm-password-error").textContent =
        "Confirm password is required";
      document
        .getElementById("influencer-confirm-password")
        .classList.add("error");
      isValid = false;
    } else if (password !== confirmPassword) {
      document.getElementById("influencer-confirm-password-error").textContent =
        "Passwords do not match";
      document
        .getElementById("influencer-confirm-password")
        .classList.add("error");
      isValid = false;
    } else {
      document
        .getElementById("influencer-confirm-password")
        .classList.remove("error");
    }

    if (checked_checkboxes.length === 0) {
      document.getElementById("influencer-platform-error").textContent =
        "Please select at least one platform.";
      isValid = false;
    } else {
      checked_checkboxes.forEach((checkbox) => {
        const platform = checkbox.dataset.platform;
        const urlField = document.getElementById(`${checkbox.id}-url`);
        const urlValue = urlField ? urlField.value.trim() : "";

        if (!urlValue) {
          document.getElementById("influencer-platform-error").textContent =
            "Please enter URL for selected platform(s).";
          urlField.classList.add("error");
          isValid = false;
        } else {
          let platformPattern;
          switch (platform) {
            case "instagram":
              platformPattern =
                /^(https?:\/\/)?(www\.)?instagram\.com\/[A-Za-z0-9._-]+\/?$/;
              break;
            case "twitter":
              platformPattern =
                /^(https?:\/\/)?(www\.)?x\.com\/[A-Za-z0-9._-]+\/?$/;
              break;
            case "youtube":
              platformPattern =
                /^(https?:\/\/)?(www\.)?(youtube\.com\/(channel\/|user\/|c\/|watch\?v=|@)?[A-Za-z0-9_-]+|youtu\.be\/[A-Za-z0-9_-]+)$/;
              break;
            default:
              platformPattern = null;
          }

          if (platformPattern && !platformPattern.test(urlValue)) {
            document.getElementById(
              "influencer-platform-error"
            ).textContent = `Please enter a valid URL for ${platform}.`;
            urlField.classList.add("error");
            isValid = false;
          } else {
            urlField.classList.remove("error");
          }
        }
      });
    }

    if (isValid) {
      influencerSignUpForm.submit();
    }
  });

  const sponsorSignUpForm = document.getElementById("SponsorForm");
  sponsorSignUpForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    let isValid = true;
    const companyname = document.getElementById("sponsor-companyname").value;
    const email = document.getElementById("sponsor-email").value;
    const password = document.getElementById("sponsor-password").value;
    const confirmPassword = document.getElementById(
      "sponsor-confirm-password"
    ).value;

    document.getElementById("sponsor-companyname-error").textContent = "";
    document.getElementById("sponsor-email-error").textContent = "";
    document.getElementById("sponsor-password-error").textContent = "";
    document.getElementById("sponsor-confirm-password-error").textContent = "";

    if (!companyname) {
      document.getElementById("sponsor-companyname-error").textContent =
        "Company name is required";
      document.getElementById("sponsor-companyname").classList.add("error");
      isValid = false;
    } else {
      document.getElementById("sponsor-companyname").classList.remove("error");
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      document.getElementById("sponsor-email-error").textContent =
        "Email is required";
      document.getElementById("sponsor-email").classList.add("error");
      isValid = false;
    } else if (!emailPattern.test(email)) {
      document.getElementById("sponsor-email-error").textContent =
        "Enter a valid email address.";
      document.getElementById("sponsor-email").classList.add("error");
      isValid = false;
    } else {

      try {
        const response = await fetch("/get-all-users/sponsor", {
          method: "POST"
        });
        const data = await response.json();
        if (data.includes(email)) {
          document.getElementById("sponsor-email-error").textContent =
            "Email address already taken.";
          document.getElementById("sponsor-email").classList.add("error");
          isValid = false;
        } else {
          document.getElementById("sponsor-email").classList.remove("error");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        isValid = false;
      }
    }

    if (!password) {
      document.getElementById("sponsor-password-error").textContent =
        "Password is required";
      document.getElementById("sponsor-password").classList.add("error");
      isValid = false;
    } else if (password.length < 8) {
      document.getElementById("sponsor-password-error").textContent =
        "Password must be at least 8 characters long.";
      document.getElementById("sponsor-password").classList.add("error");
      isValid = false;
    } else if (!/[A-Z]/.test(password)) {
      document.getElementById("sponsor-password-error").textContent =
        "Password must contain at least one uppercase letter.";
      document.getElementById("sponsor-password").classList.add("error");
      isValid = false;
    } else if (!/[a-z]/.test(password)) {
      document.getElementById("sponsor-password-error").textContent =
        "Password must contain at least one lowercase letter.";
      document.getElementById("sponsor-password").classList.add("error");
      isValid = false;
    } else if (!/\d/.test(password)) {
      document.getElementById("sponsor-password-error").textContent =
        "Password must contain at least one digit.";
      document.getElementById("sponsor-password").classList.add("error");
      isValid = false;
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      document.getElementById("sponsor-password-error").textContent =
        "Password must contain at least one special character.";
      document.getElementById("sponsor-password").classList.add("error");
      isValid = false;
    } else {
      document.getElementById("sponsor-password").classList.remove("error");
    }

    if (!confirmPassword) {
      document.getElementById("sponsor-confirm-password-error").textContent =
        "Confirm password is required";
      document
        .getElementById("sponsor-confirm-password")
        .classList.add("error");
      isValid = false;
    } else if (password !== confirmPassword) {
      document.getElementById("sponsor-confirm-password-error").textContent =
        "Passwords do not match";
      document
        .getElementById("sponsor-confirm-password")
        .classList.add("error");
      isValid = false;
    } else {
      document
        .getElementById("sponsor-confirm-password")
        .classList.remove("error");
    }

    if (isValid) {
      sponsorSignUpForm.submit();
    }
  });
});

function showLoadingScreen() {
  document.getElementById("loadingScreen").style.display = "flex";
}

function hideLoadingScreen() {
  document.getElementById("loadingScreen").style.display = "none";
}

function showForgotPasswordPopup() {
  const signin_email = document.getElementById("signin-email").value;
  Swal.fire({
    title: "Forgot Password",
    html: `
      <p>Please enter your email address to reset your password.</p>
      <input type="email" id="email" class="swal2-input" placeholder="Enter your email address" aria-label="Enter your email address" value=${signin_email}>
      <br>
    `,
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "Submit",
    customClass: {
      popup: "animated fadeInDown"
    },
    preConfirm: () => {
      const role = document.getElementById("role").value;
      const email = Swal.getPopup().querySelector("#email").value;

      if (!email) {
        Swal.showValidationMessage("Please enter your email address");
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Swal.showValidationMessage("Please enter a valid email address");
      } else if (!role) {
        Swal.showValidationMessage("Please select a role");
      }
      return {
        email: email,
        role: role
      };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      showLoadingScreen();
      const data = result.value;
      fetch("/user-reset-request", {
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
          } else if (data.authorized) {
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
            text: "There was an error sending the password reset request",
            icon: "error"
          });
        });
    }
  });
}

function toggleForgetPassword() {
  const role = document.getElementById("role").value;
  const forgetPasswordLink = document.getElementById("forget-password");
  forgetPasswordLink.style.display = role ? "block" : "none";
}
function showSignInForm() {
  document.getElementById("signInForm").style.display = "block";
  document.getElementById("registerForm").style.display = "none";

  document.querySelectorAll(".tablink").forEach((tab) => {
    tab.classList.remove("active");
  });
  document.querySelector(".tablink.signin").classList.add("active");
}

function showRegisterForm() {
  document.getElementById("signInForm").style.display = "none";
  document.getElementById("registerForm").style.display = "block";

  document.querySelectorAll(".tablink").forEach((tab) => {
    tab.classList.remove("active");
  });
  document.querySelector(".tablink.register").classList.add("active");
}

function openRole(evt, roleName) {
  const tabcontent = document.getElementsByClassName("form-detail");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].classList.remove("active");
  }
  const tablinks = document.getElementsByClassName("tablinks");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove("active");
  }
  document.getElementById(roleName + "Form").classList.add("active");
  evt.currentTarget.classList.add("active");
}

document.querySelector(".tablinks.active").click();

function toggleForgetPassword() {
  const role = document.getElementById("role").value;
  const forgetPasswordLink = document.getElementById("forget-password");

  if (role === "admin" || role === "") {
    forgetPasswordLink.style.display = "none";
  } else {
    forgetPasswordLink.style.display = "block";
  }
}

window.onload = toggleForgetPassword;

function togglePasswordVisibility(inputId, eyeIcon) {
  const passwordInput = document.getElementById(inputId);

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    eyeIcon.classList.remove("fa-eye-slash");
    eyeIcon.classList.add("fa-eye");
  } else {
    passwordInput.type = "password";
    eyeIcon.classList.remove("fa-eye");
    eyeIcon.classList.add("fa-eye-slash");
  }
}

function togglePasswordVisibility(inputId, eyeIcon) {
  const passwordInput = document.getElementById(inputId);

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    eyeIcon.classList.remove("fa-eye-slash");
    eyeIcon.classList.add("fa-eye");
  } else {
    passwordInput.type = "password";
    eyeIcon.classList.remove("fa-eye");
    eyeIcon.classList.add("fa-eye-slash");
  }
}
window.onload = function () {
  showSignInForm();
};

document.querySelector(".delete").addEventListener("click", function () {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire("Deleted!", "Your file has been deleted.", "success");

    }
  });
});