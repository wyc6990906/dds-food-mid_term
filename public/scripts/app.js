// Client facing scripts here

(function($) {
//back to top
  const backToTop = function() {
    $('.back-to-top').on('click', function() {
      $('html,body').animate({scrollTop: 0}, 100);
    });
  };
  // hide and show backTop button
  $(document).scroll(function() {
    if ($(this).scrollTop() > 10) {
      $('.back-to-top').show();
    }
    if ($(this).scrollTop() <= 0) {
      $('.back-to-top').hide();
    }
  });

  //cartQuantity
  const minusQuantity = function() {
    $('.minus').each(function(index, element) {
      $(this).on('click', function() {
      // console.log(element.parentNode)
        let quantity = Number(element.parentNode.children[1].value);
        if (quantity === 1) {
          return;
        }
        quantity -= 1;
        element.parentNode.children[1].value = quantity;
        let singlePriceFakeList = $('.single-price').text();
        singlePriceFakeList = singlePriceFakeList.slice(1);
        const singlePriceArray = singlePriceFakeList.split('$');
        const singlePrice = Number(singlePriceArray[index]);
        let totalPriceFakeList = $('.total-price').text();
        totalPriceFakeList = totalPriceFakeList.slice(1);
        const totalPriceArray = singlePriceFakeList.split('$');
        const totalPrice = Number(totalPriceArray[index] * quantity);
        element.parentNode.parentNode.parentNode.nextSibling.nextSibling.innerText = `$${totalPrice.toFixed(2)}`;
        updateTotalPrice();
        addTax();
        updateTopCartNum();
        updateCookieQuantity(this);
      });
    });
  };
  const addQuantity = function() {
    $('.plus').each(function(index, element) {
      $(this).on('click', function() {
      // console.log(element.parentNode)
        let quantity = Number(element.parentNode.children[1].value);
        quantity += 1;
        element.parentNode.children[1].value = quantity;
        let singlePriceFakeList = $('.single-price').text();
        singlePriceFakeList = singlePriceFakeList.slice(1);
        const singlePriceArray = singlePriceFakeList.split('$');
        // console.log(singlePriceArray)  //['9.00', '11.00', '20.00', '30.00', '20.00']
        const singlePrice = Number(singlePriceArray[index]);
        let totalPriceFakeList = $('.total-price').text();
        totalPriceFakeList = totalPriceFakeList.slice(1);
        const totalPriceArray = singlePriceFakeList.split('$');
        const totalPrice = Number(totalPriceArray[index] * quantity);
        element.parentNode.parentNode.parentNode.nextSibling.nextSibling.innerText = `$${totalPrice.toFixed(2)}`;
        updateTotalPrice();
        addTax();
        updateTopCartNum();
        updateCookieQuantity(this);
      });
    });
  };

  //top right totalPrice
  const updateTotalPrice = function() {
    // $('.headerTotal').text((singlePrice * quantity).toFixed(2) + '$')
    let totalPriceFakeList = $('.total-price').text();
    totalPriceFakeList = totalPriceFakeList.slice(1);
    const totalPriceArray = totalPriceFakeList.split('$');
    const totalPriceNum = sum(totalPriceArray);
    $('.headerTotal').text(Number(totalPriceNum).toFixed(2) + '$');
    $('.subTotal').text(Number(totalPriceNum).toFixed(2) + '$');
  };

  // add Tax
  const addTax = function() {
    let subtotal = $('.subTotal').text();
    subtotal = subtotal.substr(0, subtotal.length - 1);
    $('.taxed-total').text((subtotal * 1.1).toFixed(2) + '$');
  };

  //update topCartNum
  const updateTopCartNum = function() {
    let topCartNum = 0;
    $('.qty').each(function() {
      topCartNum += Number($(this).val());
    });
    $('.topCartNum').text(topCartNum);
  };

  // sum helper js
  function sum(arr) {
    return arr.reduce(function(prev, curr) {
      return Number(prev) + Number(curr);
    });
  }

  //delete cartItem
  const deleteCartItem = function() {
    $('.table').on('click', '.fa-xmark', function() {
      $(this).closest('tr').remove();
      updateTotalPrice();
      updateTopCartNum();
      addTax();
      removeItemFromCookie(this);
    });
  };

  //send order
  const sendOrder = function() {
    $('.submit-order').on('click', function(event) {

      const cart = getCartCookie();

      deleteCartCookie(cart);


    });
  };


  // Functions for interacting with cart cookie
  const removeItemFromCookie = function(row) {
    let cart = getCartCookie();
    if (cart === '') return;

    const value = row.children[0].value;
    cart = cart.split(',');
    let updatedCart = [];

    for (let item of cart) {
      item = item.split('x');
      if (item[1] !== value) {
        updatedCart.push(item.join('x'));
      }
    }

    setCartCookie(updatedCart.join(','));
  };

  const updateCookieQuantity = function(row) {
    let cart = getCartCookie();
    if (cart === '') return;

    const value = row.parentElement.parentElement.parentElement.parentElement.children[0].children[0].children[0].children[0].value;
    const newQuantity = row.parentElement.children[1].value;
    cart = cart.split(',');

    for (let i = 0; i < cart.length; i++) {
      let item = cart[i].split('x');
      if (item[1] === value) {
        item[0] = newQuantity;
      }
      cart[i] = item.join('x');
    }

    setCartCookie(cart.join(','));

  };

  const setCartCookie = function(cart) {
    const expires = `;expires=${new Date((new Date()).valueOf() + 2 * 24 * 60 * 60 * 1000)};`;
    const path = ';path=/';
    let cookie = `cart=${cart}`;
    document.cookie = cookie + expires + path;
  };

  const deleteCartCookie = function(cart) {
    const maxAge = `;max-age=1`;
    const path = ';path=/';
    let cookie = `cart=${cart}`;
    document.cookie = cookie + maxAge + path;
  }; //This is one I duped just now

  const getCartCookie = function() {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      if (cookie.includes('cart=')) {
        return cookie.split('cart=')[1];
      }
    }
    return '';
  };

  $(document).ready(function() {
    backToTop();
    addQuantity();
    minusQuantity();
    updateTotalPrice();
    addTax();
    updateTopCartNum();
    deleteCartItem();
    sendOrder();
  });
})(jQuery);
