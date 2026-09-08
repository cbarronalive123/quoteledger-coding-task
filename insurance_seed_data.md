# Insurance Seed Data (Coding Task Reference)

Draft catalog for the Django + React CRUD app.  
**Requirements still come only from `coding_task.md`.** This file is domain seed data.

Suggested model:

| Field | Meaning |
|---|---|
| `name` | Company / brand / program |
| `group` | Insurance line of business |
| `created_at` / `updated_at` | When the catalog entry was added / last updated |

**Uniqueness rule:** the same company may appear in more than one group (e.g. Aviva in Auto and Home), but not twice in the same group.

---

## 1. Group choices (`group` field)

Use these as the allowed group values (more than two; task only requires at least two):

| Group code | Display name | What it covers |
|---|---|---|
| `auto` | Auto | Personal-use private passenger auto |
| `home` | Home | Homeowners / tenants / condo property |
| `life` | Life | Life insurance |
| `commercial` | Commercial | Business / commercial lines |
| `specialty` | Specialty / HNW | High-net-worth, specialty, niche programs |
| `nonstandard_auto` | Non-standard Auto | Higher-risk / non-standard personal auto |
| `collector` | Collector | Collector / classic vehicle programs |
| `travel` | Travel | Travel medical / trip coverage |
| `disability` | Disability | Disability / living benefits |
| `residual` | Residual Market | Market of last resort (hard-to-place auto) |

Minimum viable set if you want fewer: **Auto, Home, Life, Commercial, Specialty**.

---

## 2. Company catalog (real companies)

Sources prioritized from the Ontario All-Quote hackathon brief (rate-approval seed, channel map, FSRA/CADRI pointers), then filled with well-known Canadian market roles.  
**Verify before production use** — panels, legal names, and product availability change.

### Legend

- **Role:** Carrier (writes risk), Brand (consumer face), Broker/Aggregator (distributes), Mutual, Residual, MGA/Program
- **Channels:** Direct, Agent, Broker, Aggregator, Affinity, Mutual, Residual, Program
- **Groups:** which `group` values this name can seed into

---

### A. Personal auto & multi-line P&C (from Ontario seed + public routes)

| # | Name | Role | Main channels | Typical groups | Notes (what they really do) |
|---|---|---|---|---|---|
| 1 | Allstate | Carrier / brand | Direct, Exclusive agent | Auto, Home | Personal auto + property; Canada direct/agent path |
| 2 | Esurance | Brand (Allstate group) | Direct / digital | Auto | Digital personal auto brand in Allstate group (validate current ON retail status) |
| 3 | Pafco | Carrier (Allstate group) | Broker | Auto, Non-standard Auto | Broker-placed; often non-standard / specialty auto |
| 4 | Pembridge | Carrier (Allstate group) | Broker | Auto, Home | Broker personal lines |
| 5 | Aviva | Carrier / group | Direct, Broker, Program | Auto, Home, Commercial, Specialty | Major P&C writer; multiple legal entities/routes |
| 6 | Aviva Direct | Brand | Direct | Auto, Home | Consumer direct quote path under Aviva |
| 7 | belairdirect | Brand (Intact group) | Direct | Auto, Home | Direct digital personal lines |
| 8 | Intact | Carrier / group | Broker, Direct (via brands) | Auto, Home, Commercial | Canada’s largest P&C group; broker + brand routes |
| 9 | Jevco | Carrier (Intact group) | Broker | Auto, Non-standard Auto | Broker; non-standard / specialty auto common |
| 10 | Novex | Carrier (Intact group) | Broker / affinity-style | Auto, Home | Intact-group personal lines entity (validate route) |
| 11 | Unifund | Carrier (Intact group) | Affinity / broker | Auto, Home | Often affinity / group programs |
| 12 | Sonnet | Brand (Definity group) | Direct | Auto, Home | Fully digital direct personal lines |
| 13 | Definity | Carrier / group | Broker | Auto, Home | Parent/group behind Sonnet + broker brands |
| 14 | Economical | Carrier (Definity heritage) | Broker | Auto, Home | Broker personal lines (map current legal entity) |
| 15 | Co-operators | Carrier / brand | Direct, Agent | Auto, Home, Life, Commercial | Multi-line co-operative insurer |
| 16 | CUMIS | Carrier (Co-op group) | Affinity / credit union | Auto, Home, Life | Credit-union / affinity oriented |
| 17 | Desjardins | Brand / group | Direct, Agent | Auto, Home, Life | Personal lines + life/wealth via group companies |
| 18 | The Personal | Brand (Desjardins group) | Affinity | Auto, Home | Group / employer / association affinity auto+home |
| 19 | Certas Direct | Carrier brand (Desjardins) | Direct | Auto, Home | Desjardins-group direct personal lines entity |
| 20 | TD Insurance | Brand | Direct, Phone, Affinity | Auto, Home | Bank-branded personal P&C |
| 21 | Security National | Carrier (TD group) | Direct / affinity | Auto, Home | Legal underwriter in TD Insurance structure |
| 22 | Primmum | Carrier (TD group) | Direct / affinity | Auto, Home | TD-group underwriting entity |
| 23 | RBC Insurance | Brand | Direct / partner | Auto, Home, Life | Bank-branded insurance; auto often via partners/underwriters |
| 24 | CAA Insurance | Carrier / brand | Direct, Broker | Auto, Home, Travel | Club-affiliated personal lines + travel products |
| 25 | Echelon | Carrier (CAA group) | Broker | Auto, Non-standard Auto | Broker non-standard / specialty auto |
| 26 | Wawanesa | Carrier (mutual) | Broker | Auto, Home | Mutual P&C; broker distribution for personal lines |
| 27 | Travelers | Carrier | Broker | Auto, Home, Commercial | Broker P&C including personal + commercial |
| 28 | Gore Mutual | Carrier (mutual) | Broker | Auto, Home, Commercial | Ontario mutual; broker/agent placement |
| 29 | SGI CANADA | Carrier / brand | Broker | Auto, Home | Broker personal lines outside SK public model |
| 30 | Coachman | Carrier (SGI group) | Broker | Auto, Non-standard Auto | Non-standard auto via brokers |
| 31 | Square One | Brand | Direct | Auto, Home | Direct digital personal lines (ON car path noted in brief) |
| 32 | Beneva / Unica | Carrier | Broker | Auto, Home | Unica (Beneva) broker personal lines |
| 33 | Optimum | Carrier | Broker | Auto, Home, Commercial | Broker P&C |
| 34 | Northbridge | Carrier / group | Broker | Commercial, Auto | Strong commercial; some personal specialty via group |
| 35 | Zenith | Carrier (Northbridge group) | Broker | Auto | Broker auto (named on aggregator panels in brief) |
| 36 | Portage Mutual | Carrier (mutual) | Broker | Auto, Home | Mutual personal lines via broker |
| 37 | Heartland Farm Mutual | Carrier (mutual) | Mutual / local agent | Auto, Home, Commercial | Farm/mutual local distribution |
| 38 | Peel Mutual | Carrier (mutual) | Mutual / local agent | Auto, Home | Local mutual |
| 39 | Commonwell Mutual | Carrier (mutual) | Mutual / broker-agent | Auto, Home | Ontario mutual group |
| 40 | Facility Association | Residual mechanism | Residual (via broker/agent) | Residual, Auto | Not a normal retail brand; last-resort auto market |

