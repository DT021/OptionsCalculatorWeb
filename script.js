$(document).ready(function(){
    var ticker;
    $("#submit").click(function(){
      ticker=$("#ticker").val();
      $.post("http://localhost:8181/",{ticker: ticker}, function(data){
        if(data==='done')
          {
            alert("login success");
          }
      });
    });
  });