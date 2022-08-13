



const sendETAlert = (time) =>{
  if (time === 0) {
    return alert('Please enter a time greater than 0');
  } else {
    return console.log(`About ${time} min until your order is ready`);
  }
};

const smsControls = () =>{
  $('.send-time-estimate').each(function(_, element) {
    $(this).on('click', function(event) {
      let time = element.parentNode.children[0].value;
      if (Number(time) === 0) {
        event.preventDefault();
        return alert('Please enter a time greater than 0');
      } else {
        // event.preventDefault();
        alert('Text Sent');
      }
    });
  });
  $('.order-complete').each(function(_, element) {
    $(this).on('click', function(event) {
      console.log('You\'re order is ready. Please come to pick it up.');
    });
  });
};

const addTaxToSubtotal = (subtotal) => {
  const total = Math.floor(subtotal * 1.10).toFixed(2);
  return total;
};

const showTotalWithTax = () => {
  $('.order-total').each(function() {
    const subtotal = Number($(this).text());
    const totalWithTax = addTaxToSubtotal(subtotal);
    $(this).text(totalWithTax);
  }
  );
};

$(document).ready(function() {
  smsControls();
  showTotalWithTax();
});
