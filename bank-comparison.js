// Public rate snapshots are deliberately distinguished from individual offers.
(() => {
  let data = window.mortgageBankData;
  const money = value => new Intl.NumberFormat('cs-CZ', {style:'currency',currency:'CZK',maximumFractionDigits:0}).format(value);
  const percent = value => new Intl.NumberFormat('cs-CZ',{minimumFractionDigits:2,maximumFractionDigits:2}).format(value);
  function bankState(bank, input, today) {
    if (!input.valid) return 'invalid';
    if (bank.status==='unavailable'||today >= (bank.expiresOn||data.expiresOn)) return 'expired';
    const loan = input.price - input.own;
    if (loan <= 0) return 'cash';
    if (bank.maxLtv && loan / input.price * 100 > bank.maxLtv + 1e-8) return 'ltv';
    if (bank.minLoanExclusive && loan <= bank.minLoanExclusive) return 'amount';
    return 'ready';
  }
  window.mortgageBankState = bankState;
  const el = (tag, className, text) => {
    const node=document.createElement(tag);node.className=className;
    if(text!==undefined)node.textContent=text;return node;
  };
  let previous='', lastRender;
  window.renderBankComparison = (input, annuity) => {
    lastRender = [input, annuity];
    const root=document.getElementById('bank-cards');if(!root)return;
    const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Prague'}).format(new Date());
    const key=JSON.stringify([input,today]);if(key===previous)return;previous=key;
    root.replaceChildren();
    const expired=data.banks.every(bank=>bank.status==='unavailable'||today>=(bank.expiresOn||data.expiresOn));
    document.getElementById('bank-source-note').textContent=data.automatic?'Automatická kontrola denně kolem 1:00 (Europe/Prague). Zdroj: oficiální stránky bank. Čas posledního ověření je uveden u každé banky.':'Ručně ověřeno: '+data.checkedOn.split('-').reverse().join('. ')+' · Zdroje: oficiální stránky jednotlivých bank.';
    const status=document.getElementById('bank-status');
    status.textContent=!input.valid?'Nejdřív opravte údaje v kalkulačce.':expired?'Sazby čekají na nové ověření. Aktuální možnosti vám zjistím osobně.':input.price<=input.own?'Vlastní prostředky pokrývají cenu nemovitosti; hypotéka není potřeba.':'Model pro úvěr '+money(input.price-input.own)+' na '+input.years+' let. Zveřejněná sazba nemusí být pro vaše parametry dostupná.';
    for(const bank of [...data.banks].sort((a,b)=>a.rate-b.rate)){
      const state=bankState(bank,input,today),ready=state==='ready',bankExpired=bank.status==='unavailable'||today>=(bank.expiresOn||data.expiresOn);
      const card=el('article','bank-card');
      const heading=el('div','bank-heading');
      const logoBox=el('span','bank-logo-box bank-logo-'+bank.id),logo=document.createElement('img');
      logo.src='assets/banks/'+bank.id+'.svg';logo.alt='';logo.width=112;logo.height=40;logo.decoding='async';
      logo.addEventListener('error',()=>{logoBox.replaceChildren(el('span','',bank.mark));});
      logoBox.append(logo);heading.append(logoBox,el('h4','',bank.name));card.append(heading);
      card.append(el('span','bank-rate-label','Zveřejněná sazba od'),el('strong','bank-rate',bankExpired?'Čeká na ověření':percent(bank.rate)+' % p.a.'));
      const details=el('details','bank-details');details.append(el('summary','','Podmínky sazby a zdroj'),el('p','bank-conditions',bank.conditions));
      const verified=bank.checkedAt?new Intl.DateTimeFormat('cs-CZ',{timeZone:'Europe/Prague',dateStyle:'short',timeStyle:'short'}).format(new Date(bank.checkedAt)):(bank.checkedOn||data.checkedOn).split('-').reverse().join('. ');
      card.append(el('p','bank-source-note','Poslední ověření: '+verified+(bankExpired?' · Čeká na nové ověření':'')));
      const payment=el('div','bank-payment');payment.append(el('span','','Modelová měsíční splátka'),el('strong','',ready?money(annuity(input.price-input.own,bank.rate/1200,input.years*12)):'—'));card.append(payment);
      if(state==='ltv'||state==='amount')card.append(el('p','bank-unavailable',state==='ltv'?'Tato sazba je určena pro LTV do '+bank.maxLtv+' %.':'Tato sazba vyžaduje úvěr nad '+money(bank.minLoanExclusive)+'.'));
      const ask=el('a','button button-primary','Poptat možnosti →');
      // Only the bank identifier travels in the link; household amounts stay on this page.
      ask.href='index.html?banka='+encodeURIComponent(bank.id)+'#kontakt';ask.setAttribute('aria-label','Poptat možnosti – '+bank.name);card.append(ask);
      const source=el('a','bank-source','Zdroj a podmínky banky ↗');source.href=bank.source;source.target='_blank';source.rel='noopener noreferrer';details.append(source);card.append(details);root.append(card);
    }
  };
  // Revalidate the daily snapshot even when the bundled script is in browser cache.
  // Parse JSON only: a refresh never executes downloaded JavaScript.
  window.refreshMortgageBankData = async () => {
    try {
      const response = await fetch('bank-rates-data.js', {cache:'no-store'});
      if (!response.ok) return false;
      const source = await response.text();
      const match = source.match(/window\.mortgageBankData\s*=\s*(\{[\s\S]*\})\s*;?\s*$/);
      if (!match) return false;
      const fresh = JSON.parse(match[1]);
      if (!Array.isArray(fresh.banks) || fresh.banks.length !== data.banks.length) return false;
      for (const bank of fresh.banks) {
        const known = data.banks.find(item => item.id === bank.id);
        if (!known || bank.source !== known.source || !Number.isFinite(bank.rate) || bank.rate <= 0 || bank.rate >= 20 ||
            !['verified','unavailable'].includes(bank.status) || !/^\d{4}-\d{2}-\d{2}$/.test(bank.expiresOn) ||
            !Number.isFinite(Date.parse(bank.checkedAt)) || typeof bank.conditions !== 'string' ||
            Date.parse(bank.checkedAt) < Date.parse(known.checkedAt)) return false;
      }
      if (new Set(fresh.banks.map(bank => bank.id)).size !== fresh.banks.length) return false;
      data = fresh;
      window.mortgageBankData = fresh;
      previous = '';
      if (lastRender) window.renderBankComparison(...lastRender);
      return true;
    } catch { return false; } // Keep the bundled snapshot; normal expiry rules still apply.
  };
  if (typeof fetch === 'function') window.refreshMortgageBankData();
})();
