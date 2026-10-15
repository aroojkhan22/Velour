VELOUR — 3D Perfume Boutique

RUN ON YOUR LAPTOP
1. Extract the ZIP (right-click > Extract All on Windows).
2. Open the VELOUR folder.
3. Double-click index.html to open the website in Chrome or Edge.
   Keep all the files together. No npm installation or database is needed.

ALTERNATIVE: VS CODE
Open the VELOUR folder in VS Code and open index.html using Live Server.
If Python is installed, you can also run: python -m http.server 8000
Then open http://localhost:8000 in your browser.

FEATURES
- Automatic 3D storefront fly-in and opening doors; no start click required.
- Rectangular VELOUR bottles matching the collection's caps, labels and colors.
- Perfume spray animation, fragrance filters and scent quiz.
- Local shopping bag, size selection and a complete demo checkout form.
- Customer/address form, delivery options, cash-on-delivery demo selection,
  order number and confirmation summary. No payment is taken or order sent.
- Pause, skip and replay controls. Reduced-motion visitors go straight inside.

FILES
index.html: page structure
style.css: styling and responsive layouts
app.js: products, quiz and cart
checkout.js: checkout form validation, delivery totals and order confirmation
boutique.js: WebGL boutique, bottles, doors and automatic camera animation
spray.js: perfume mist animation

NOTES
This is a frontend concept project. There are no real payments or orders.
The shopping bag is stored in the current browser when storage is available.
Use a browser with WebGL/hardware acceleration for the 3D boutique.
You can upload these same files to a static website host; index.html is the entry point.
