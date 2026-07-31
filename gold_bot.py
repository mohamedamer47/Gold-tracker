import json
import os
from datetime import datetime, timezone

import requests

TELEGRAM_TOKEN = os.environ.get("TELEGRAM_TOKEN")
TELEGRAM_CHAT_ID = os.environ.get("CHAT_ID")

GOLD_API_URL = "https://api.gold-api.com/price/{symbol}"
FX_API_URL = "https://open.er-api.com/v6/latest/USD"

GRAMS_PER_OUNCE = 31.1035
# فرق سعر السوق المحلي المصري (تكلفة صياغة/جمارك) فوق السعر المحسوب بنكيًا
LOCAL_EGYPT_PREMIUM_EGP = 170

GOLD_OZ_ALERT_USD = 4000
UAE_24_ALERT_AED = 475

STATE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "state.json")


def get_metal_prices():
    try:
        gold_resp = requests.get(GOLD_API_URL.format(symbol="XAU"), timeout=10)
        silver_resp = requests.get(GOLD_API_URL.format(symbol="XAG"), timeout=10)
        if gold_resp.status_code == 200 and silver_resp.status_code == 200:
            return {
                "gold_usd_oz": gold_resp.json().get("price"),
                "silver_usd_oz": silver_resp.json().get("price"),
            }
    except requests.RequestException:
        pass
    return None


def get_exchange_rates():
    try:
        resp = requests.get(FX_API_URL, timeout=10)
        if resp.status_code == 200:
            rates = resp.json().get("rates", {})
            usd_egp, usd_aed, usd_sar = rates.get("EGP"), rates.get("AED"), rates.get("SAR")
            if usd_egp and usd_aed and usd_sar:
                return {"usd_egp": usd_egp, "usd_aed": usd_aed, "usd_sar": usd_sar}
    except requests.RequestException:
        pass
    return None


def compute_prices(metals, fx):
    gold_usd_oz = metals["gold_usd_oz"]
    silver_usd_oz = metals["silver_usd_oz"]
    usd_egp, usd_aed, usd_sar = fx["usd_egp"], fx["usd_aed"], fx["usd_sar"]

    aed_egp = round(usd_egp / usd_aed, 2)
    sar_egp = round(usd_egp / usd_sar, 2)

    uae_24 = round((gold_usd_oz * usd_aed) / GRAMS_PER_OUNCE, 2)
    uae_21 = round(uae_24 * (21 / 24), 2)

    egy_24 = round((uae_24 * aed_egp) + LOCAL_EGYPT_PREMIUM_EGP, 2)
    egy_21 = round(egy_24 * (21 / 24), 2)

    silver_egy_gram = round((silver_usd_oz * usd_egp) / GRAMS_PER_OUNCE, 2)

    return {
        "gold_usd_oz": round(gold_usd_oz, 2),
        "silver_usd_oz": round(silver_usd_oz, 2),
        "usd_egp": round(usd_egp, 2),
        "aed_egp": aed_egp,
        "sar_egp": sar_egp,
        "uae_24": uae_24,
        "uae_21": uae_21,
        "egy_24": egy_24,
        "egy_21": egy_21,
        "silver_egy_gram": silver_egy_gram,
    }


def load_previous_state():
    try:
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def save_state(state):
    try:
        with open(STATE_FILE, "w", encoding="utf-8") as f:
            json.dump(state, f, ensure_ascii=False, indent=2)
    except OSError:
        pass


def trend_arrow(previous, current):
    if previous is None:
        return "🆕"
    if current > previous:
        return "🔺"
    if current < previous:
        return "🔻"
    return "➖"


def build_alert_banner(current):
    alerts = []
    if current["gold_usd_oz"] < GOLD_OZ_ALERT_USD:
        alerts.append(
            f"سعر أوقية الذهب وصل *{current['gold_usd_oz']}$* (أقل من {GOLD_OZ_ALERT_USD}$)"
        )
    if current["uae_24"] < UAE_24_ALERT_AED:
        alerts.append(
            f"سعر جرام 24 (دبي) وصل *{current['uae_24']}* درهم (أقل من {UAE_24_ALERT_AED} درهم)"
        )
    if not alerts:
        return ""
    lines = "\n".join(f"⚠️ {a}" for a in alerts)
    return f"🚨 *تنبيه انخفاض سعر الذهب:*\n{lines}\n\n"


def build_message(current, previous):
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    def arrow(key):
        return trend_arrow(previous.get(key), current[key])

    banner = build_alert_banner(current)

    message = (
        f"{banner}"
        "🔄 *تقرير أسعار الذهب والفضة*\n"
        f"🕒 {now}\n\n"
        f"🥇 *أوقية الذهب*: {current['gold_usd_oz']}$ {arrow('gold_usd_oz')}\n"
        f"🥈 *أوقية الفضة*: {current['silver_usd_oz']}$ {arrow('silver_usd_oz')}\n\n"
        "🇦🇪 *دبي (جرام)*\n"
        f"   24: {current['uae_24']} درهم {arrow('uae_24')} | 21: {current['uae_21']} درهم {arrow('uae_21')}\n\n"
        "🇪🇬 *مصر (جرام)*\n"
        f"   24: {current['egy_24']} جنيه {arrow('egy_24')} | 21: {current['egy_21']} جنيه {arrow('egy_21')}\n"
        f"   الفضة: {current['silver_egy_gram']} جنيه/جرام {arrow('silver_egy_gram')}\n\n"
        "💵 *أسعار الصرف مقابل الجنيه المصري*\n"
        f"   الدولار: {current['usd_egp']} {arrow('usd_egp')}\n"
        f"   الدرهم: {current['aed_egp']} {arrow('aed_egp')}\n"
        f"   الريال السعودي: {current['sar_egp']} {arrow('sar_egp')}"
    )
    return message


def send_telegram_alert(message):
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID:
        print("خطأ: TELEGRAM_TOKEN أو CHAT_ID غير موجودين في متغيرات البيئة.")
        return False
    telegram_url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "Markdown"}
    try:
        response = requests.post(telegram_url, json=payload, timeout=10)
        return response.status_code == 200
    except requests.RequestException:
        return False


def run_bot():
    metals = get_metal_prices()
    fx = get_exchange_rates()

    if not metals or not fx:
        print("فشل جلب بيانات الأسعار.")
        return

    current = compute_prices(metals, fx)
    previous = load_previous_state()

    message = build_message(current, previous)
    if send_telegram_alert(message):
        print("تم إرسال التقرير بنجاح!")
        save_state(current)
    else:
        print("فشل إرسال الرسالة إلى تليجرام.")


if __name__ == "__main__":
    run_bot()
