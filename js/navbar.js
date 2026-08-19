document.addEventListener('DOMContentLoaded',function(){
  var toggle=document.querySelector('.nav-toggle');
  var menu=document.querySelector('.nav-menu');
  var header=document.querySelector('.site-header');
  if(toggle && menu){
    toggle.addEventListener('click',function(){
      var isOpen=menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    // keyboard handling for accessibility
    toggle.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        toggle.click();
      }
    });
    // close menu with Escape
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && menu.classList.contains('open')){
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
        toggle.focus();
      }
    });
  }
  // scroll shadow
  function onScroll(){
    if(window.scrollY>10) header.classList.add('scrolled'); else header.classList.remove('scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll);
  // reveal on scroll for services
  var revealEls = document.querySelectorAll('.reveal');
  function revealCheck(){
    var top = window.innerHeight * 0.9;
    revealEls.forEach(function(el){
      var r = el.getBoundingClientRect();
      if(r.top < top) el.classList.add('visible');
    });
  }
  revealCheck();
  window.addEventListener('scroll', revealCheck);
});