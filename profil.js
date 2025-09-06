// Fake user data (backend ulanishidan oldin)
let currentUser = {
  name: "Alisher",
  email: "alisher@example.com"
};

const nameEl = document.getElementById("user-name");
const emailEl = document.getElementById("user-email");
const editBtn = document.getElementById("edit-profile");
const editForm = document.getElementById("edit-form");
const profileForm = document.getElementById("profile-form");

// Boshlang‘ich ko‘rsatish
function renderProfile() {
  nameEl.textContent = currentUser.name;
  emailEl.textContent = currentUser.email;
}
renderProfile();

// Tahrirlash formasi ochish
editBtn.addEventListener("click", () => {
  editForm.style.display = "block";
});

// Formani yuborish
profileForm.addEventListener("submit", e => {
  e.preventDefault();
  const newName = document.getElementById("new-name").value;
  const newEmail = document.getElementById("new-email").value;

  currentUser = { name: newName, email: newEmail };
  renderProfile();

  editForm.style.display = "none";
});
