// Public rate snapshots are deliberately distinguished from individual offers.
(() => {
  const data = window.mortgageBankData;
  const money = value => new Intl.NumberFormat('cs-CZ', {style:'currency',currency:'CZK',maximumFractionDigits:0}).format(value);
  const percent = value => new Intl.NumberFormat('cs-CZ',{minimumFractionDigits:2,maximumFractionDigits:2}).format(value);
  function bankState(bank, input, today) {
    if (!input.valid) return 'invalid';
    if (today >= data.expiresOn) return 'expired';
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
  let previous='';
  window.renderBankComparison = (input, annuity) => {
    const root=document.getElementById('bank-cards');if(!root)return;
    const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Prague'}).format(new Date());
    const key=JSON.stringify([input,today]);if(key===previous)return;previous=key;
    root.replaceChildren();
    const expired=today>=data.expiresOn;
    document.getElementById('bank-source-note').textContent='Ručně ověřeno: '+data.checkedOn.split('-').reverse().join('. ')+' · Zdroje: oficiální stránky jednotlivých bank. Automatická aktualizace není zapnutá.';
    const status=document.getElementById('bank-status');
    status.textContent=!input.valid?'Nejdřív opravte údaje v kalkulačce.':expired?'Sazby čekají na nové ověření. Aktuální možnosti vám zjistím osobně.':input.price<=input.own?'Vlastní prostředky pokrývají cenu nemovitosti; hypotéka není potřeba.':'Model pro úvěr '+money(input.price-input.own)+' na '+input.years+' let. Zveřejněná sazba nemusí být pro vaše parametry dostupná.';
    for(const bank of [...data.banks].sort((a,b)=>a.rate-b.rate)){
      const state=bankState(bank,input,today),ready=state==='ready';
      const card=el('article','bank-card');
      const heading=el('div','bank-heading');heading.append(el('span','bank-mark',bank.mark),el('h4','',bank.name));card.append(heading);
      card.append(el('span','bank-rate-label','Zveřejněná sazba od'),el('strong','bank-rate',expired?'Čeká na ověření':percent(bank.rate)+' % p.a.'));
      card.append(el('p','bank-conditions',bank.conditions));
      const payment=el('div','bank-payment');payment.append(el('span','','Modelová měsíční splátka'),el('strong','',ready?money(annuity(input.price-input.own,bank.rate/1200,input.years*12)):'—'));card.append(payment);
      if(state==='ltv'||state==='amount')card.append(el('p','bank-unavailable',state==='ltv'?'Tato sazba je určena pro LTV do '+bank.maxLtv+' %.':'Tato sazba vyžaduje úvěr nad '+money(bank.minLoanExclusive)+'.'));
      const ask=el('a','button button-primary','Poptat možnosti →');
      // Only the bank identifier travels in the link; household amounts stay on this page.
      ask.href='index.html?banka='+encodeURIComponent(bank.id)+'#kontakt';ask.setAttribute('aria-label','Poptat možnosti – '+bank.name);card.append(ask);
      const source=el('a','bank-source','Zdroj a podmínky banky ↗');source.href=bank.source;source.target='_blank';source.rel='noopener noreferrer';card.append(source);root.append(card);
    }
  };
})();
