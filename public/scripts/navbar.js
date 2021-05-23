      function myFunction() {
      var x = document.getElementById("myTopnav");
      var y = document.getElementById("active");
      if (x.className === "topnav") {
        x.className += " responsive";
        y.className = "";
      } else {
        x.className = "topnav";
        y.className = "active";
      }
    }
