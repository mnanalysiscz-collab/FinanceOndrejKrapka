// Automatically checked public starting rates. See scripts/update-bank-rates.cjs.
window.mortgageBankData = {
  "checkedOn": "2026-10-02",
  "expiresOn": "2026-10-10",
  "banks": [
    {
      "id": "moneta",
      "name": "MONETA Money Bank",
      "mark": "M",
      "rate": 4.99,
      "minLoanExclusive": 1000000,
      "maxLtv": 80,
      "conditions": "Fixace 3 roky, LTV do 80 %, úvěr nad 1 milion Kč. Schválení závisí na posouzení bankou.",
      "source": "https://www.moneta.cz/hypoteky/hypoteka",
      "checkedOn": "2026-10-07",
      "checkedAt": "2026-10-07T02:11:16.039Z",
      "expiresOn": "2026-10-10",
      "status": "verified",
      "lastAttemptAt": "2026-10-07T02:11:16.039Z"
    },
    {
      "id": "csas",
      "name": "Česká spořitelna",
      "mark": "ČS",
      "rate": 5.39,
      "conditions": "Veřejně uváděná sazba „od“. Konkrétní fixaci, LTV a podmínky zvýhodnění je nutné ověřit individuálně.",
      "source": "https://www.csas.cz/cs/osobni-finance/hypoteky/hypoteka",
      "checkedOn": "2026-10-07",
      "checkedAt": "2026-10-07T02:11:16.039Z",
      "expiresOn": "2026-10-10",
      "status": "verified",
      "lastAttemptAt": "2026-10-07T02:11:16.039Z"
    },
    {
      "id": "kb",
      "name": "Komerční banka",
      "mark": "KB",
      "rate": 5.49,
      "conditions": "Sazba „od“ při příjmu na účet KB, rizikovém životním pojištění a pojištění nemovitosti u Komerční pojišťovny a PENB A/B. Konkrétní fixaci a LTV ověříme.",
      "source": "https://www.kb.cz/cs/obcane/pujcky/hypoteky/hypoteka",
      "checkedOn": "2026-10-07",
      "checkedAt": "2026-10-07T02:11:16.039Z",
      "expiresOn": "2026-10-10",
      "status": "verified",
      "lastAttemptAt": "2026-10-07T02:11:16.039Z"
    }
  ],
  "automatic": true
};
