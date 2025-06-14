import { auth } from "../firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const memoryForm = document.getElementById("memoryForm");
const memoryGrid = document.getElementById("memoryGrid");
let memoryDatabase = JSON.parse(localStorage.getItem("memoryDatabase")) || {};
let currUser = null;

// Make showAddMemoryForm globally accessible
window.showAddMemoryForm = function () {
  document.getElementById("add-memory-modal").classList.add("active");
  document.getElementById("main-container").classList.add("blurred");
  // Reset form when showing
  document.getElementById("memoryForm").reset();
  document.getElementById("editId").value = "";
};

// Make hideAddMemoryForm globally accessible
window.hideAddMemoryForm = function () {
  document.getElementById("add-memory-modal").classList.remove("active");
  document.getElementById("main-container").classList.remove("blurred");
  document.getElementById("memoryForm").reset();
  document.getElementById("editId").value = "";
};

// Check Firebase auth state
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currUser = user;
    document.getElementById("user-email").innerText = user.email;
    // Load user's memories when authenticated
    loadMemories();
    // Check for milestone dates
    checkMilestoneDates();
    // Check for milestone reminders after a short delay to ensure DOM is ready
    setTimeout(checkMilestoneReminders, 1000);
  } else {
    // Redirect if not logged in
    window.location.href = "index.html";
  }
});

// Function to load and display memories
function loadMemories() {
  if (!currUser) {
    console.log("No current user found in loadMemories");
    return;
  }

  console.log("Loading memories for user:", currUser.email);
  const userMemories = memoryDatabase[currUser.email] || [];
  console.log("User memories:", userMemories);

  memoryGrid.innerHTML = ""; // Clear existing memories

  if (userMemories.length === 0) {
    memoryGrid.innerHTML =
      '<div class="no-memories">No memories yet. Add your first memory!</div>';
    return;
  }

  userMemories.forEach((memory, index) => {
    const memoryCard = createMemoryCard(memory, index);
    memoryGrid.appendChild(memoryCard);
  });
}

// Function to create memory card
function createMemoryCard(memory, index) {
  console.log("Creating card for memory:", memory);
  const card = document.createElement("div");
  card.className = "memory-card";

  let mediaContent = "";
  if (memory.photoUrl) {
    if (memory.mediaType === "video") {
      mediaContent = `
        <video controls style="width: 100%; border-radius: 4px; margin-bottom: 0.5rem;">
          <source src="${memory.photoUrl}" type="video/mp4">
          Your browser does not support the video tag.
        </video>`;
    } else {
      mediaContent = `<img src="${memory.photoUrl}" alt="${memory.title}" style="width: 100%; border-radius: 4px; margin-bottom: 0.5rem;">`;
    }
  }
  if (memory.voiceUrl) {
    mediaContent += `<audio controls src="${memory.voiceUrl}" style="width: 100%; margin-bottom: 0.5rem;"></audio>`;
  }

  const milestoneBadge = memory.isMilestone
    ? '<span class="milestone-badge"><i class="fas fa-star"></i></span>'
    : "";

  // Format tags with hashtags and highlight
  const formattedTags = memory.tags
    ? memory.tags
        .split(",")
        .map((tag) => `<span class="tag">#${tag.trim()}</span>`)
        .join(" ")
    : '<span class="tag">#No tags</span>';

  card.innerHTML = `
    ${mediaContent}
    <h3>${memory.title || "Untitled"} ${milestoneBadge}</h3>
    <p>${memory.description || "No description"}</p>
    <div class="tags-container">
      ${formattedTags}
    </div>
    <p>Location: ${memory.location || "No location"}</p>
    <p>Created: ${new Date(memory.createdAt).toLocaleDateString()}</p>
    <div class="button-group">
      <button class="delete-btn" onclick="deleteMemory(${index})">
        <i class="fas fa-trash"></i> Delete
      </button>
      <button class="milestone-btn ${
        memory.isMilestone ? "active" : ""
      }" onclick="toggleMilestone(${index})">
        <i class="fas fa-star"></i> ${memory.isMilestone ? "Starred" : "Star"}
      </button>
    </div>
  `;

  // Add styles for tags and buttons
  const style = document.createElement("style");
  style.textContent = `
    .tags-container {
      margin: 0.5rem 0;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tag {
      background: linear-gradient(45deg, #d4a017, #f4c542);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.9rem;
      display: inline-block;
      transition: transform 0.2s ease;
    }

    .dark .tag {
      background: linear-gradient(45deg, #f4c542, #d4a017);
    }

    .tag:hover {
      transform: translateY(-2px);
    }

    .button-group {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }

    .delete-btn, .milestone-btn {
      flex: 1;
      padding: 8px 15px;
      border: none;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s ease;
    }

    .delete-btn {
      background: #ff4d4d;
      color: white;
    }

    .delete-btn:hover {
      background: #ff3333;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 77, 77, 0.3);
    }

    .milestone-btn {
      background: linear-gradient(45deg, #607D8B, #455A64);
      color: white;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .milestone-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(96, 125, 139, 0.3);
    }

    .milestone-btn.active {
      background: linear-gradient(45deg, #455A64, #607D8B);
      box-shadow: 0 4px 12px rgba(96, 125, 139, 0.3);
    }

    .milestone-btn i {
      transition: transform 0.3s ease;
    }

    .milestone-btn:hover i {
      transform: scale(1.1);
    }

    .dark .milestone-btn {
      background: linear-gradient(45deg, #455A64, #607D8B);
    }

    .dark .milestone-btn:hover {
      box-shadow: 0 4px 12px rgba(96, 125, 139, 0.3);
    }
  `;
  document.head.appendChild(style);

  return card;
}

