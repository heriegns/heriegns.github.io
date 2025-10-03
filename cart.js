// Update cart badge
function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  let count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = count;
}

// Add to cart handler
function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  let existing = cart.find(item => item.name === product.name);
  if (existing) {
    existing.quantity += 1;
  } else {
    product.quantity = 1;
    cart.push(product);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

// Attach event listeners to all Add to Cart buttons
function setupAddToCartButtons() {
  const buttons = document.querySelectorAll('.add-to-cart');
  buttons.forEach(btn => {
    btn.addEventListener('click', function() {
      const product = {
        name: btn.getAttribute('data-name'),
        price: parseFloat(btn.getAttribute('data-price')),
        image: btn.getAttribute('data-image')
      };
      addToCart(product);
    });
  });
}

// For the cart page (display cart, handle checkout, etc.)
function displayCart() {
  if (!document.getElementById("cart-items")) return;
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  let cartItemsDiv = document.getElementById("cart-items");
  let cartSummaryDiv = document.getElementById("cart-summary");
  let cartActionsDiv = document.getElementById("cart-actions");
  cartItemsDiv.innerHTML = "";
  cartSummaryDiv.innerHTML = "";
  cartActionsDiv.innerHTML = "";

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  let total = 0;
  cart.forEach((item, i) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    cartItemsDiv.innerHTML += `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${i}, -1)">-</button>
          ${item.quantity}
          <button class="qty-btn" onclick="changeQty(${i}, 1)">+</button>
        </span>
        <span class="cart-item-price">GHC ${(itemTotal).toFixed(2)}</span>
        <button class="remove-btn" onclick="removeFromCart(${i})">&times;</button>
      </div>`;
  });

  cartSummaryDiv.innerHTML = `<h3>Total: GHC ${total.toFixed(2)}</h3>`;
  cartActionsDiv.innerHTML = `
    <button class="btn btn-primary" onclick="checkoutCart()">Checkout</button>
    <button class="btn btn-secondary" onclick="clearCart()">Clear Cart</button>
  `;
}

// Quantity change for cart page
function changeQty(index, delta) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  displayCart();
}

// Remove from cart
function removeFromCart(index) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  displayCart();
}

// --- Checkout Modal and Payment Options ---

// Checkout (shows a modal with payment options)
function checkoutCart() {
  // Show the payment modal
  const modal = document.getElementById('payment-modal');
  if (modal) {
    modal.style.display = 'flex';
    // Reset modal content
    const modalContent = document.getElementById('payment-modal-content');
    if (modalContent) {
      modalContent.innerHTML = `
        <h2>Select Payment Option</h2>
        <button class="btn btn-primary" onclick="handlePaymentOption('delivery')">Pay on Delivery</button>
        <button class="btn btn-secondary" onclick="handlePaymentOption('online')">Pay Online</button>
      `;
    }
  }
}

// Payment option handlers
function handlePaymentOption(option) {
  const modal = document.getElementById('payment-modal');
  const modalContent = document.getElementById('payment-modal-content');
  if (option === 'delivery') {
    // Show a form to collect customer info
    modalContent.innerHTML = `
      <h2>Pay on Delivery</h2>
      <form id="delivery-form" onsubmit="submitDeliveryOrder(event)">
        <input type="text" id="delivery-name" placeholder="Your Name" required style="width:90%;padding:0.5em;margin-bottom:0.7em;" />
        <input type="text" id="delivery-phone" placeholder="Phone Number" required style="width:90%;padding:0.5em;margin-bottom:0.7em;" />
        <input type="text" id="delivery-address" placeholder="Delivery Address" required style="width:90%;padding:0.5em;margin-bottom:0.7em;" />
        <input type="email" id="delivery-email" placeholder="Email (optional)" style="width:90%;padding:0.5em;margin-bottom:0.7em;" />
        <button class="btn btn-primary" type="submit">Place Order</button>
        <button class="btn btn-secondary" type="button" onclick="closeModalAndClearCart()">Cancel</button>
      </form>
    `;
  } else if (option === 'online') {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    modalContent.innerHTML = `
      <h2>Pay Online</h2>
      <input type="email" id="paystack-email" placeholder="Your Email" style="width:80%;padding:0.5em;margin-bottom:1em;" required />
      <button class="btn btn-primary" onclick="processPaystackPayment()">Proceed to Paystack</button>
      <button class="btn btn-secondary" onclick="closeModalAndClearCart()">Cancel</button>
    `;
  }
}

// Make submitDeliveryOrder globally accessible for dynamically injected form
window.submitDeliveryOrder = function(e) {
  e.preventDefault();
  const name = document.getElementById('delivery-name').value.trim();
  const phone = document.getElementById('delivery-phone').value.trim();
  const address = document.getElementById('delivery-address').value.trim();
  const email = document.getElementById('delivery-email').value.trim();
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Prepare order details for email
  let orderDetails = cart.map(item => 
    `${item.name} (GHC ${item.price} x ${item.quantity})`
  ).join(', ');

  // EmailJS send
  emailjs.send("service_75a4o8s", "template_e516sf3", {
      to_name: "Admin",
      from_name: name,
      customer_phone: phone,
      customer_email: email,
      delivery_address: address,
      order_details: orderDetails,
      order_total: total.toFixed(2)
    })
    .then(function(response) {
      const modalContent = document.getElementById('payment-modal-content');
      modalContent.innerHTML = `
        <h2>Order Received!</h2>
        <p>Thank you, <b>${name}</b>. Your <b>Pay on Delivery</b> order has been placed.</p>
        <p><b>Order Total:</b> GHC ${total.toFixed(2)}</p>
        <p>We will call <b>${phone}</b> and deliver to:<br>${address}</p>
        <p><b>Admin has been notified by email.</b></p>
        <button class="btn btn-primary" onclick="closeModalAndClearCart()">Close</button>
      `;
      clearCart(false);
    }, function(error) {
      alert('Failed to send order email: ' + JSON.stringify(error));
    });
}

// This function is called when "Proceed to Paystack" is clicked
function processPaystackPayment() {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let email = document.getElementById('paystack-email').value.trim();

  if (!email) {
    alert("Please enter your email address.");
    return;
  }

  let paystackPublicKey = "pk_live_9eb277ebe139847b099db86e1ec5ba0ddafe532d"; // your real public key

  let handler = PaystackPop.setup({
    key: paystackPublicKey,
    email: email,
    amount: total * 100, // Amount in pesewas
    currency: "GHS",
    callback: function(response){
      // Payment successful
      const modalContent = document.getElementById('payment-modal-content');
      modalContent.innerHTML = `
        <h2>Payment Successful!</h2>
        <p>Thank you for your payment.<br>Your order reference: <b>${response.reference}</b></p>
        <button class="btn btn-primary" onclick="closeModalAndClearCart()">Close</button>
      `;
      clearCart(false);
    },
    onClose: function(){
      // Payment modal closed by user
    }
  });
  handler.openIframe();
}

function closeModalAndClearCart() {
  const modal = document.getElementById('payment-modal');
  if (modal) modal.style.display = 'none';
  displayCart();
}

// Close modal if user clicks outside content
window.addEventListener('click', function(event) {
  const modal = document.getElementById('payment-modal');
  if (event.target === modal) {
    modal.style.display = 'none';
    displayCart();
  }
});

// Clear cart
function clearCart(refresh = true) {
  localStorage.removeItem("cart");
  updateCartCount();
  if (refresh) displayCart();
}

// Setup everything on page load
document.addEventListener("DOMContentLoaded", function() {
  updateCartCount();
  setupAddToCartButtons();
  displayCart();
});