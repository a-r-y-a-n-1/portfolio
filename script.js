/* ================================================================
   PAWFECT PETS – script.js
   
   TABLE OF CONTENTS:
   1.  Shopping Cart (add items, show/hide cart, count badge)
   2.  Navigation (hamburger menu toggle)
   3.  Pet Detail Modal (open/close popup)
   4.  Filter Pets (show/hide cards by type)
   5.  Sort Pets by Price
   6.  Filter Accessories
   7.  Filter Videos (care page)
   8.  Form Validation (contact page)
================================================================ */


/* ----------------------------------------------------------------
   1. SHOPPING CART
   - cartItems is an array (list) storing our cart contents
   - We use localStorage to save the cart between pages
---------------------------------------------------------------- */

// Load existing cart from localStorage (or empty array if none)
// JSON.parse converts text back into a JavaScript array
let cartItems = JSON.parse(localStorage.getItem('pawfectCart')) || [];

// Run this as soon as the page loads
updateCartDisplay();

/**
 * addToCart - adds an item to the shopping cart
 * @param {string} name  - the product name
 * @param {number} price - the price as a number
 */
function addToCart(name, price) {
  // Create a cart item object
  const item = {
    name: name,
    price: parseFloat(price)  // make sure price is a number
  };

  // Push (add) the item to our array
  cartItems.push(item);

  // Save updated cart to localStorage so it persists across pages
  // JSON.stringify converts array to text for storage
  localStorage.setItem('pawfectCart', JSON.stringify(cartItems));

  // Update the counter badge and cart list
  updateCartDisplay();

  // Animate the cart badge to draw attention
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.style.transform = 'scale(1.5)';
    // After 300ms, return to normal size
    setTimeout(() => { badge.style.transform = 'scale(1)'; }, 300);
  }

  // Show a little confirmation message
  showToast(`🛒 ${name} added to cart!`);
}

/**
 * updateCartDisplay - updates badge number and cart item list
 */
function updateCartDisplay() {
  // Update badge number
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = cartItems.length;

  // Update the cart popup list
  const list = document.getElementById('cart-items-list');
  if (!list) return;

  // Clear existing items first
  list.innerHTML = '';

  if (cartItems.length === 0) {
    // Show empty message
    list.innerHTML = '<li style="color:#aaa;text-align:center;padding:16px;">Your cart is empty 🐾</li>';
  } else {
    // Loop through each item and create a <li> element
    cartItems.forEach((item, index) => {
      const li = document.createElement('li');  // create new list item
      li.innerHTML = `
        <span>${item.name}</span>
        <span>
          ₹${item.price.toFixed(2)}
          <button onclick="removeFromCart(${index})"
            style="background:none;border:none;cursor:pointer;color:#ff4d6d;margin-left:6px;font-size:0.9rem;">✕</button>
        </span>
      `;
      list.appendChild(li);  // add to the list
    });
  }

  // Calculate and display total
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);
  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = total.toFixed(2);
}

/**
 * removeFromCart - removes an item at a given index
 * @param {number} index - position in the array
 */
function removeFromCart(index) {
  // splice removes 1 element at position 'index'
  cartItems.splice(index, 1);
  localStorage.setItem('pawfectCart', JSON.stringify(cartItems));
  updateCartDisplay();
}

/**
 * showCart / hideCart - toggle cart popup visibility
 */
function showCart() {
  const popup = document.getElementById('cart-popup');
  if (popup) {
    popup.style.display = 'block';
    updateCartDisplay();
  }
}

function hideCart() {
  const popup = document.getElementById('cart-popup');
  if (popup) popup.style.display = 'none';
}

/**
 * showToast - shows a small notification message at the bottom
 * @param {string} message
 */
function showToast(message) {
  // Remove existing toast if any
  const existing = document.getElementById('toast');
  if (existing) existing.remove();

  // Create toast element
  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.textContent = message;

  // Inline styles for the toast
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#7c5cbb',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '24px',
    fontSize: '0.9rem',
    fontWeight: '600',
    zIndex: '3000',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    animation: 'popIn 0.3s ease'
  });

  document.body.appendChild(toast);

  // Auto-remove after 2 seconds
  setTimeout(() => toast.remove(), 2000);
}


/* ----------------------------------------------------------------
   2. NAVIGATION – Hamburger Menu Toggle
   Toggles the "open" class on the nav-links list
---------------------------------------------------------------- */

/**
 * toggleMenu - shows/hides the mobile navigation menu
 */
function toggleMenu() {
  // querySelector finds first element matching CSS selector
  const navLinks = document.getElementById('nav-links');
  const hamburger = document.getElementById('hamburger');

  if (!navLinks) return;

  // classList.toggle adds the class if absent, removes if present
  navLinks.classList.toggle('open');

  // Change hamburger icon
  hamburger.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
}

// Close menu when clicking outside it
document.addEventListener('click', function(event) {
  const nav = document.getElementById('nav-links');
  const hamburger = document.getElementById('hamburger');

  // If click is not on nav or hamburger, close the menu
  if (nav && hamburger &&
      !nav.contains(event.target) &&
      !hamburger.contains(event.target)) {
    nav.classList.remove('open');
    hamburger.textContent = '☰';
  }
});

