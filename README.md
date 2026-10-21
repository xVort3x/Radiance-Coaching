# Radiance Coaching

Website for **Radiance Coaching** by Anne Kibet, PCC Certified Coach.
*Healing, wholeness and hope.*

Built with React, Tailwind CSS 4, Framer Motion and Lucide React.

## What is in it

- A one-page site: hero, the three services (Life Coaching, Grief and End-of-Life Coaching, Betrayal Trauma Coaching), a free discovery call for people who are not sure what they need, approach, about Anne, how coaching works, FAQ and contact.
- An animated booking window with its own calendar and time slots (East Africa Time, with the visitor's local time shown beside each slot).
- A payment step with animated **M-Pesa**, **PayPal** and **Visa / Mastercard** options.
- A confirmation screen with an "Add to my calendar" file (.ics).
- Keyboard-friendly, screen-reader labelled, respects reduced-motion settings, works on phones.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs to dist/
npm run preview
```

Needs Node 20.19 or newer.

`npm run dev` always runs payments in **preview mode** so you can click through every payment option. Nothing is charged or sent in preview mode.

## Edit your content

| What | Where |
| --- | --- |
| Name, email, tagline, photo, services, session lengths and the session price | `src/config/site.js` |
| Working days and hours, notice period, days off | `src/config/site.js` (`AVAILABILITY`) |
| Headline, service descriptions, FAQ, process steps | `src/config/content.js` |
| Real client testimonials (section stays hidden until you add some) | `src/config/content.js` (`TESTIMONIALS`) |
| Colours and fonts | `src/index.css` (`@theme`) |

Anne's photo is `public/anne.jpg` (replace the file to change it). The two credential badges are in `public/badges/` and listed in `CREDENTIALS` in `src/config/site.js`.

The 5-session package is set by `PACKAGE` in `src/config/site.js` (`sessions: 5`, `discountPerSessionKes: 250`). With the default KSh 5,000 session that is KSh 4,750 each, KSh 23,750 in total. The client picks the first session when booking and Anne arranges the other sessions by email. Prices appear only at checkout.

## Publish on GitHub Pages

1. Create a GitHub repository and push this folder to the `main` branch.
2. In the repository go to **Settings, Pages** and set **Source** to **GitHub Actions**.
3. The included workflow (`.github/workflows/deploy.yml`) builds and publishes the site on every push.

## Turn on real bookings and payments

Everything below is optional and is set with environment variables (see `.env.example`). Locally, copy it to `.env`. On GitHub, add them under **Settings, Secrets and variables, Actions, Variables**. These values become public once the site is built, so **never put secret keys in them**.

Until you set something up, that payment method shows as "Not set up" on the live site. If no method is set up, visitors can still request a time and pay by email.

### Receiving booking requests and messages

Bookings and contact messages are sent from the page itself, with no email app involved. Out of the box they go through [FormSubmit](https://formsubmit.co), a free form-to-email service, to `info.radiancecoaching@gmail.com`.

**One-time setup:** FormSubmit needs the inbox owner to confirm the address. After the site is live, send yourself a test message from the contact form, then open the email FormSubmit sends to `info.radiancecoaching@gmail.com` and click its confirmation link (check spam too). Until that is done, messages do not arrive and visitors see a "did not send" message with Anne's email as a fallback. FormSubmit's confirmation email also gives you a private random address; if you like, set `VITE_FORM_ENDPOINT=https://formsubmit.co/ajax/<that random address>` so Anne's email is not part of the endpoint.

To use another service (for example Formspree), set `VITE_FORM_ENDPOINT` to its URL. It must accept a JSON POST.

### Bookings and confirmation emails (the booking helper)

The helper is a small free program in `backend/Code.gs` that runs in Anne's Google account. Once it is set up:

- The calendar hides times that are already booked, so nobody can double-book.
- A time is held for 15 minutes while a client pays.
- Each client gets a confirmation email with the date, time, video link, what to expect and a calendar invite. Anne gets a notification email too.
- Every booking is saved in a Google Sheet ("Radiance Coaching bookings") in Anne's Drive.
- The contact form also sends through it, so FormSubmit is no longer needed.

**Setup (about 15 minutes), signed in as info.radiancecoaching@gmail.com:**

1. Go to **script.google.com** and click **New project**. Name it "Radiance bookings".
2. Delete the sample code, then open `backend/Code.gs` from this project in any text editor, copy everything and paste it in. Click the save icon.
3. Near the top, replace `PASTE YOUR GOOGLE MEET OR ZOOM LINK HERE` with Anne's meeting link (keep the quotes). If Anne has a WhatsApp number, also fill in `WHATSAPP` (digits only, for example `254712345678`).
4. In the left menu choose **Project settings** (the gear) and tick **Show "appsscript.json" manifest file in editor**. Open `appsscript.json` and make sure `"timeZone"` is `"Africa/Nairobi"`.
5. Back in the editor, pick **setup** in the function list at the top and click **Run**. Google asks for permission: choose the account, click **Advanced**, then **Go to Radiance bookings (unsafe)**, then **Allow**. This is normal for your own scripts. Anne should receive a test email with a link to the bookings sheet.
6. Click **Deploy, New deployment**, choose the type **Web app**. Set **Execute as: Me** and **Who has access: Anyone**. Click **Deploy** and copy the **Web app URL** (it ends in `/exec`).
7. In the GitHub repository, add a variable `VITE_BOOKING_API_URL` with that URL, then re-run the deploy (**Actions, Deploy to GitHub Pages, Run workflow**).

**Changing the script later:** after editing the code, click **Deploy, Manage deployments**, the pencil icon, **Version: New version**, **Deploy**. The address stays the same.

**Running the sheet:**

- *Cancel a booking:* change its **Status** to `cancelled` and that time becomes free again.
- *Block days off or holidays:* open the **Blocked** tab and add a row with a start and an end date and time.
- Statuses: `confirmed`, `hold` (waiting for payment, expires after 15 minutes), `needs-new-time` (a client paid but someone else booked that time first, so Anne should contact them), `released` and `expired` (ignore these).
- Hours and the meeting link live at the top of `Code.gs`. If you change Anne's hours, change `src/config/site.js` too so the website and the helper agree.

**Limits:** Gmail lets a free account send about 100 emails a day, which is plenty for a coaching practice. Anne's M-Pesa and PayPal payments are still checked by hand.

### WhatsApp

Set `VITE_WHATSAPP_NUMBER` to Anne's number (for example `0712 345 678`). A WhatsApp button then appears on the site, in the contact section and in the footer. Leave it blank to hide them.

### M-Pesa

Pick one:

- **Manual (no server).** Set `VITE_MPESA_TILL` or `VITE_MPESA_PAYBILL`. Visitors pay to the number, then enter the M-Pesa confirmation code. Anne checks each code against her M-Pesa statement before confirming.
- **Automatic phone prompt (needs a small server).** Set `VITE_API_BASE_URL` to a backend you host that calls Safaricom's Daraja API (this cannot be done safely from a website alone, because it needs secret keys). The site expects:
  - `POST {API}/mpesa/stk-push` with `{ phone: "2547XXXXXXXX", amount: 5000, reference }`, returning `{ checkoutRequestId }`
  - `GET {API}/mpesa/status/:checkoutRequestId`, returning `{ status: "pending" | "paid" | "failed", receipt?, message? }`

### PayPal

Create a PayPal app at developer.paypal.com and set `VITE_PAYPAL_CLIENT_ID` to its public **client ID**. PayPal does not support Kenyan Shillings, so the site charges the US dollar equivalent. Set `VITE_KES_PER_USD` and update it when the rate moves.

PayPal payments are captured in the visitor's browser and are not verified by a server. Check each one in your PayPal account before the session.

### Visa / Mastercard

Card details are never typed into this site. Sign up with a provider that supports Kenya (for example Pesapal, Flutterwave or DPO) and either:

- set `VITE_CARD_CHECKOUT_URL` to a payment link, or
- set `VITE_CARD_CHECKOUT_VIA_API=true` and implement `POST {API}/card/checkout` with `{ amount, reference, email, name }`, returning `{ url }`.

The visitor pays on the provider's page and comes back to confirm. Anne confirms the payment in the provider's dashboard.

### Previewing payments on a live site

Add `?demo=payments` to the page address (or set `VITE_DEMO_PAYMENTS=true`) to click through the simulated payment flow. Preview mode shows a clear notice, never moves money and never sends a booking to Anne. Leave it off on the public site so no visitor believes they have paid when they have not.

## Things to know

- **Shared availability needs the booking helper.** Without `VITE_BOOKING_API_URL` the calendar shows Anne's weekly hours but cannot see bookings already made, so two people could request the same slot. With the helper set up (see above), taken times are hidden and held while someone pays.
- **Payments confirm differently by method.** M-Pesa with a backend is confirmed automatically. M-Pesa manual, card and PayPal are confirmed by Anne.
- **Fonts** (Newsreader and Figtree) load from Google Fonts. To host them yourself, install `@fontsource-variable/newsreader` and `@fontsource-variable/figtree` and import them in `src/main.jsx`.
- **Privacy policy and terms** are in `src/config/legal.js` and open at `#/privacy` and `#/terms`. They are plain-language drafts, not legal advice. Anne should read them, adjust anything that does not match how she works (for example the 24 hours' notice for changing a session), and consider checking with a lawyer. As a collector of personal data she may also need to register with Kenya's Office of the Data Protection Commissioner (odpc.go.ke).
- Prices are never shown in the page content. The session price (`SESSION_PRICE_KES` in `src/config/site.js`) appears only at checkout, after a service and time are chosen.

## Project structure

```
backend/        booking helper (Google Apps Script), see the README section above
src/
  config/       site details, content, payment modes, environment
  lib/          dates (East Africa Time), validation, calendar file, dialog behaviour
  services/     booking delivery and payment calls
  booking/      booking window state
  components/
    sections/   page sections
    booking/    calendar, time slots, details, confirmation, payments/
    layout/     header, footer
    legal/      privacy policy and terms page
    ui/         button, container, notice
    art/        logo and illustrations
```