### B. Specialty / HNW / program markets

| # | Name | Role | Main channels | Typical groups | Notes |
|---|---|---|---|---|---|
| 41 | Chubb | Carrier | Broker (appointed) | Specialty, Home, Auto | High-net-worth / specialty personal lines |
| 42 | PURE | Carrier | Broker (appointed) | Specialty, Home, Auto | Membership HNW personal insurance |
| 43 | AIG | Carrier | Broker | Specialty, Commercial | Specialty/commercial; validate PPA relevance per risk |
| 44 | Liberty Mutual | Carrier | Broker | Specialty, Commercial | Specialty/commercial broker market |
| 45 | Hartford | Carrier | Broker | Specialty, Commercial | Specialty/commercial; validate personal-auto relevance |
| 46 | Zurich | Carrier | Direct brand / broker | Auto, Home, Specialty, Commercial | Group path includes Square One consumer brand |
| 47 | Hagerty | MGA / program | Program / broker | Collector, Auto | Collector cars; program administered separately; Aviva underwriting noted in brief |
| 48 | Burns & Wilcox | MGA | Broker / wholesale | Specialty, Commercial | Wholesale specialty intermediary (discovery lead in brief) |
| 49 | APRIL Canada | MGA / program | Broker / program | Specialty, Travel | Program/specialty administrator (verify product fit) |
| 50 | Special Risk | MGA | Broker / wholesale | Specialty | Specialty wholesale (discovery lead) |

### C. Brokers & aggregators (distribute; usually do not “write” the risk)

| # | Name | Role | Main channels | Typical groups | Notes |
|---|---|---|---|---|---|
| 51 | Rates.ca | Aggregator | Aggregator | Auto, Home | Comparison / lead platform; panel ≠ full market |
| 52 | LowestRates.ca | Aggregator | Aggregator | Auto, Home | Online comparison; named ON auto panel in brief |
| 53 | Surex | Brokerage | Broker, Callback | Auto, Home | Licensed brokerage; published carrier/MGA disclosure |
| 54 | ThinkInsure | Brokerage | Broker | Auto, Home | Broad independent brokerage |
| 55 | Onlia | Digital brokerage | Broker / digital | Auto, Home | Digital broker; returned underwriter may differ from brand |
| 56 | Scoop Insurance | Digital brokerage | Broker / callback | Auto, Home | Digital brokerage + callback workflows |
| 57 | PC Insurance | Branded digital brokerage | Broker / digital | Auto, Home | Banner brand; capture actual underwriter on quote |
| 58 | InsuranceHotline | Lead / broker network | Aggregator / lead | Auto, Home | Lead/network route, not the underwriter |

