// Function to update the date and time displayed on the webpage
function setDateTime() {
    // Retrieve all elements with the class name "DateTime"
    var dateTime = document.getElementsByClassName("DateTime");
    // Get the current date and time
    var today = new Date();
    var date = today.toDateString(); // Format the date as a readable string
    var time = today.toLocaleTimeString(); // Format the time as a readable string
    // Update each element with the current date and time
    for (var i = 0; i < dateTime.length; i++) {
        dateTime[i].innerHTML = time + "<br>" + date;
    }
}

// Set an interval to update the date and time every 25 milliseconds
setInterval(setDateTime, 25);

// Function to validate that at least one checkbox is selected in the "Find Pet" form
function validateFindPetForm(event) {
    // Check if any of the pet requirement checkboxes are selected
    var dogs = document.getElementById("findDogs").checked;
    var cats = document.getElementById("findCats").checked;
    var children = document.getElementById("findChildren").checked;

    // If no checkboxes are selected, show an alert and prevent form submission
    if (!dogs && !cats && !children) {
        alert("Please select at least one quality requirement for your pet.");
        event.preventDefault(); // Prevent form submission
    }
}

// Function to validate that at least one checkbox is selected in the "Give Away Pet" form
function validateGivePetForm(event) {
    // Check if any of the pet characteristic checkboxes are selected
    var charDogs = document.getElementById("giveDogs").checked;
    var charCats = document.getElementById("giveCats").checked;
    var charChildren = document.getElementById("giveChildren").checked;

    // If no checkboxes are selected, show an alert and prevent form submission
    if (!charDogs && !charCats && !charChildren) {
        alert("Please select at least one characteristic that describes your pet.");
        event.preventDefault(); // Prevent form submission
    }
}

// Attach the validation function to the submit event of the "Find Pet" form
document.getElementById("findForm").addEventListener("submit", validateFindPetForm);

// Attach the validation function to the submit event of the "Give Away Pet" form
document.getElementById("giveForm").addEventListener("submit", validateGivePetForm);

// Function to update the current date and time in the header
function updateTime() {
    const dateTimeElement = document.querySelector('.DateTime');
    if (dateTimeElement) {
      dateTimeElement.textContent = new Date().toLocaleString();
    }
  }
  
  // Call updateTime every second to keep the time updated
  setInterval(updateTime, 1000);
  
  // Initialize time display on page load
  updateTime();
  
 // Function to handle form submission and redirect with query parameters
function handleFormSubmit(event) {
    event.preventDefault(); // Prevent default form submission

    const petType = document.querySelector('input[name="findPet"]:checked').value;
    const breedInput = document.querySelector('#findBreedText').value.trim();
    const breed = breedInput ? breedInput : 'none';
    const age = document.querySelector('select[name="findAge"]').value;
    const gender = document.querySelector('input[name="findGender"]:checked').value;
    const requirements = Array.from(document.querySelectorAll('input[name="findRequirement"]:checked'))
        .map(checkbox => checkbox.value)
        .join(',');

    const queryString = `petType=${encodeURIComponent(petType)}&breed=${encodeURIComponent(breed)}&age=${encodeURIComponent(age)}&gender=${encodeURIComponent(gender)}&requirements=${encodeURIComponent(requirements)}`;

    // Redirect to the results page with query parameters
    window.location.href = `/results?${queryString}`;
}

// Attach the handleFormSubmit function to the submit event of the "Find Pet" form
document.getElementById("findPetForm").addEventListener("submit", handleFormSubmit);

