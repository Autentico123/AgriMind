/* =========================================================
   AgriMind — single mock dataset for both prototypes.
   One file, one set of values: prototype/ and prototype-v2.1/ both read it.
   Values mirror docs/database-design.md and the documented enums.
   ========================================================= */
(function (root) {
  root.AGRIMIND_DATA = {
  homeSummary: {
    north: { alerts: 2 },
    south: { alerts: 2 }
  },
  weatherContext: {
    north: "Rain 90% today → 85% tomorrow · 29°C · wind 18 km/h",
    south: "Sunny · 15% rain today · 33°C · wind 9 km/h"
  },
  aiCrops: {
    north: ["Rice", "Tomato", "Banana"],
    south: ["Corn", "Onion", "Tomato"]
  },
  aiData: {
    north: {
      Rice: {
        emoji: "🌾", icon: "wheat", health: "ok", healthText: "Healthy", stage: "Vegetative · Day 12", risk: "high", riskText: "High",
        recs: {
          planting:  { text: "Hold off on any new direct seeding while rain is at 90% tomorrow. If replanting empty hills, wait for drier soil to avoid seed washout.", conf: 78, time: "Jul 27 · 7:45 AM", reason: "Rain 90% tomorrow · standing water raises seed decay risk", source: "Direct-seeding and transplanting windows for lowland rice" },
          irrigation: { text: "Malakas ang ulan bukas (90%). Ipahinto ang pagdidilig ngayon at bantayan ang kahalumigmigan ng lupa pagkatapos ng ulan.", conf: 92, time: "Jul 27 · 8:00 AM", reason: "Rain probability 90% (High) · crop at Vegetative stage, drainage-sensitive · no pending nutrient topdressing", source: "Water management through the reproductive stage" },
          fertilizer: { text: "Delay split urea application up to 3 days. Heavy rain tomorrow will leach nitrogen from the root zone; resume once the field drains.", conf: 88, time: "Jul 27 · 7:50 AM", reason: "Split-2 urea window (14–21 DAT) is open · topdressing into 90% rain loses N to leaching", source: "Nitrogen topdressing at the vegetative stage" },
          harvest:   { text: "Harvest window is ~Oct 15. This week's heavy rain may add a few days to maturation — keep the field drained and track the weather-adjusted date.", conf: 61, time: "Jul 27 · 7:55 AM", reason: "Predicted harvest Oct 15 ±3d from rain · early-season weather has limited effect this far out", source: "Pre-harvest field drainage and maturity guidelines" },
          weather:   { text: "Heavy rain tomorrow (90%) — monitor field drainage and be alert for waterlogging on this lowland paddy.", conf: 85, time: "Jul 27 · 8:00 AM", reason: "Rain 90% ≥ 80% threshold · lowland paddy is flood-adjacent", source: "Lowland paddy flood and drainage management" },
          general:   { text: "Inspect canals and field banks after the rain passes, and replace any washed-out bunds before the next irrigation cycle.", conf: 54, time: "Jul 25 · 6:00 AM", reason: "No matching knowledge article on bund maintenance → confidence capped at 60%" }
        },
        harvest: { date: "October 15, 2026", note: "Weather-adjusted · +2 days from rain forecast · ~115 growing days", yield: "Est. 4.2 t/ha", sacks: "≈84 sacks" }
      },
      Tomato: {
        emoji: "🍅", icon: "fruit", health: "warn", healthText: "At Risk", stage: "Flowering · Day 40", risk: "moderate", riskText: "Moderate",
        recs: {
          planting:  { text: "Container-raise replacement seedlings under partial shade to keep them vigorous during the humid stretch.", conf: 66, time: "Jul 20 · 6:15 AM", reason: "Flowering-stage planting not typical — raised beds let you replace weak transplants", source: "Raised-bed seedling establishment in humid weather" },
          irrigation: { text: "High humidity this week (88%). Water early in the morning only, and prune lower leaves to improve airflow.", conf: 84, time: "Jul 26 · 6:30 AM", reason: "Humidity 88% (High) favors fungal disease · Flowering needs steady moisture but dry leaves", source: "Preventing blossom-end rot with steady irrigation" },
          fertilizer: { text: "Side-dress potassium at flowering to hold fruit size, but skip foliar feeds until the humidity eases.", conf: 72, time: "Jul 26 · 7:00 AM", reason: "High humidity slows foliar uptake · K supports fruit set", source: "Potassium side-dressing at the fruiting stage" },
          harvest:   { text: "First pick should come mid-September. Pick at the breaker stage and don't leave ripe fruit on the vine in humid, wet weather.", conf: 63, time: "Jul 27 · 7:30 AM", reason: "Predicted first pick ~Sep 12 · humid ripening shortens shelf life", source: "Breaker-stage harvesting for wet-season tomato" },
          weather:   { text: "High humidity and rain raise late-blight risk — scout daily and keep foliage dry.", conf: 82, time: "Jul 26 · 7:10 AM", reason: "Humidity 88% + rain next 24h favors fungal pressure on open-field tomato", source: "Late-blight prevention under high humidity" },
          general:   { text: "Watch for fungal spots on older leaves. Apply a preventive foliar spray if the rainy pattern continues.", conf: 70, time: "Jul 25 · 6:30 AM", reason: "Knowledge base: tomato blight articles match the current humidity pattern", source: "Preventing blossom-end rot with steady irrigation" }
        },
        harvest: { date: "September 12, 2026", note: "Weather-adjusted · +1 day from humidity · ~90 growing days", yield: "Est. 28 t/ha" }
      },
      Banana: {
        emoji: "🍌", icon: "leaf", health: "ok", healthText: "Healthy", stage: "Mature · Day 200", risk: "low", riskText: "Low",
        recs: {
          planting:  { text: "Don't plant new suckers into waterlogged ground. Choose the higher end of the field or raise the planting mounded.", conf: 57, time: "Jul 27 · 7:20 AM", reason: "No matching planting rule for mature-stage suckers → confidence capped at 60%" },
          irrigation: { text: "Conditions are favorable. Keep the current schedule — no change needed this week.", conf: 88, time: "Jul 26 · 5:45 AM", reason: "Rain 30% (Low) · mature plants tolerate variability · soil moisture normal", source: "Soil moisture management for mature banana" },
          fertilizer: { text: "Skip fertilizer application until the rain eases so nutrients aren't washed away from the root zone.", conf: 74, time: "Jul 27 · 7:35 AM", reason: "Surface-applied nutrients would leach in heavy rain", source: "Nutrient retention during heavy rainfall" },
          harvest:   { text: "Bunches are near maturity. Check the fingers for fullness and plan the harvest window around the weather.", conf: 69, time: "Jul 27 · 7:15 AM", reason: "Predicted harvest ~Sep 2 · wet weather hastens on-plant ripening", source: "Harvesting and de-handing banana bunches" },
          weather:   { text: "Winds around 45 km/h later this week — support fruit-laden stems and inspect planting rows after the gust.", conf: 76, time: "Jul 26 · 6:00 AM", reason: "Wind forecast approaching banana lodging threshold", source: "Propping and wind protection for fruiting banana" },
          general:   { text: "Support bunches that are forming so the plant does not topple in gusty weather.", conf: 55, time: "Jul 25 · 6:15 AM", reason: "No matching general rule for current conditions → confidence capped at 60%" }
        },
        harvest: { date: "September 2, 2026", note: "Weather-adjusted · stable forecast · ~210 growing days", yield: "Est. 14 t/ha" }
      }
    },
    south: {
      Corn: {
        emoji: "🌽", icon: "wheat", health: "warn", healthText: "At Risk", stage: "Vegetative · Day 30", risk: "high", riskText: "High",
        recs: {
          planting:  { text: "Hold off on new plantings until the dry spell breaks. Seeds need steady soil moisture to germinate evenly.", conf: 63, time: "Jul 27 · 7:10 AM", reason: "No rain forecast for 4 days · seed germination needs moisture", source: "Planting density and spacing for hybrid corn" },
          irrigation: { text: "Dry spell ahead — irrigate tomorrow morning (~25 mm) before the heat peaks, and mulch the rows to hold moisture.", conf: 81, time: "Jul 27 · 7:00 AM", reason: "No rain forecast for 4 days · Vegetative corn is water-sensitive · soil moisture at 38%", source: "Dry-spell irrigation scheduling for vegetative corn" },
          fertilizer: { text: "Hold the nitrogen side-dress until the next irrigation event so the fertilizer is activated by water.", conf: 70, time: "Jul 27 · 7:15 AM", reason: "Dry soil caps nitrogen uptake · apply post-irrigation", source: "Nitrogen side-dressing timing for hybrid corn" },
          harvest:   { text: "Target harvest near Nov 2. With a dry forecast ahead, grain fill may advance slightly — watch the moisture ramp.", conf: 60, time: "Jul 27 · 7:05 AM", reason: "Dry conditions can hasten maturity · predicted ~Nov 2", source: "Grain-fill moisture monitoring for corn harvest" },
          weather:   { text: "Heat stress risk rises mid-week. Keep the canopy moist and be ready to irrigate during the peak sun hours.", conf: 79, time: "Jul 26 · 6:45 AM", reason: "Max 33–34°C + no rain · vegetative corn heat-sensitive", source: "Heat-stress mitigation during vegetative growth" },
          general:   { text: "Plan a light side-dress of nitrogen after the next irrigation for stronger stalk growth.", conf: 62, time: "Jul 25 · 6:00 AM", reason: "Knowledge base: corn nutrient timing during the vegetative stage", source: "Planting density and spacing for hybrid corn" }
        },
        harvest: { date: "November 2, 2026", note: "Weather-adjusted · dry forecast · ~100 growing days", yield: "Est. 5.1 t/ha", sacks: "≈102 sacks" }
      },
      Onion: {
        emoji: "🧅", icon: "fruit", health: "warn", healthText: "At Risk", stage: "Vegetative · Day 45", risk: "moderate", riskText: "Moderate",
        recs: {
          planting:  { text: "Hold off on transplanting the next bulb sets until the heat eases. Hot beds dry out and scorch young onion roots.", conf: 66, time: "Jul 26 · 6:20 AM", reason: "33°C and no rain in 4 days · shallow onion roots scorch in hot, dry beds", source: "Bulb-set transplanting in warm, dry beds" },
          irrigation: { text: "Water early morning and keep the bed evenly moist through the hot spell; mulch to slow evaporation.", conf: 78, time: "Jul 26 · 6:00 AM", reason: "Max 33°C · no rain forecast · Vegetative onions need steady but not excess moisture", source: "Mulching and moisture control for vegetative onion" },
          fertilizer: { text: "Skip the nitrogen topdress while the soil is dry — it will not reach the roots. Side-dress after the next watering.", conf: 80, time: "Jul 26 · 6:40 AM", reason: "Dry soil caps nutrient uptake · apply post-irrigation", source: "Post-irrigation nitrogen application for onion" },
          harvest:   { text: "Bulbing is still ~6 weeks out. Keep the foliage healthy through the heat so bulbs size evenly.", conf: 62, time: "Jul 26 · 6:10 AM", reason: "Predicted harvest ~Sep 20 · early weather has limited effect on bulbing", source: "Harvest timing and bulb curing" },
          weather:   { text: "Heat stress is likely mid-week — protect bulbs from sunscald and check soil moisture.", conf: 81, time: "Jul 26 · 5:50 AM", reason: "Max 33–34°C + no rain · shallow-rooted onion is heat-sensitive", source: "Sunscald and heat-stress protection for onion bulbs" },
          general:   { text: "Scout for leaf damage after the weather passes and keep the bed weed-free so onions are not outcompeted.", conf: 58, time: "Jul 25 · 6:00 AM", reason: "No matching knowledge rule for the current conditions → confidence capped at 60%" }
        },
        harvest: { date: "September 20, 2026", note: "Weather-adjusted · hot, dry spell · ~90 growing days", yield: "Est. 12 t/ha", sacks: "≈240 sacks" }
      },
      Tomato: {
        emoji: "🍅", icon: "fruit", health: "ok", healthText: "Healthy", stage: "Flowering · Day 40", risk: "low", riskText: "Low",
        recs: {
          planting:  { text: "Container-raise replacement seedlings under partial shade so they stay vigorous through the hot spell.", conf: 66, time: "Jul 26 · 6:50 AM", reason: "Flowering-stage planting is not typical — raised beds let you replace weak transplants", source: "Raised-bed seedling establishment in humid weather" },
          irrigation: { text: "Water early in the morning only, and prune the lower leaves so the canopy dries quickly in the heat.", conf: 84, time: "Jul 27 · 7:30 AM", reason: "Temperatures reaching 33°C · Flowering needs steady moisture but dry leaves", source: "Preventing blossom-end rot with steady irrigation" },
          fertilizer: { text: "Side-dress potassium at flowering to hold fruit size, and hold back foliar feeds until the humidity eases.", conf: 72, time: "Jul 27 · 7:00 AM", reason: "High humidity slows foliar uptake · K supports fruit set", source: "Potassium side-dressing at the fruiting stage" },
          harvest:   { text: "First pick should come mid-September. Pick at the breaker stage and do not leave ripe fruit on the vine in humid weather.", conf: 63, time: "Jul 26 · 7:20 AM", reason: "Predicted first pick ~Sep 12 · humid ripening shortens shelf life", source: "Breaker-stage harvesting for wet-season tomato" },
          weather:   { text: "Heat and humidity raise late-blight pressure — scout daily and keep the foliage dry.", conf: 82, time: "Jul 26 · 7:10 AM", reason: "Humidity 88% + rain next 24h favors fungal pressure on open-field tomato", source: "Late-blight prevention under high humidity" },
          general:   { text: "Watch for fungal spots on older leaves and stake plants so air moves through the canopy.", conf: 70, time: "Jul 25 · 6:30 AM", reason: "Knowledge base: tomato blight articles match the current humidity pattern", source: "Preventing blossom-end rot with steady irrigation" }
        },
        harvest: { date: "September 12, 2026", note: "Weather-adjusted · +1 day from humidity · ~90 growing days", yield: "Est. 28 t/ha" }
      }
    }
  }
  };
})(typeof window !== "undefined" ? window : globalThis);
