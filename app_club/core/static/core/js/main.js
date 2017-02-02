// Django requires these next functions to securely perform ajax calls
function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
          var cookie = jQuery.trim(cookies[i]);
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}

var csrftoken = getCookie('csrftoken');
function csrfSafeMethod(method) {
  // these HTTP methods do not require CSRF protection
  return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
  beforeSend: function(xhr, settings) {
    if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
      xhr.setRequestHeader("X-CSRFToken", csrftoken);
    }
  }
});

var attemptLogin = function() {
  $("#loginModal").modal('open');
}

$(function() {
  $(".button-collapse").sideNav();

  $(".modal").modal();

  $("#registerNowBtn").on("click", function(e) {
    $("#loginModal").modal("close");
    $("#registerModal").modal("open");
  });

  $(".startLogin").on('click', function(e) {
    e.preventDefault();
    attemptLogin();
  });

  $(".startLogout").on('click', function(e) {
    e.preventDefault();
    $.ajax({
      url: "/users/logout/",
      method: "POST",
      data: {},
      success: function(result) {
        Materialize.toast("Logged Out Successfully", 8000);
        location.reload();
      },
      error: function(xhr, err, errmsg) {
        Materialize.toast(errmsg, 8000);
      },
    });
  });

  // Handle Register form
  $("#registerBtn").on('click', function(e) {
    e.preventDefault();

    $.ajax({
      url: "/users/signup-ajax/",
      method: "POST",
      data: $("#registerForm").serialize(),
      success: function(result) {
        if (result.errors) {
          console.log(result.errors.__all__[0]);
          $("#registerModal input").addClass("invalid");
          Materialize.toast("Could not register.", 8000);
        } else {
          $.getJSON("/users/registered-success/", function(result) {
            if (result.success) {
              Materialize.toast("Registered and Logged in successfully!", 8000);
              location.reload();
            } else {
              console.log(err, errmsg);
              Materialize.toast(errmsg, 8000);
              console.log("NO EMAIL SENT :(");
              //location.reload();
            }
          });
        }
      },
      error: function(xhr, err, errmsg) {
        console.log(errmsg);
      }
    })
  });

  // Handle login form
  $("#loginBtn").on('click', function(e) {
    e.preventDefault();

    $.ajax({
      url: "/users/login-ajax/",
      method: "POST",
      data: $("#loginForm").serialize(),
      success: function(result) {
        if (result.errors) {
          console.log(result.errors.__all__);
          $("#loginModal input").addClass("invalid");
          Materialize.toast("Failed to log in.", 8000);
        } else {
          Materialize.toast("Logged in successfully!", 8000);
          location.reload();
        }
      },
      error: function(xhr, err, errmsg) {
        console.log(errmsg);
      }
    })
  });

  $(".startRegister").on("click", function(e) {
    $("#registerModal").modal('open');
  });

  $(".startLogin").on("click", function(e) {
    $("#loginModal").modal('open');
  });
});

/**
 * Stripe/Payment Functions
 */
$(function() {
  var paymentAmount = 0;
  var description = "Bidbyte Charge";

  var handler = StripeCheckout.configure({
    key: 'pk_test_0Iq1Rbhxtph0wes82HnRsCco',
    image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
    name: "Bidbyte",
    description: 'Enter payment information to continue',
    amount: paymentAmount,
    locale: 'auto',
    zipCode: true,
    billingAddress: true,
    allowRememberMe: false, 
    token: function(token) {
      // Save this token to the current user
      console.log(token);
      console.log("Attempting to save token to this user");
      $.ajax({
        url: "/users/save-token/",
        method: "POST",
        data: {
          token: token.id
        },
        success: function(result) {
          // Saved token to user
          onReceiveToken(result.customerToken);
        },
        error: function(xhr, err, errmsg) {
          console.log(errmsg);
          Materialize.toast("Could not create payment at this time", 8000);
        }
      });
    }
  });
  
  $("#payButton").on('click', function(e) {
    // Open Checkout with further options:
    var finalPaymentAmount = parseFloat($("#finalTotal").text());
    makePayment(finalPaymentAmount);
    e.preventDefault();
  });
  
  // Close Checkout on page navigation:
  window.addEventListener('popstate', function() {
    handler.close();
  });

  var onReceiveToken = function(customerToken) {
    // We are now sure that we have the correct customer token
    // to make the payment.
    console.log("Attempting to Charge customer token: ", customerToken);
    $.ajax({
      url: "/users/charge/",
      method: "POST",
      data: {
        amount: paymentAmount * 100,
        description: description
      },
      success: function(result) {
        console.log(result);
        if (result.error) {
          Materialize.toast(result.error, 8000);
        } else {
          Materialize.toast("Payment Processed Successfully!", 8000);
          setTimeout(function() {
            window.location = "../";
          }, 6000);
        }
      }
    });
  };
  
  var makePayment = function(amount, text) {
    paymentAmount = amount;
    if (text !== undefined) {
      description = text;
    }

    $.ajax({
      url: "/users/get-token-ajax/",
      method: "POST",
      data: {},
      success: function(response) {
        console.log(response);
        if (response.error) {
          // No token exists for this user yet.
          getStripeToken();
        } else {
          onReceiveToken(response.success);
        }
      },
      error: function(xhr, err, errmsg) {
        console.log(errmsg);
        Materialize.toast("Could not create payment at this time", 8000);
      }
    });
  }
  
  var getStripeToken = function(paymentAmount) {
    handler.open({
      amount: paymentAmount
    }); 
  }
});
