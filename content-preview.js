// Draft copy is public in the source, but excluded from the normal page presentation.
(() => {
 if(new URLSearchParams(location.search).get('nahled')!=='1')return;
 document.body.classList.add('content-preview');
 document.querySelectorAll('.content-draft,#draft-banner').forEach(section=>section.hidden=false);
})();
