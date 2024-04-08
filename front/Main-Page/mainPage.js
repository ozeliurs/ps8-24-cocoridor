var btnTab=document.getElementsByClassName('btn')

Array.from(btnTab).forEach(element => {
  var initialElement=element.style;
  element.addEventListener('click', function() {
    element.style.transform="scale(1,1.1)";
    element.style.borderRadius="500px";
    element.style.backgroundColor="yellow";
    element.style.cursor = "url(screamingChicken.png), auto";
    setTimeout(function() {
      element.style=initialElement;
    },350);
  });
});
