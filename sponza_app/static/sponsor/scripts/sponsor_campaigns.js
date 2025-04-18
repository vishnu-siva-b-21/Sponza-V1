document
  .querySelector(".add-campaigns-image")
  .addEventListener("click", function () {
    const currentDate = new Date();
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(currentDate.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];

    Swal.fire({
      title: "Create New Campaign",
      html: `
            <div style="text-align:left;">
            <form id="campaign-form" action="/sponsor/add-campaign" method='POST' enctype="multipart/form-data" style="display: flex; flex-direction: column; gap: 0.6em;">
                <div style="display: flex; align-items: center; gap: 1em;">
                    <label for="title" style="flex: 1; min-width: 100px;">Title:</label>
                    <input type="text" id="title" name='title' class="swal2-input" placeholder="Enter title" style="flex: 2;">
                </div>
                <div style="display: flex; align-items: center; gap: 1em;">
                    <label for="description" style="flex: 1; min-width: 100px;">Description:</label>
                    <textarea id="description" name='desc' class="swal2-textarea" placeholder="Enter description" style="flex: 2;"></textarea>
                </div>
                <div style="display: flex; align-items: center; gap: 1em;">
                    <label for="image" style="flex: 1; min-width: 100px;">Profile Picture:</label>
                    <input type="file" id="image" name='profile_pic' class="swal2-file" style="flex: 2;">
                </div>
                <div style="display: flex; align-items: center; gap: 1em;">
                    <label for="end-date" style="flex: 1; min-width: 100px;">End Date:</label>
                    <input type="date" id="end-date" name='end_date' class="swal2-input" style="flex: 2;" min="${minDate}">
                </div>
            </form>
            </div>
        `,
      showCancelButton: true,
      confirmButtonText: "Add",
      preConfirm: () => {
        const title = document.getElementById("title").value;
        const description = document.getElementById("description").value;
        const endDate = document.getElementById("end-date").value;

        if (!title || !description || !endDate) {
          Swal.showValidationMessage("Please fill out all fields");
          return false;
        }

        if (endDate < minDate) {
          Swal.showValidationMessage(
            "End date must be tomorrow or a future date"
          );
          return false;
        }

        return { title, description, endDate };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        form = document.getElementById("campaign-form");
        form.submit();
      }
    });
  });

function performSearch() {

  const searchQuery = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();

  const campaignBoxes = document.querySelectorAll(".box");

  campaignBoxes.forEach((box) => {
    const campaignName = box
      .querySelector("h4 b")
      .textContent.trim()
      .toLowerCase();

    if (campaignName.includes(searchQuery)) {
      box.style.display = "block"; 
    } else {
      box.style.display = "none"; 
    }
  });

  if (searchQuery === "") {
    campaignBoxes.forEach((box) => {
      box.style.display = "block"; 
    });
  }
}

document
  .getElementById("searchButton")
  .addEventListener("click", performSearch);

document
  .getElementById("searchInput")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); 
      performSearch();
    }
  });