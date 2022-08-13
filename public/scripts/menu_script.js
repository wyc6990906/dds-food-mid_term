// Script for /menu route
// Will include click event listeners for adding to cart

(function($) {

  // Add cart button event listeners
  $(document).ready(function() {

    const $logout = $('a[href="/logout"]')[0];

    // Only add listeners if user is logged in
    if ($logout) {

      const $addToCartButtons = $('.btn.btn-warning.add-to-cart');
      for (const button of $addToCartButtons) {
        $(button).on('click', addItemToCart);
      }

      updateCartCounter();
      $('#sidebarTrigger').on('click', updateSidebar);
    }
    $('.added-to-cart-notification').hide();

  });

  const updateSidebar = function() {
    let cart = getCartCookie();
    if (cart === '') return;

    const $tbody = $('.sideBarTbody');
    if ($tbody.children().length > 0) {
      $tbody.empty();
    }

    cart = cart.split(',');
    let subtotal = 0;
    for (let item of cart) {
      item = item.split('x');
      const button = $(`button.add-to-cart[value="${item[1]}"]`)[0];
      const name = button.parentElement.parentElement.parentElement.children[0].textContent;
      const price = button.parentElement.parentElement.parentElement.children[1].textContent;
      subtotal += Number(price.split('$')[1]) * Number(item[0]);
      $tbody.append(`
        <tr>
          <td style='vertical-align: middle; text-align: center'>${name}</td>
          <td style='vertical-align: middle;text-align: center'>${price}</td>
          <td style='vertical-align: middle;text-align: center'>
          <input type="number" disabled class="ps-5" value="${item[0]}" min="1" max="100" step="1"/>
          </td>
        </tr>
      `);
    }

    $('.subTotal').text(`$${subtotal.toFixed(2)}`);
    $('.taxed-total').text(`$${(subtotal * 1.1).toFixed(2)}`);

  };

  const addItemToCart = function() {

    const $addedToCartNotification = $(this.parentElement.parentElement.children[1]);
    const $quantity = $(this.parentElement.children[0]);
    $addedToCartNotification.removeClass("cart-error")

    if ($quantity.val() === '' || $quantity.val() === '0') {
      $addedToCartNotification.text('Please enter something in the cart.');
      $addedToCartNotification.addClass("cart-error")
      $addedToCartNotification.slideDown();
      setTimeout(() => $addedToCartNotification.slideUp(), 1000);
      return;
    }

    $addedToCartNotification.text('Added to Cart!');
    $addedToCartNotification.slideDown();
    setTimeout(() => $addedToCartNotification.slideUp(), 1000);

    let cart = getCartCookie().split(',');
    let existsInCart = false;

    for (let i = 0; i < cart.length; i++) {

      let item = cart[i].split('x');

      // If item exists in cart, add to it
      if (item[1] === this.value) {
        item[0] = String(Number(item[0]) + Number($quantity.val()));
        existsInCart = true;
      }

      cart[i] = item.join('x');

    }

    // If item does not exist in cart, add to end of cart
    if (!existsInCart) {
      cart.push(`${$quantity.val()}x${this.value}`);
    }

    // If starting with 0 items in cart, remove leading '' that appears
    if (cart[0] === '') {
      cart.shift();
    }

    setCartCookie(cart.join(','));

    $quantity.val('');
    updateCartCounter();


  };

  const updateCartCounter = function() {
    const $cartCounter = $('#cart-counter-display');
    let cart = getCartCookie().split(',');
    let total = 0;
    for (let val of cart) {
      val = val.split('x');
      total += Number(val[0]);
    }
    $cartCounter.text(total);
  };

  const setCartCookie = function(cart) {
    const expires = `;expires=${new Date((new Date()).valueOf() + 2 * 24 * 60 * 60 * 1000)};`;
    const path = ';path=/';
    let cookie = `cart=${cart}`;
    document.cookie = cookie + expires + path;
  };

  const getCartCookie = function() {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      if (cookie.includes('cart=')) {
        return cookie.split('cart=')[1];
      }
    }
    return '';
  };


})(jQuery);
