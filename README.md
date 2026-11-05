# 🇮🇳 Seller Content Pack - E-Commerce AI Copywriter

Seller Content Pack is a production-grade web application built for Indian online sellers on Meesho, Amazon, Flipkart, Instagram, and WhatsApp. It takes product details and generates 7 ready-to-use selling content formats in under a minute:
1. Two high-converting Product Title options (SEO + Benefit-led)
2. Compelling Product Description
3. 5 structured Marketplace Bullet Points
4. Instagram Caption + 10 trending hashtags
5. Performance Ad Copy (Headline, Primary Text, Call To Action)
6. 15-second viral Reel Script (Hook, 3 Scenes, CTA)
7. WhatsApp Broadcast Offer Message

---

## 🔑 Environment Variables (Netlify Dashboard)

In your Netlify Dashboard, navigate to **Site configuration > Environment variables** and add the following keys:

| Variable Name | Required? | Default / Example Value | Description |
|---|---|---|---|
| `ZAP_KEY` | **Yes** | `your_live_zapupi_key` | Aapka ZapUPI dashboard ka live merchant API key. Bas ye daalte hi payment gateway chal jayega! |
| `AI_API_KEY` | **Yes** | `key_experimental_...` | Aapka AI provider ka secret API key (Velona, OpenAI, OpenRouter, ya Groq). |
| `AI_BASE_URL` | Optional | `https://velona.in/v1` | OpenAI-compatible endpoint URL (Default: Velona). |
| `AI_MODEL` | Optional | `deepseek/deepseek-v4-flash` | The AI model used for parallel copy generation. |
| `TOKEN_SECRET` | **Yes** | Random 32+ character string (e.g. `scp_token_secret_998877665544332211`) | Free tier quota ko securely hash aur track karne ke liye secret string. |
| `SITE_URL` | **Yes** | `https://your-site.netlify.app` | Aapki published Netlify site ka URL (ZapUPI callbacks & webhooks ke liye). |
| `ALLOW_TEST_PAYMENTS`| Optional | `false` | Production ke liye `false` rakhein. |

---

## 🔄 Future Mein AI Model / Provider Kaise Change Karein?

Aapko code mein ek line bhi change karne ki zaroorat nahi hai! Netlify ke Environment variables mein bas ye 3 cheezein change karke save karein:

### Example 1: Agar OpenRouter use karna ho
- `AI_BASE_URL`: `https://openrouter.ai/api/v1`
- `AI_MODEL`: `deepseek/deepseek-chat` ya `google/gemini-2.5-flash`
- `AI_API_KEY`: Aapka OpenRouter API key

### Example 2: Agar Official OpenAI use karna ho
- `AI_BASE_URL`: `https://api.openai.com/v1`
- `AI_MODEL`: `gpt-4o-mini`
- `AI_API_KEY`: Aapka OpenAI API key (`sk-...`)

### Example 3: Agar Groq (Super Fast) use karna ho
- `AI_BASE_URL`: `https://api.groq.com/openai/v1`
- `AI_MODEL`: `llama-3.3-70b-versatile`
- `AI_API_KEY`: Aapka Groq API key

---

## 🚀 Netlify Deployment Steps

1. **GitHub Par Push Karein**:
   AI Studio se code ko apne GitHub repository mein commit aur push karein.
   ```bash
   git add .
   git commit -m "Deploy Seller Content Pack with 1 free try and ZapUPI"
   git push origin main
   ```

2. **Netlify Par Site Import Karein**:
   - [app.netlify.com](https://app.netlify.com) par jayein aur **Add new site > Import an existing project** click karein.
   - Apna GitHub repository select karein.
   - `netlify.toml` automatically build command (`npm run build`), publish directory (`dist`), aur Netlify functions (`netlify/functions`) configure kar dega.

3. **Environment Variables Add Karein**:
   - Netlify mein **Site configuration > Environment variables** kholein.
   - Upar di gayi table se saari keys (`ZAP_KEY`, `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`, `TOKEN_SECRET`, `SITE_URL`) add karein.
   - **Deploy site** par click karein. Aapka payment system aur AI tool live ho jayega!

---

## 🧪 Testing Checklist (Including ₹1 Test)

### 1. Free Trial Test (1 Try per Device)
1. Live site kholein.
2. Product details enter karein aur **Poora 7-in-1 Content Pack Banao** par click karein.
3. 1st time poora content pack ready hoga aur quota 0 ho jayega.
4. Dobara generate karne par *"Aapka 1 free try khatam ho chuka hai! Starter ya Pro plan lein"* alert aayega.

### 2. ₹1 Live Payment Test (ZapUPI Live Test)
1. `netlify/lib/config.js` mein Starter plan ka price test ke liye temporarily `1` kar dein:
   ```js
   starter: {
     price: 1, // Change to 1 for live testing
   }
   ```
2. Deploy karein aur site par jakar Starter plan (₹1) select karein.
3. ZapUPI se PhonePe, GPay ya Paytm se ₹1 pay karein.
4. Payment hone par `/payment-result` screen par aapki Access Key deliver ho jayegi aur 100 generations activate ho jayengi.
5. Test verify hone ke baad `netlify/lib/config.js` mein price wapas `299` kar dein!
