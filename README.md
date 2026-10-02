# FinanceOndrejKrapka

Statický osobní web Ondřeje Křapky publikovaný přes GitHub Pages z větve `main`.

- `index.html` obsahuje aktuální HTML, CSS, JavaScript, šest kalkulaček a kontaktní formulář.
- Fotografie a loga jsou v kořeni repozitáře.
- `styles.css` a `script.js` pocházejí ze starší šablony; aktuální index je nenačítá.
- Formulář připravuje zprávu pomocí `mailto:`. Nemá vlastní odesílací backend.

## Kontrola kalkulaček

Z kořene repozitáře spustit s Node.js:

```sh
node tests/calculators.test.cjs
```

Testy spouštějí skutečné výpočty vytažené z `index.html`, porovnávají známé výsledky, ověřují hraniční hodnoty, validaci a koncové body grafů. Nevyžadují další balíčky. Ovládání posuvníků, scénářů, resetů, klávesnice a mobilního zobrazení se kontroluje také v prohlížeči.

## Předpoklady modelů

- Hypotéka: anuitní splátka, nominální roční sazba dělená 12, sazba po celou dobu neměnná. Mimořádný vklad každý měsíc bez poplatků, poslední splátka omezená zbývajícím dluhem a úrokem. LTV používá zadanou cenu, nikoli samostatný odhad zástavy. Scénáře jsou modelové sazby, nikoli nabídka bank.
- Investice: efektivní měsíční výnos odvozený z ročního, vklad na konci měsíce, růst vkladů po dokončeném roce. Nákladovost se zjednodušeně odečítá od hrubého ročního výnosu v procentních bodech. Reálná hodnota je diskontována inflací.
- Pojištění: pro úmrtí a invaliditu se předpokládá jednorázové splacení dluhů. Běžné výdaje jsou bez jejich splátek. Úspory se odečítají jednou od celkové potřeby každého rizika. Pro pracovní neschopnost se splátky přičítají, protože dluh zůstává. Příjmy a výdaje jsou za domácnost. Skóre a existující krytí se vztahují výhradně k úmrtí. Model nezahrnuje růst výdajů ani výnos rezervy během krytí.
- Penze: měsíční renta na konci měsíce, samostatný výnos před a po odchodu do penze. Požadovaný vklad je v dnešních cenách a v modelu se průběžně navyšuje inflací. Státní důchod je odhad vložený uživatelem. Při odchodu musí být věk vyšší než současný věk.
- Nájem versus hypotéka: shodný počáteční kapitál (akontace + náklady koupě), shodný měsíční rozpočet a investování rozdílu levnější variantou. Nájem roste po letech, hodnota nemovitosti průběžně. Splátky končí po splacení dluhu. Výsledky jsou nominální čistý majetek, bez prodejních nákladů a daní.
- Finanční svoboda: cílová roční renta dělená modelovou mírou čerpání, reálná hodnota portfolia se kontroluje každý měsíc, nejvýše po 100 let. Graf obsahuje i poslední neúplný rok. Míra čerpání není zárukou udržitelnosti příjmu.

Základní pojmy pro údržbu modelů: [LTV – ČNB](https://www.cnb.cz/cs/financni-stabilita/makroobezretnostni-politika/stanoveni-horni-hranice-uverovych-ukazatelu/ltv/index.html), [složené úročení – Investor.gov](https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator). Konkrétní modelové předpoklady webu jsou uvedeny výše; nejde o převzetí výpočtů těchto institucí.
