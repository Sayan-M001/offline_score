(function () {
  "use strict";

  // Make sure the gravity forms web api is enabled in your settings
  var app = {
    url: "https://new.compaksa.co.za/wp-json/gf/v2/forms/9/submissions",
    sendLater: false,
  };

  app.init = function () {
    console.log("App started");

    /*
     * attach event listener for when we go from offline back to online
     * http://github.hubspot.com/offline/
     */
    Offline.on("up", app.reconnected);
  };

  app.submitForm = function (e) {
    e.preventDefault();

    var form = document.getElementById("sb_form");

    var data = {};

    // loop over form inputs and put them into the right data format
    for (var i = 0; i < form.elements.length; i++) {
      if (form.elements[i].className === "gf-input" && form.elements[i].id) {
        if (
          form.elements[i].getAttribute("type") == "radio" &&
          form.elements[i].checked
        ) {
          data[form.elements[i].name] = form.elements[i].value;
        } else {
          data[form.elements[i].name] = form.elements[i].value;
        }
      }
    }

    console.log("Form Data:", JSON.stringify(data));

    // if we are offline, save the form to send later
    if (Offline.state === "down") {
      app.sendLater = true;
      window.localStorage.setItem("gf_form", JSON.stringify(data));
      alert("You are offline, but this form will send when you reconnect.");
    } else {
      // online, just send the form
      app.sendData(data).then(app.gfResponse);
    }
  };

  // send our data to the server. Returns a promise.
  app.sendData = function (data) {
    return new Promise(function (resolve, reject) {
      var req = new XMLHttpRequest();
      req.open("POST", app.url);
      req.setRequestHeader("Content-Type", "application/json"); // Added this line for proper JSON submission

      req.onload = function () {
        if (req.readyState === req.DONE) {
          if (req.status === 200) {
            console.log(req.response);
            resolve(req.responseText);
          } else {
            reject(req.statusText);
          }
        }
      };

      req.onerror = function () {
        reject(req.statusText);
      };

      req.send(JSON.stringify(data));
    });

    app.sendLater = false;
  };

  // handle the response from the GF API
  app.gfResponse = function (response) {
    var a = JSON.parse(response);

    if (a.validation_messages) {
      document.getElementById("gf-message").innerHTML = JSON.stringify(
        a.validation_messages,
      );
    } else if (a.confirmation_message) {
      document.getElementById("gf-message").innerHTML = a.confirmation_message;
    }

    setTimeout(function () {
      document.getElementById("gf-message").innerHTML = "";
    }, 7000);
  };

  /*
   * Event listener called when we go from offline back to online
   * http://github.hubspot.com/offline/
   */
  app.reconnected = function () {
    console.log("app.reconnected");

    // send the form we stored offline
    if (app.sendLater === true) {
      var data = JSON.parse(window.localStorage.getItem("gf_form"));

      app.sendData(data).then(app.gfResponse);
    }
  };

  window.sbOffline = app;

  app.init();
})();
