const legalHeader=document.querySelector('header');
addEventListener('scroll',()=>legalHeader?.classList.toggle('scrolled',scrollY>20),{passive:true});
const legalObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');legalObserver.unobserve(entry.target)}}),{threshold:.08});
document.querySelectorAll('.card,.contact-card,.faq-item,.resource-card,.tips-card,.response-banner').forEach(el=>{el.classList.add('legal-reveal');legalObserver.observe(el)});
