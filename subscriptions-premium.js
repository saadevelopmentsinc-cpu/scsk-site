const pricingObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');pricingObserver.unobserve(entry.target)}}),{threshold:.08});
document.querySelectorAll('.hero-panel,.plan-card,.starter,.info-card,.setup .section-head').forEach(el=>{el.classList.add('pricing-reveal');pricingObserver.observe(el)});

// Keep the pricing hero download choices consistent with the main SCSK homepage.
const heroActions=document.querySelector('.hero .hero-actions');
if(heroActions && !heroActions.querySelector('.store-badge')){
  const windowsButton=[...heroActions.querySelectorAll('a')].find(link=>link.textContent.includes('Windows'));

  const appleLink=document.createElement('a');
  appleLink.className='store-badge store-badge-apple';
  appleLink.href='https://apps.apple.com/au/app/construction-site-manager-scsk/id6758083839';
  appleLink.setAttribute('aria-label','Download SCSK on the App Store');
  appleLink.innerHTML='<img src="app-store-badge.svg" alt="Download on the App Store">';

  const googleLink=document.createElement('a');
  googleLink.className='store-badge store-badge-google';
  googleLink.href='https://play.google.com/store/apps/details?id=com.saa.scsk_app';
  googleLink.setAttribute('aria-label','Get SCSK on Google Play');
  googleLink.innerHTML='<img src="google-play-badge.png" alt="Get it on Google Play">';

  if(windowsButton){
    heroActions.insertBefore(appleLink,windowsButton);
    heroActions.insertBefore(googleLink,windowsButton);
  }else{
    heroActions.append(appleLink,googleLink);
  }
}
