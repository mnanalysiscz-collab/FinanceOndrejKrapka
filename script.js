// Shared navigation, header and reveal behavior for both pages.
(() => {

    const header=document.querySelector('.site-header'),menuButton=document.querySelector('.menu-toggle'),navigation=document.querySelector('.main-nav'),navLinks=document.querySelectorAll('.main-nav a');
    const updateHeader=()=>header.classList.toggle('scrolled',document.body.classList.contains('calculator-page')||window.scrollY>30);updateHeader();window.addEventListener('scroll',updateHeader,{passive:true});
    const setMenuOpen=open=>{navigation.classList.toggle('open',open);menuButton.classList.toggle('active',open);menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Zavřít menu':'Otevřít menu');document.body.classList.toggle('menu-open',open)};
    menuButton.addEventListener('click',()=>setMenuOpen(!navigation.classList.contains('open')));
    navLinks.forEach(link=>link.addEventListener('click',()=>setMenuOpen(false)));
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&navigation.classList.contains('open')){setMenuOpen(false);menuButton.focus()}});
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));document.getElementById('year').textContent=new Date().getFullYear();



    // Preserve links to calculator results shared before the page split.
    const redirectOldResult=()=>{if(!document.body.classList.contains('calculator-page')&&/^#result-(mortgage|investment|insurance|pension|rentbuy|freedom)$/.test(location.hash))location.replace('kalkulacky.html'+location.hash)};
    redirectOldResult();
    window.addEventListener('hashchange',redirectOldResult);

})();
