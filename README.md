# FinanceOndrejKrapka

Statický osobní web Ondřeje Křapky se samostatnou stránkou kalkulaček, publikovaný přes GitHub Pages z větve `main`.

- `index.html` obsahuje hero, představení, profesní cestu, stručný přístup, služby, odkaz na kalkulačky a kontaktní formulář.
- `kalkulacky.html` obsahuje šest kalkulaček a jejich výpočty. Na konkrétní nástroj lze odkazovat pomocí `#mortgage`, `#investment`, `#insurance`, `#pension`, `#rentbuy` nebo `#freedom`.
- `styles.css` a `script.js` sdílejí obě stránky; zajišťují vzhled, navigaci a animace.
- Fotografie a loga jsou v kořeni repozitáře.
- Formulář připravuje zprávu pomocí `mailto:`. Nemá vlastní odesílací backend.

## Kontrola kalkulaček

Z kořene repozitáře spustit s Node.js:

```sh
node tests/calculators.test.cjs
node tests/site-structure.test.cjs
```

Testy spouštějí skutečné výpočty vytažené z `kalkulacky.html`, porovnávají známé výsledky, ověřují hraniční hodnoty, validaci a koncové body grafů. Nevyžadují další balíčky. Ovládání posuvníků, scénářů, resetů, klávesnice a mobilního zobrazení se kontroluje také v prohlížeči.

## Předpoklady modelů

- Hypotéka: anuitní splátka, nominální roční sazba dělená 12, sazba po celou dobu neměnná. Mimořádný vklad každý měsíc bez poplatků, poslední splátka omezená zbývajícím dluhem a úrokem. LTV používá zadanou cenu, nikoli samostatný odhad zástavy. Scénáře jsou modelové sazby, nikoli nabídka bank.
- Investice: efektivní měsíční výnos odvozený z ročního, vklad na konci měsíce, růst vkladů po dokončeném roce. Nákladovost se zjednodušeně odečítá od hrubého ročního výnosu v procentních bodech. Reálná hodnota je diskontována inflací.
- Pojištění: pro úmrtí a invaliditu se předpokládá jednorázové splacení dluhů. Běžné výdaje jsou bez jejich splátek. Úspory se odečítají jednou od celkové potřeby každého rizika. Pro pracovní neschopnost se splátky přičítají, protože dluh zůstává. Příjmy a výdaje jsou za domácnost. Skóre a existující krytí se vztahují výhradně k úmrtí. Model nezahrnuje růst výdajů ani výnos rezervy během krytí.
- Penze: měsíční renta na konci měsíce, samostatný výnos před a po odchodu do penze. Požadovaný vklad je v dnešních cenách a v modelu se průběžně navyšuje inflací. Státní důchod je odhad vložený uživatelem. Při odchodu musí být věk vyšší než současný věk.
- Nájem versus hypotéka: shodný počáteční kapitál (akontace + náklady koupě), shodný měsíční rozpočet a investování rozdílu levnější variantou. Nájem roste po letech, hodnota nemovitosti průběžně. Splátky končí po splacení dluhu. Výsledky jsou nominální čistý majetek, bez prodejních nákladů a daní.
- Finanční svoboda: cílová roční renta dělená modelovou mírou čerpání, reálná hodnota portfolia se kontroluje každý měsíc, nejvýše po 100 let. Graf obsahuje i poslední neúplný rok. Míra čerpání není zárukou udržitelnosti příjmu.

Základní pojmy pro údržbu modelů: [LTV – ČNB](https://www.cnb.cz/cs/financni-stabilita/makroobezretnostni-politika/stanoveni-horni-hranice-uverovych-ukazatelu/ltv/index.html), [složené úročení – Investor.gov](https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator). Konkrétní modelové předpoklady webu jsou uvedeny výše; nejde o převzetí výpočtů těchto institucí.

## Bank rate overview
The mortgage panel uses bank-rates-data.js and bank-comparison.js. Rates are public starting rates, not personalized offers. Official bank sources are checked by scripts/update-bank-rates.cjs. Source-specific parsers reject unexpected markup or changed known conditions; failed banks retain their last verification date and become unavailable. Successful checks expire after three calendar days as a fallback if scheduled runs stop. Each card shows its own Prague verification time.

The Daily mortgage rates workflow runs around 01:00 Europe/Prague. Two UTC schedules and a DST gate select the correct daily run. GitHub can delay scheduled jobs. workflow_dispatch allows a manual retry. The workflow checks sources independently, commits only bank-rates-data.js, and explicitly requests a legacy GitHub Pages build (GITHUB_TOKEN pushes do not trigger it). No personal credentials are stored in the repository. Partial failures publish unavailable states before failing the run for visibility in Actions. No Kurzy.cz feed is used.

Commands: node tests/bank-update.test.cjs; node tests/bank-comparison.test.cjs; node scripts/update-bank-rates.cjs. Parser fixtures are short source excerpts from 2026-10-02. Update parsers and conditions together if bank wording changes; never loosen validation merely to accept unrelated rates. Re-enable scheduled workflows in GitHub Actions if GitHub disables them after prolonged repository inactivity.

## Prepared content preview
Open index.html?nahled=1 to review new draft sections. These sections use hidden by default and are revealed only by content-preview.js. This is a presentation toggle, not access control: do not insert private client information. The public page stays unchanged until copy is approved. Prepared: practice metrics, four-step cooperation, two explicitly unfilled cases, real-photo slot, credentials/team context, FAQ questions and a proposed downloadable guide. No invented testimonials, results, certifications or working download links. Collect real metrics with dates, anonymized cases, publishable photographs, credential sources, actual consultation/pricing arrangements and a finished guide before activating sections.
