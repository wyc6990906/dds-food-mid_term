
(function($) {
  const addTaxToSubtotal = (subtotal) => {
    const total = Math.floor(subtotal * 1.10).toFixed(2);
    return total;
  };

  const showTotalWithTax = () => {
    $('.order-total').each(function() {
      const subtotal = Number($(this).text());
      const totalWithTax = addTaxToSubtotal(subtotal);
      $(this).text(totalWithTax);
    });
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

  $(document).ready(function() {
    showTotalWithTax();

    setTimeout(() => {
      updateCartCounter();
    }, 1200);

  });
})(jQuery);
