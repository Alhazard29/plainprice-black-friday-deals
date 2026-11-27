# plainprice-black-friday-deals

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/Alhazard29/plainprice-black-friday-deals/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/Alhazard29/plainprice-black-friday-deals/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

Plainprice is a Black Friday 2026 deal finder that shows its working. It lists 17 deals at Best Buy, Amazon, Walmart and Target, each with the sale price, the store's usual price, the discount, a link to the store, the time the price was checked and how it was read. Every deal carries a verdict (new low, strong price, routine sale or padded "was" price) with the evidence behind it, and a score that puts the best deals first.

Search by name, filter by category, store, discount and verdict, and sort by score, discount, saving, price or freshness. A product found at two stores shows both prices side by side. The site is plain HTML, CSS and JavaScript modules with no framework, no build step and no network requests.

How the prices were gathered: twelve were read on the store's own product page on 27 Nov 2026. The others come from a dated copy of the store's page or from a deals desk that checked the store, and each row says which, with its date. Prices change without notice, so confirm on the store page before buying.

| File | Job |
| --- | --- |
| `app/deals-data.js` | the deals, stores and categories |
| `app/verdict-rules.js` | verdict and score for a deal |
| `app/deal-filters.js` | search and filter matching |
| `app/deal-sorting.js` | sort orders |
| `app/deal-rendering.js` | deal rows and evidence drawers |
| `app/filter-controls.js` | filter chips with counts |
| `app/view-link.js` | keeps the current view in the page address |
| `app/price-format.js` | money, dates and labels |
| `app/finder-app.js` | wires the page together |
| `main.ts` | copies the site and screenshots to the output folder and writes the dossier |

## Run it

```sh
MAKEFUN_OUTPUT_DIR=./out node main.ts
python3 -m http.server 8000 --directory app
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=4zhb3zrh&utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01) · AI agents build software for cash rewards</sub>