// Sticky navbar: change background on scroll
window.addEventListener('scroll', function() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  // If scrolled more than 50px, add scrolled class
  if (window.scrollY > 50) {
    navbar.style.background = 'rgba(255, 255, 255, 0.95)';
  } else {
    navbar.style.background = 'rgba(255, 255, 255, 0.85)';
  }
});


/* ----------------------------------------------------------------
   3. PET DETAIL MODAL (POPUP)
   Opens when a pet card is clicked
   Parameters match the onclick in the HTML
---------------------------------------------------------------- */

// Store current pet info for the "Add to Cart" button in modal
let currentModalPet = { name: '', price: 0 };

/**
 * openPetDetail - fills modal with pet data and shows it
 * All parameters come from the onclick attribute in HTML
 */
function openPetDetail(name, emoji, type, price, size, behaviour,
                       about, personality, care, difficulty) {

  // Save current pet for the cart button
  currentModalPet.name = name;
  // Parse price: remove ₹ sign and convert to number
  currentModalPet.price = parseFloat(price.replace('₹', ''));

  // Fill in the modal HTML elements using their IDs
  // getElementById('modal-emoji') finds <div id="modal-emoji">
  document.getElementById('modal-emoji').textContent = emoji;
  document.getElementById('modal-name').textContent = name;
  document.getElementById('modal-breed-tag').textContent = emoji + ' ' + type.charAt(0).toUpperCase() + type.slice(1);
  document.getElementById('modal-size').textContent = size;
  document.getElementById('modal-behaviour').textContent = behaviour;
  document.getElementById('modal-price').textContent = price;
  document.getElementById('modal-about').textContent = about;
  document.getElementById('modal-personality').textContent = personality;
  document.getElementById('modal-care').textContent = care;
  document.getElementById('modal-difficulty').textContent = difficulty;

  // Update the add-to-cart button in the modal
  const addBtn = document.getElementById('modal-add-btn');
  if (addBtn) {
    addBtn.textContent = `Add ${name} to Cart 🛒`;
    addBtn.onclick = function() {
      addToCart(currentModalPet.name, currentModalPet.price);
    };
  }

  // Show the modal by changing display from 'none' to 'flex'
  const modal = document.getElementById('pet-modal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // prevent background scrolling
  }
}

/**
 * closeModal - hides the modal
 * Can be called by clicking the ✕ button or the dark backdrop
 * @param {Event} event - optional click event (to check if backdrop was clicked)
 */
function closeModal(event) {
  // If called with an event, only close if the overlay itself was clicked
  // (not a click inside the white box)
  if (event && event.target !== event.currentTarget) return;

  const modal = document.getElementById('pet-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // restore scrolling
  }
}

// Close modal when Escape key is pressed
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') closeModal();
});


/* ----------------------------------------------------------------
   4. FILTER PETS (Homepage)
   Shows/hides cards based on their data-type attribute
---------------------------------------------------------------- */

/**
 * filterPets - filters the pet cards grid
 * @param {string} type   - e.g. 'bunny', 'cat', or 'all'
 * @param {HTMLElement} btn - the button that was clicked
 */
function filterPets(type, btn) {
  // Update active button styling
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.remove('active');
  });
  btn.classList.add('active');

  // Get all pet cards
  const cards = document.querySelectorAll('#pets-container .pet-card');

  // Loop through each card
  cards.forEach(card => {
    // data-type attribute value from the HTML
    const cardType = card.getAttribute('data-type');

    if (type === 'all' || cardType === type) {
      // Show: remove hidden class
      card.classList.remove('hidden');
      // Fade in animation
      card.style.animation = 'popIn 0.3s ease';
    } else {
      // Hide: add hidden class (CSS hides it with display:none)
      card.classList.add('hidden');
    }
  });
}


/* ----------------------------------------------------------------
   5. SORT PETS BY PRICE
---------------------------------------------------------------- */

/**
 * sortByPrice - reorders pet cards in the grid
 * @param {string} order - 'low', 'high', or 'default'
 */
function sortByPrice(order) {
  const container = document.getElementById('pets-container');
  if (!container) return;

  // Get all cards as an array (Array.from converts NodeList to Array)
  const cards = Array.from(container.querySelectorAll('.pet-card'));

  // Sort the array based on data-price attribute
  cards.sort((a, b) => {
    const priceA = parseFloat(a.getAttribute('data-price')) || 0;
    const priceB = parseFloat(b.getAttribute('data-price')) || 0;

    if (order === 'low')  return priceA - priceB;   // ascending
    if (order === 'high') return priceB - priceA;   // descending
    return 0;  // default: no change
  });

  // Re-append cards in the new order
  // appendChild moves an existing element to the end
  cards.forEach(card => container.appendChild(card));
}


/* ----------------------------------------------------------------
   6. FILTER ACCESSORIES (Accessories page)
---------------------------------------------------------------- */

/**
 * filterAcc - filters accessory cards
 */
