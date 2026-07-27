const pricingObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');pricingObserver.unobserve(entry.target)}}),{threshold:.08});
document.querySelectorAll('.hero-panel,.plan-card,.starter,.info-card,.setup .section-head').forEach(el=>{el.classList.add('pricing-reveal');pricingObserver.observe(el)});