// Function to delete memory
window.deleteMemory = function (index) {
  if (confirm("Are you sure you want to delete this memory?")) {
    try {
      const userMemories = memoryDatabase[currUser.email] || [];
      if (index >= 0 && index < userMemories.length) {
        userMemories.splice(index, 1);
        memoryDatabase[currUser.email] = userMemories;
        localStorage.setItem("memoryDatabase", JSON.stringify(memoryDatabase));
        loadMemories(); // Reload memories
        alert("Memory deleted successfully!");
      } else {
        console.error("Invalid memory index:", index);
        alert("Error: Memory not found");
      }
    } catch (error) {
      console.error("Error deleting memory:", error);
      alert("Failed to delete memory. Please try again.");
    }
  }
};

// Upload image to Cloudinary
async function uploadImage(file) {
  if (!file) throw new Error("No image file provided");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "my_preset");
  try {
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dx2txnuub/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );
    if (!res.ok) throw new Error("Image upload failed");
    const data = await res.json();
    return data.secure_url;
  } catch (error) {
    console.error("Image upload error:", error);
    throw error;
  }
}

// Upload video to Cloudinary
async function uploadVideo(file) {
  if (!file) throw new Error("No video file provided");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "my_preset");
  try {
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dx2txnuub/video/upload",
      {
        method: "POST",
        body: formData,
      }
    );
    if (!res.ok) throw new Error("Video upload failed");
    const data = await res.json();
    return data.secure_url;
  } catch (error) {
    console.error("Video upload error:", error);
    throw error;
  }
}

// Upload audio to Cloudinary
async function uploadAudio(file) {
  if (!file) throw new Error("No audio file provided");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "my_preset");
  formData.append("resource_type", "auto");
  try {
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dx2txnuub/auto/upload",
      {
        method: "POST",
        body: formData,
      }
    );
    if (!res.ok) throw new Error("Audio upload failed");
    const data = await res.json();
    return data.secure_url;
  } catch (error) {
    console.error("Audio upload error:", error);
    throw error;
  }
}

// Function to toggle milestone status
window.toggleMilestone = function (index) {
  const userMemories = memoryDatabase[currUser.email] || [];
  const memory = userMemories[index];

  if (!memory) {
    console.error("Memory not found at index:", index);
    return;
  }

  // Toggle milestone status
  memory.isMilestone = !memory.isMilestone;

  // Update localStorage
  memoryDatabase[currUser.email] = userMemories;
  localStorage.setItem("memoryDatabase", JSON.stringify(memoryDatabase));

  // Reload memories to update the view
  loadMemories();

  // Show feedback
  alert(
    memory.isMilestone
      ? `"${memory.title}" has been marked as a milestone!`
      : `"${memory.title}" is no longer a milestone.`
  );
};