### D. Life & living benefits (real Canadian life writers)

These are outside the hackathon auto seed, but valid if `Life` / `Disability` are group choices:

| # | Name | Role | Main channels | Typical groups | Notes |
|---|---|---|---|---|---|
| 59 | Manulife | Carrier | Direct, Advisor | Life, Disability, Travel | Major life / living benefits / bankassurance |
| 60 | Sun Life | Carrier | Advisor, Workplace | Life, Disability | Life, health, group benefits |
| 61 | Canada Life | Carrier | Advisor, Workplace | Life, Disability | Life + group benefits |
| 62 | iA Financial Group | Carrier | Advisor | Life, Disability | Industrial Alliance — life & wealth |
| 63 | Empire Life | Carrier | Advisor | Life, Disability | Life & living benefits |
| 64 | Equitable | Carrier | Advisor | Life, Disability | Life insurance / living benefits |
| 65 | Foresters Financial | Carrier | Advisor / member | Life | Fraternal / member life products |
| 66 | Wawanesa Life | Carrier | Advisor / partner | Life | Life arm related to Wawanesa group |
| 67 | Co-operators Life | Carrier | Agent / advisor | Life, Disability | Life company within Co-operators |

---

## 3. Suggested app seed rows (`name` + `group`)

Use these as starter `Item` rows. Same company in multiple groups is intentional.

### Auto
- Allstate  
- Aviva Direct  
- belairdirect  
- Sonnet  
- Co-operators  
- The Personal  
- TD Insurance  
- CAA Insurance  
- Wawanesa  
- Travelers  
- Gore Mutual  
- Square One  
- Intact  
- Economical  
- Desjardins  
- RBC Insurance  
- Zenith  
- Pembridge  
- Surex *(broker route entry)*  
- Rates.ca *(aggregator route entry)*  

### Home
- Allstate  
- Aviva Direct  
- belairdirect  
- Sonnet  
- Co-operators  
- The Personal  
- TD Insurance  
- CAA Insurance  
- Wawanesa  
- Travelers  
- Gore Mutual  
- Square One  
- Intact  
- Economical  
- Chubb  
- PURE  

### Life
- Manulife  
- Sun Life  
- Canada Life  
- iA Financial Group  
- Empire Life  
- Equitable  
- Co-operators Life  
- Desjardins  
- RBC Insurance  
- Foresters Financial  

### Commercial
- Intact  
- Aviva  
- Northbridge  
- Travelers  
- Co-operators  
- Gore Mutual  
- AIG  
- Liberty Mutual  

### Specialty
- Chubb  
- PURE  
- AIG  
- Hagerty  
- Burns & Wilcox  
- Aviva  

### Non-standard Auto
- Pafco  
- Jevco  
- Echelon  
- Coachman  

### Collector
- Hagerty  

### Travel
- CAA Insurance  
- Manulife  
- APRIL Canada  

### Disability
- Manulife  
- Sun Life  
- Canada Life  
- iA Financial Group  
- Empire Life  
- Co-operators Life  

### Residual
- Facility Association  

**Approx. seed size if you insert all rows above:** well over 30 unique company names, and 80+ `(name, group)` item rows.

---

## 4. Recommended Django choices snippet

```python
class ItemGroup(models.TextChoices):
    AUTO = "auto", "Auto"
    HOME = "home", "Home"
    LIFE = "life", "Life"
    COMMERCIAL = "commercial", "Commercial"
    SPECIALTY = "specialty", "Specialty / HNW"
    NONSTANDARD_AUTO = "nonstandard_auto", "Non-standard Auto"
    COLLECTOR = "collector", "Collector"
    TRAVEL = "travel", "Travel"
    DISABILITY = "disability", "Disability"
    RESIDUAL = "residual", "Residual Market"
```

Unique constraint: `UniqueConstraint(fields=["name", "group"], name="uniq_item_name_per_group")`

---

## 5. Where to re-verify online (from hackathon brief)

| Need | Source |
|---|---|
| Legal auto underwriters / rate filings | Ontario private-passenger auto rate approvals dataset |
| Licensed insurers | FSRA — Licensed insurance companies in Ontario |
| Direct-writer landscape | CADRI member list |
| Broker panels | Surex compensation disclosure; Rates.ca; LowestRates.ca |
| Mutuals | Ontario Mutuals locator |
| Residual auto | Facility Association (via licensed intermediary) |
| Life companies | Individual carrier product sites / provincial life licensing records |

---

## 6. Practical recommendation for the coding task

1. Ship **many group choices** (table in section 1).  
2. Seed **30+ real companies** from sections 2–3.  
3. Keep **one `items` table** (`id`, `name`, `group`, `created_at`, `updated_at`).  
4. Do **not** invent a fake “Carrier” group peer to Direct/Broker — company role is described in this catalog; `group` stays line-of-business.  
5. Optional UI filter chips: Auto / Home / Life / Commercial / Specialty / etc.

This stays faithful to `coding_task.md` while using real Ontario/Canada insurance entities and products.