function filterAcc(type, btn) {
  // Update buttons
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Filter cards in accessories container
  const cards = document.querySelectorAll('#acc-container .pet-card');

  cards.forEach(card => {
    const cardType = card.getAttribute('data-type');
    if (type === 'all' || cardType === type) {
      card.classList.remove('hidden');
      card.style.animation = 'popIn 0.3s ease';
    } else {
      card.classList.add('hidden');
    }
  });
}


/* ----------------------------------------------------------------
   7. FILTER VIDEOS (Care Videos page)
---------------------------------------------------------------- */

/**
 * showVideos - filters video cards by pet type
 */
function showVideos(type, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const cards = document.querySelectorAll('#video-container .video-card');

  cards.forEach(card => {
    const cardType = card.getAttribute('data-type');
    // 'all' type videos are always shown
    if (type === 'all' || cardType === type || cardType === 'all') {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}


/* ----------------------------------------------------------------
   8. FORM VALIDATION (Contact page)
   Checks each field before allowing form submission
---------------------------------------------------------------- */

/**
 * validateForm - runs when the form is submitted
 * @param {Event} event - the form submit event
 */
function validateForm(event) {
  // preventDefault stops the page from refreshing (default form behaviour)
  event.preventDefault();

  let isValid = true;  // will be set to false if any error found

  // --- Helper functions ---

  /**
   * showError - marks a field as invalid and shows error message
   * @param {string} fieldId  - the input element's id
   * @param {string} errorId  - the error span's id
   */
  function showError(fieldId, errorId) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    if (field)  field.classList.add('error-field');
    if (error)  error.classList.add('show');
    isValid = false;
  }

  /**
   * clearError - removes error styling from a field
   */
  function clearError(fieldId, errorId) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    if (field)  field.classList.remove('error-field');
    if (error)  error.classList.remove('show');
  }

  // --- VALIDATE NAME ---
  const name = document.getElementById('name');
  if (!name || name.value.trim().length < 2) {
    showError('name', 'name-error');
  } else {
    clearError('name', 'name-error');
  }

  // --- VALIDATE EMAIL ---
  const email = document.getElementById('email');
  // Regular expression to check email format (must have @ and .)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.value.trim())) {
    showError('email', 'email-error');
  } else {
    clearError('email', 'email-error');
  }

  // --- VALIDATE ENQUIRY TYPE (radio buttons) ---
  // querySelectorAll finds all radio buttons named 'enquiry'
  const radios = document.querySelectorAll('input[name="enquiry"]');
  // Array.from converts NodeList, then some() checks if at least one is checked
  const enquirySelected = Array.from(radios).some(r => r.checked);
  if (!enquirySelected) {
    showError(null, 'enquiry-error');
    isValid = false;
  } else {
    document.getElementById('enquiry-error').classList.remove('show');
  }

  // --- VALIDATE PET CHOICE (dropdown) ---
  const petChoice = document.getElementById('pet-choice');
  if (!petChoice || petChoice.value === '') {
    showError('pet-choice', 'pet-error');
  } else {
    clearError('pet-choice', 'pet-error');
  }

  // --- VALIDATE QUANTITY ---
  const qty = document.getElementById('quantity');
  const qtyVal = parseInt(qty ? qty.value : 0);
  if (!qty || isNaN(qtyVal) || qtyVal < 1 || qtyVal > 5) {
    showError('quantity', 'qty-error');
  } else {
    clearError('quantity', 'qty-error');
  }

  // --- VALIDATE CHECKBOX ---
  const agree = document.getElementById('agree');
  if (!agree || !agree.checked) {
    document.getElementById('agree-error').classList.add('show');
    isValid = false;
  } else {
    document.getElementById('agree-error').classList.remove('show');
  }

  // --- IF ALL VALID: show success message ---
  if (isValid) {
    // Hide the form
    document.getElementById('contact-form').style.display = 'none';
    // Show success message
    document.getElementById('success-msg').style.display = 'block';
    // Scroll to the top of the form section
    window.scrollTo({ top: 300, behavior: 'smooth' });
  } else {
    // Scroll to the first error so user can see it
    const firstError = document.querySelector('.error-msg.show');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

/**
 * resetForm - resets form to initial state (after success)
 */
function resetForm() {
  const form = document.getElementById('contact-form');
  const success = document.getElementById('success-msg');

  if (form) {
    form.reset();           // reset all input values
    form.style.display = 'block';  // show form again
  }
  if (success) {
    success.style.display = 'none';
  }
}

/* ----------------------------------------------------------------
   REAL-TIME VALIDATION
   Clear errors as user types (better UX than waiting for submit)
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function() {
  // For each input, clear its error when user starts typing
  const inputs = document.querySelectorAll('input, select, textarea');

  inputs.forEach(input => {
    // 'input' event fires whenever the value changes
    input.addEventListener('input', function() {
      this.classList.remove('error-field');
      // Find the adjacent error message and hide it
      const errorId = this.id + '-error';
      const errorEl = document.getElementById(errorId);
      if (errorEl) errorEl.classList.remove('show');
    });
  });
});