// Function to check for milestone dates
function checkMilestoneDates() {
  if (!currUser) return;

  const userMemories = memoryDatabase[currUser.email] || [];
  const today = new Date();
  const todayString = today.toISOString().split("T")[0]; // Get YYYY-MM-DD format

  // Filter memories that are milestones and match today's date (either exact date or same month/day)
  const milestoneMemories = userMemories.filter((memory) => {
    if (!memory.isMilestone) return false;
    const memoryDate = new Date(memory.createdAt);
    const memoryDateString = memoryDate.toISOString().split("T")[0];

    // Check for either exact date match or same month/day
    return (
      memoryDateString === todayString ||
      (memoryDate.getMonth() === today.getMonth() &&
        memoryDate.getDate() === today.getDate())
    );
  });

  if (milestoneMemories.length > 0) {
    // Remove any existing milestone notifications
    const existingNotifications = document.querySelectorAll(
      ".milestone-notification"
    );
    existingNotifications.forEach((notification) => notification.remove());

    // Create a single notification for all milestones
    const notification = document.createElement("div");
    notification.className = "milestone-notification";
    notification.innerHTML = `
      <div class="milestone-notification-content">
        <h3><i class="fas fa-star"></i> Today's Special Memories</h3>
        <div class="milestone-list">
          ${milestoneMemories
            .map((memory) => {
              const yearsAgo =
                today.getFullYear() - new Date(memory.createdAt).getFullYear();
              return `
                <div class="milestone-item">
                  <strong>${memory.title}</strong>
                  <span>${yearsAgo} year${yearsAgo !== 1 ? "s" : ""} ago</span>
                </div>
              `;
            })
            .join("")}
        </div>
        <button onclick="this.parentElement.parentElement.remove()">Close</button>
      </div>
    `;

    // Add styles for the notification
    const style = document.createElement("style");
    style.textContent = `
      .milestone-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideIn 0.5s ease-out;
        width: 300px;
        max-width: 90vw;
      }

      .dark .milestone-notification {
        background: #2d3748;
        color: #e2e8f0;
      }

      .milestone-notification-content {
        padding: 1.5rem;
      }

      .milestone-notification h3 {
        color: #d4a017;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.2rem;
      }

      .dark .milestone-notification h3 {
        color: #f4c542;
      }

      .milestone-list {
        margin-bottom: 1rem;
        max-height: 300px;
        overflow-y: auto;
      }

      .milestone-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        border-bottom: 1px solid #e2e8f0;
      }

      .dark .milestone-item {
        border-bottom-color: #4a5568;
      }

      .milestone-item:last-child {
        border-bottom: none;
      }

      .milestone-notification button {
        width: 100%;
        padding: 0.75rem;
        background: linear-gradient(45deg, #d4a017, #f4c542);
        border: none;
        border-radius: 6px;
        color: white;
        cursor: pointer;
        transition: transform 0.2s ease;
        font-weight: bold;
      }

      .dark .milestone-notification button {
        background: linear-gradient(45deg, #f4c542, #d4a017);
      }

      .milestone-notification button:hover {
        transform: translateY(-2px);
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);
  }
}

// Function to check for milestone reminders - REMOVED
function checkMilestoneReminders() {
  // This function is now empty as we're only using the top notification
  return;
}

// Submit button logic
memoryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  console.log("Form submission started");

  if (!currUser) {
    console.log("No current user found");
    alert("Please wait while we verify your authentication status...");
    return;
  }

  try {
    // Get form elements with null checks
    const titleInput = document.getElementById("title");
    const descriptionInput = document.getElementById("description");
    const tagsInput = document.getElementById("tags");
    const photoInput = document.getElementById("photo");
    const locationInput = document.getElementById("location");
    const voiceInput = document.getElementById("voice");
    const isMilestoneInput = document.getElementById("isMilestone");

    // Check if required elements exist
    if (!titleInput || !descriptionInput || !locationInput) {
      console.error("Required form elements not found");
      alert(
        "Error: Some form elements are missing. Please refresh the page and try again."
      );
      return;
    }

    // Get form values
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const tags = tagsInput ? tagsInput.value.trim() : "";
    const photo = photoInput || { files: [] };
    const location = locationInput.value.trim();
    const voice = voiceInput || { files: [] };
    const isMilestone = isMilestoneInput ? isMilestoneInput.checked : false;

    console.log("Form values:", {
      title,
      description,
      tags,
      location,
      hasPhoto: !!photo.files[0],
      hasVoice: !!voice.files[0],
      isMilestone,
    });

    // Validate required fields
    if (!title) {
      alert("Please enter a title for your memory");
      return;
    }

    if (!description) {
      alert("Please enter a description for your memory");
      return;
    }

    if (!location) {
      alert("Please enter a location for your memory");
      return;
    }

    // Upload files if provided
    let photoUrl = null;
    let voiceUrl = null;
    let mediaType = null;

    if (photo.files && photo.files[0]) {
      const file = photo.files[0];
      const fileType = file.type.split("/")[0]; // Get the file type (image or video)

      if (fileType === "image") {
        console.log("Uploading image...");
        photoUrl = await uploadImage(file);
        mediaType = "image";
        console.log("Image uploaded:", photoUrl);
      } else if (fileType === "video") {
        console.log("Uploading video...");
        photoUrl = await uploadVideo(file);
        mediaType = "video";
        console.log("Video uploaded:", photoUrl);
      }
    }

    if (voice.files && voice.files[0]) {
      console.log("Uploading voice...");
      voiceUrl = await uploadAudio(voice.files[0]);
      console.log("Voice uploaded:", voiceUrl);
    }

    // Create memory entry with milestone flag
    const userEntry = {
      title,
      description,
      tags: tags || "No tags",
      photoUrl,
      mediaType, // Add mediaType to track if it's an image or video
      voiceUrl,
      location,
      createdAt: new Date().toISOString(),
      userId: currUser.uid,
      userEmail: currUser.email,
      isMilestone: isMilestone,
      milestoneDate: isMilestone
        ? new Date().toISOString().split("T")[0]
        : null,
    };

    console.log("Created memory entry:", userEntry);

    // Update localStorage
    const userEmail = currUser.email;
    if (!memoryDatabase[userEmail]) {
      memoryDatabase[userEmail] = [];
    }

    // Add new memory
    memoryDatabase[userEmail].push(userEntry);

    console.log("Updated memory database:", memoryDatabase);
    localStorage.setItem("memoryDatabase", JSON.stringify(memoryDatabase));

    // Reset form and hide modal
    if (memoryForm) {
      memoryForm.reset();
    }
    hideAddMemoryForm();

    // Reload memories
    loadMemories();

    // Check for milestone reminders
    checkMilestoneReminders();

    alert("Memory saved successfully!");
  } catch (error) {
    console.error("Error submitting memory:", error);
    alert("Failed to submit memory. Please try again.");
  }
});

// Function to show random memory
window.showRandomMemory = function () {
  const userMemories = memoryDatabase[currUser.email] || [];

  if (userMemories.length === 0) {
    alert("No memories to display! Add some memories first.");
    return;
  }

  // Select a random memory from the database
  const randomIndex = Math.floor(Math.random() * userMemories.length);
  const selectedMemory = userMemories[randomIndex];

  // Create a container for the reminisce card
  const reminisceContainer = document.createElement("div");
  reminisceContainer.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 400px;
    z-index: 1000;
    animation: fadeIn 0.5s ease-out;
  `;

  // Create the reminisce card
  const reminisceCard = document.createElement("div");
  reminisceCard.className = "memory-card";
  reminisceCard.style.cssText = `
    background: white;
    padding: 1rem;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
    transform: scale(0.95);
    transition: transform 0.3s ease;
  `;

  // Add memory content
  let mediaContent = "";
  if (selectedMemory.photoUrl) {
    if (selectedMemory.mediaType === "video") {
      mediaContent = `
        <video controls style="width: 100%; border-radius: 4px; margin-bottom: 0.5rem;">
          <source src="${selectedMemory.photoUrl}" type="video/mp4">
          Your browser does not support the video tag.
        </video>`;
    } else {
      mediaContent = `<img src="${selectedMemory.photoUrl}" alt="${selectedMemory.title}" style="width: 100%; border-radius: 4px; margin-bottom: 0.5rem;">`;
    }
  }
  if (selectedMemory.voiceUrl) {
    mediaContent += `<audio controls src="${selectedMemory.voiceUrl}" style="width: 100%; margin-bottom: 0.5rem;"></audio>`;
  }

  const milestoneBadge = selectedMemory.isMilestone
    ? '<span class="milestone-badge"><i class="fas fa-star"></i></span>'
    : "";

  reminisceCard.innerHTML = `
    ${mediaContent}
    <h3 style="margin-bottom: 0.5rem; color: #2d3748; font-size: 1.1rem;">
      ${selectedMemory.title || "Untitled"} ${milestoneBadge}
    </h3>
    <p style="color: #4a5568; margin-bottom: 0.5rem; font-size: 0.9rem;">
      ${selectedMemory.description || "No description"}
    </p>
    <p style="color: #718096; font-size: 0.8rem;">Tags: ${
      selectedMemory.tags || "No tags"
    }</p>
    <p style="color: #718096; font-size: 0.8rem;">Location: ${
      selectedMemory.location || "No location"
    }</p>
    <p style="color: #718096; font-size: 0.8rem;">Date: ${new Date(
      selectedMemory.createdAt
    ).toLocaleDateString()}</p>
  `;

  // Add hover effect
  reminisceCard.addEventListener("mouseover", () => {
    reminisceCard.style.transform = "scale(1)";
  });
  reminisceCard.addEventListener("mouseout", () => {
    reminisceCard.style.transform = "scale(0.95)";
  });

  // Add close button
  const closeButton = document.createElement("button");
  closeButton.innerHTML = '<i class="fas fa-times"></i>';
  closeButton.style.cssText = `
    position: absolute;
    top: -15px;
    right: -15px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #e53e3e;
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s ease;
  `;
  closeButton.addEventListener("mouseover", () => {
    closeButton.style.transform = "scale(1.1)";
  });
  closeButton.addEventListener("mouseout", () => {
    closeButton.style.transform = "scale(1)";
  });
  closeButton.addEventListener("click", () => {
    reminisceContainer.remove();
    overlay.remove();
  });

  // Add overlay
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    z-index: 999;
    animation: fadeIn 0.3s ease-out;
  `;

  // Assemble the reminisce view
  reminisceContainer.appendChild(reminisceCard);
  reminisceContainer.appendChild(closeButton);
  document.body.appendChild(overlay);
  document.body.appendChild(reminisceContainer);

  // Add styles for animations
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translate(-50%, -40%);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%);
      }
    }
  `;
  document.head.appendChild(style);

  // Close menu if open
  document.body.classList.remove("menu-active");
  document.querySelector(".hamburger-menu i").classList.add("fa-bars");
  document.querySelector(".hamburger-menu i").classList.remove("fa-times");
};

// Function to show all memories
window.showAllMemories = function () {
  // Clear any existing content
  memoryGrid.innerHTML = "";

  // Get user's memories
  const userMemories = memoryDatabase[currUser.email] || [];

  if (userMemories.length === 0) {
    memoryGrid.innerHTML =
      '<div class="no-memories">No memories yet. Add your first memory!</div>';
    return;
  }

  // Sort memories by date (newest first)
  const sortedMemories = [...userMemories].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Create and append memory cards
  sortedMemories.forEach((memory, index) => {
    const memoryCard = createMemoryCard(memory, index);
    memoryCard.style.display = "block"; // Ensure card is visible
    memoryGrid.appendChild(memoryCard);
  });

  // Reset search input
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.value = "";
  }

  // Close menu if open
  document.body.classList.remove("menu-active");
  document.querySelector(".hamburger-menu i").classList.add("fa-bars");
  document.querySelector(".hamburger-menu i").classList.remove("fa-times");

  // Scroll to top of the page
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Update filterMemories function to work with showAllMemories
function filterMemories() {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) {
    console.error("Search input not found");
    return;
  }

  const searchTerm = searchInput.value.toLowerCase();
  const memoryCards = document.querySelectorAll(".memory-card");

  memoryCards.forEach((card) => {
    try {
      // Get all text content from the card
      const cardText = card.textContent.toLowerCase();

      // Show/hide card based on search term match
      if (cardText.includes(searchTerm)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    } catch (error) {
      console.error("Error filtering memory card:", error);
      // Show the card if there's an error
      card.style.display = "block";
    }
  });
}

// Add event listener for search input with error handling
const searchInput = document.getElementById("search-input");
if (searchInput) {
  searchInput.addEventListener("input", filterMemories);
} else {
  console.error("Search input element not found");
}

// Function to show timeline view
window.showTimeline = function () {
  const userMemories = memoryDatabase[currUser.email] || [];

  if (userMemories.length === 0) {
    alert("No memories to display! Add some memories first.");
    return;
  }

  // Sort memories by date
  const sortedMemories = [...userMemories].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Group memories by month and year
  const groupedMemories = sortedMemories.reduce((groups, memory) => {
    const date = new Date(memory.createdAt);
    const monthYear = date.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(memory);
    return groups;
  }, {});

  // Create timeline container
  const timelineContainer = document.createElement("div");
  timelineContainer.className = "timeline-container";
  timelineContainer.style.cssText = `
    max-width: 1200px;
    margin: 2rem auto;
    padding: 1rem;
    position: relative;
  `;

  // Add timeline line
  const timelineLine = document.createElement("div");
  timelineLine.className = "timeline-line";
  timelineLine.style.cssText = `
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: #d4a017;
  `;
  timelineContainer.appendChild(timelineLine);

  // Create timeline items grouped by month/year
  Object.entries(groupedMemories).forEach(([monthYear, memories]) => {
    // Create month/year header
    const monthHeader = document.createElement("div");
    monthHeader.className = "timeline-month-header";
    monthHeader.style.cssText = `
      margin: 2rem 0 1rem;
      position: relative;
      z-index: 1;
      padding-left: 1rem;
    `;

    const monthLabel = document.createElement("div");
    monthLabel.style.cssText = `
      display: inline-block;
      background: #2d3748;
      color: white;
      padding: 0.5rem 1.5rem;
      border-radius: 20px;
      font-size: 1.1rem;
      font-weight: bold;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    `;
    monthLabel.textContent = monthYear;
    monthHeader.appendChild(monthLabel);
    timelineContainer.appendChild(monthHeader);

    // Create cards container for this month
    const cardsContainer = document.createElement("div");
    cardsContainer.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
      padding-left: 1rem;
      margin-bottom: 1.5rem;
    `;

    // Create memory cards
    memories.forEach((memory) => {
      const content = document.createElement("div");
      content.className = "timeline-content";
      content.style.cssText = `
        background: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        position: relative;
      `;

      // Add memory content
      let mediaContent = "";
      if (memory.photoUrl) {
        if (memory.mediaType === "video") {
          mediaContent = `
            <video controls style="width: 100%; border-radius: 4px; margin-bottom: 0.5rem;">
              <source src="${memory.photoUrl}" type="video/mp4">
              Your browser does not support the video tag.
            </video>`;
        } else {
          mediaContent = `<img src="${memory.photoUrl}" alt="${memory.title}" style="width: 100%; border-radius: 4px; margin-bottom: 0.5rem;">`;
        }
      }
      if (memory.voiceUrl) {
        mediaContent += `<audio controls src="${memory.voiceUrl}" style="width: 100%; margin-bottom: 0.5rem;"></audio>`;
      }

      content.innerHTML = `
        ${mediaContent}
        <h3 style="margin-bottom: 0.5rem; color: #2d3748; font-size: 1.1rem;">${
          memory.title || "Untitled"
        }</h3>
        <p style="color: #4a5568; margin-bottom: 0.5rem; font-size: 0.9rem;">${
          memory.description || "No description"
        }</p>
        <p style="color: #718096; font-size: 0.8rem;">Tags: ${
          memory.tags || "No tags"
        }</p>
        <p style="color: #718096; font-size: 0.8rem;">Location: ${
          memory.location || "No location"
        }</p>
        <p style="color: #718096; font-size: 0.8rem;">Date: ${new Date(
          memory.createdAt
        ).toLocaleDateString()}</p>
      `;

      cardsContainer.appendChild(content);
    });

    timelineContainer.appendChild(cardsContainer);
  });

  // Add styles for animations
  const style = document.createElement("style");
  style.textContent = `
    .timeline-content:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .timeline-month-header {
      animation: fadeInLeft 0.5s ease-out;
    }

    @keyframes fadeInLeft {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @media (max-width: 768px) {
      .timeline-container {
        padding: 0.5rem;
      }

      .timeline-line {
        left: 5px;
      }

      .timeline-month-header {
        padding-left: 0.8rem;
      }

      .cards-container {
        padding-left: 0.8rem;
      }
    }
  `;
  document.head.appendChild(style);

  // Clear existing content and show timeline
  memoryGrid.innerHTML = "";
  memoryGrid.appendChild(timelineContainer);

  // Close menu if open
  document.body.classList.remove("menu-active");
  document.querySelector(".hamburger-menu i").classList.add("fa-bars");
  document.querySelector(".hamburger-menu i").classList.remove("fa-times");
};
