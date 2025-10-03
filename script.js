// Wait until the webpage is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // SEARCH/FILTER FUNCTIONALITY
    const searchInput = document.getElementById('search-input');
    const items = document.querySelectorAll('.item');

    // Listen for user typing in the search box
    searchInput.addEventListener('input', function () {
        const query = searchInput.value.toLowerCase();
        items.forEach(item => {
            // Check if the product's title or description contains the search text
            const title = item.querySelector('h2').textContent.toLowerCase();
            const desc = item.querySelector('.description').textContent.toLowerCase();
            if (title.includes(query) || desc.includes(query)) {
                item.style.display = ''; // Show item
            } else {
                item.style.display = 'none'; // Hide item
            }
        });
    });

    // LIGHTBOX FUNCTIONALITY
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');

    // When clicking an image, show it larger in the lightbox
    document.querySelectorAll('.item-img').forEach(img => {
        img.addEventListener('click', function (event) {
            lightboxImg.src = img.src;
            lightbox.classList.remove('hidden');
        });
    });

    // Close lightbox when X is clicked or when clicking outside the image
    lightboxClose.addEventListener('click', function () {
        lightbox.classList.add('hidden');
        lightboxImg.src = '';
    });

    lightbox.addEventListener('click', function (event) {
        if (event.target === lightbox) {
            lightbox.classList.add('hidden');
            lightboxImg.src = '';
        }
    });
});


// ORDER FORM LOGIC
document.addEventListener('DOMContentLoaded', function () {
    const orderForm = document.getElementById('order-form');
    const orderMethod = document.getElementById('order-method');
    const deliveryGroup = document.getElementById('delivery-address-group');
    const successMsg = document.getElementById('order-success');

    if (orderMethod) {
        orderMethod.addEventListener('change', function () {
            if (orderMethod.value === 'delivery') {
                deliveryGroup.style.display = '';
                document.getElementById('order-address').required = true;
            } else {
                deliveryGroup.style.display = 'none';
                document.getElementById('order-address').required = false;
            }
        });
    }

    if (orderForm) {
        orderForm.addEventListener('submit', function (e) {
            e.preventDefault();
            // You can add integration to send the form to email or WhatsApp here
            orderForm.style.display = 'none';
            successMsg.style.display = '';
            orderForm.reset();
        });
    }
});
