/* ============================================================
   CyberSheep — Interactions
   ============================================================ */

document.addEventListener('DOMContentLoaded',()=>{

  /* Email copy */
  const el=document.getElementById('emailLink');
  if(el){
    el.addEventListener('click',e=>{
      e.preventDefault();
      const email='cybersheep33@gmail.com';
      navigator.clipboard?.writeText(email).then(()=>{
        el.textContent='✅ 已复制!';
        setTimeout(()=>{el.textContent=email},2000);
      }).catch(()=>{window.location.href='mailto:'+email});
    });
  }

  /* Entrance — staggered panels */
  document.querySelectorAll('.panel,.models-bar,.brand-card,.quick-btn').forEach((el,i)=>{
    el.style.opacity='0';
    el.style.transform='translateY(8px)';
    el.style.transition='opacity .5s ease,transform .5s ease';
    setTimeout(()=>{el.style.opacity='1';el.style.transform='translateY(0)'},70*(i+1));
  });

});
