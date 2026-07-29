# Aaron's Section

In the dashboard:
- New page for Menu
- Change stock availability
- Eventually support:
    - price changes
    - adding or removing menu items
    - section adjustments
- On main orders page, preview badge with X items are out of stock

Stock availability is boolean-based. DB supported already
Manually configure it. No auto-adjustments per day

Sections on Dashboard:
- Orders
- Settings
- Menu

Tab-based sections (full pages)

New Netlify function refactor:
- Add `dashboard/menu` => stock availability, can be format best for UI on the dashboard
- Update existing to `website/menu` => just prices, formatted by section

Menu page on Dashboard should show:
- Section X
  - Item
    - Variant => In stock or Out of Stock selection
Ignore Tips
No need to show prices for now
No need to show add ons or sizes

# Claude's Section