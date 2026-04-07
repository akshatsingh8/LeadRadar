<div align="center">
  <img src="./public/icons/icon128.png" alt="LeadRadar Logo" width="128" />
  <h1>LeadRadar Pro</h1>
  <p><strong>A Real-time Google Maps Lead Extraction & Enrichment Engine</strong></p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Version](https://img.shields.io/badge/version-1.0.8--stable-success)]()
  [![Built with React](https://img.shields.io/badge/Built_with-React-61DAFB?logo=react&logoColor=black)]()
  [![Powered by Vite](https://img.shields.io/badge/Powered_by-Vite-646CFF?logo=vite&logoColor=white)]()

</div>

<br/>

## 🎯 What is LeadRadar Pro?

LeadRadar Pro is a powerful Google Chrome Extension that transforms Google Maps into a real-time lead generation machine. By combining intelligent DOM scraping with an AI-driven schema extraction pipeline, it seamlessly captures business names, addresses, ratings, and social contact information.

It features a built-in background enrichment engine that proactively crawls matched business websites to retrieve direct email addresses and phone numbers.

---

## 🚀 Key Features

*   **Real-time Processing**: Leads are mapped, processed, and displayed live directly in the extension dashboard.
*   **Dual-AI Extraction Engine**: Seamlessly switch between Google Gemini (Gemini 3.1 Flash/Pro) and OpenRouter fallback architectures.
*   **Deep Email & Social Scraper**: The background worker recursively crawls business websites to discover hidden contact points (`mailto:`, LinkedIn, Facebook, Instagram, Twitter/X).
*   **Intelligent Serial Fallbacks**: Implements strict API rate-limit controls (12 RPM) to prevent bottlenecks, falling back to a 6-tier model architecture on failure.
*   **Human Simulation Mode**: Autoscrolls and mimics human delays on Google Maps to actively bypass aggressive rate limit constraints and reCAPTCHAs.
*   **Advanced Export**: Format-compliant one-click to CSV export containing 22 enriched data points, formatted automatically with UTF-8 BOM for Excel.

---

## 🛠️ Tech Stack

LeadRadar Pro is built using modern front-end tooling to maximize browser performance and ensure type-safety.

*   **Framework**: [React 19](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Styling**: Vanilla CSS with [TailwindCSS v3](https://tailwindcss.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **AI Engine**: [Google Generative AI APIs](https://aistudio.google.com/) & [OpenRouter APIs](https://openrouter.ai/)
*   **Architecture**: Chrome Manifest V3 (Service Workers, Content Scripts, Storage API)

---

## ⚙️ Installation & Setup

You can load LeadRadar Pro into Chrome directly from the source code.

### 1. Build the Extension
Ensure you have [Node.js](https://nodejs.org/) installed, then run:

```bash
# Clone the repository
git clone https://github.com/akshatsingh8/LeadRadar.git
cd LeadRadar

# Install dependencies
npm install

# Build the production bundle
npm run build
```
This will compile the extension ready for production inside the `dist/` directory.

### 2. Load into Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** using the toggle switch in the top right corner.
3. Click the **Load unpacked** button.
4. Select the `dist/` folder generated in the build step.
5. LeadRadar Pro will appear in your extensions list. Pin it for quick access!

---

## 💡 How to Use

1. **Configure Your Engine:** Open the LeadRadar extension popup. Go to the **Settings** tab and paste your API Key from either Google AI Studio or OpenRouter.
2. **Start a Search:** Open [Google Maps](https://www.google.com/maps) in your browser and search for your target niche (e.g., "Web Designers in London").
3. **Engage the Scraper:** Click the LeadRadar icon to open the side panel or popup, and hit **Start Scraping**.
4. **Watch it Work:** Navigate to the **Monitor** tab to see real-time latency, queue status, and live log updates as the AI engine cleans and parses the DOM.
5. **Enrich & Export:** Switch to the **Data** tab to view the scraped, enriched leads. Hit **Export** to download your finalized CSV.

---

## 📊 Data Points Captured

LeadRadar attempts to capture the following fields when available:
- **Core:** Business Name, Category, Street Address, City, State, Country, ZIP Code.
- **Engagement:** Google Rating, Review Count.
- **Contact:** Primary Phone, Website Scraped Phone, Primary Email, Alternative Email.
- **Web & Socials:** Website URL, LinkedIn, Facebook, Instagram, Twitter/X.

---

## ⚠️ Disclaimer

LeadRadar Pro is intended for educational, research, and legitimate B2B lead generation purposes. Users are expected to comply with local laws and terms of service for Google Maps and target websites, specifically concerning rate limits and automated data extraction.

---

<div align="center">
  <b>Built with ❤️ by Brand Spirit Labs</b>
</div>
