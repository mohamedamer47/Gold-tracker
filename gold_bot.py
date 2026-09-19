import json
import os
import sys
from datetime import datetime, timezone

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


GOLD_API_URL = "https://api.gold-api.com/price/{symbol}"
FX_API_URL = "https://open.er-api.com/v6/latest/USD"
GRAMS_PER_OUNCE = 31.1035
STATE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "state.json")


def env_float(name, default):
    try:
        return float(os.environ.get(name, default))
    except ValueError as exc:
        raise ValueError(f"{name} must be a number") from exc


LOCAL_EGYPT_PREMIUM_EGP = env_float("LOCAL_EGYPT_PREMIUM_EGP", 170)
GOLD_OZ_ALERT_USD = env_float("GOLD_OZ_ALERT_USD", 4000)
UAE_24_ALERT_AED = env_float("UAE_24_ALERT_AED", 475)
EGY_21_ALERT_EGP = env_float("EGY_21_ALERT_EGP", 6500)
REPORT_HOURS_UTC = sorted(
    {int(value.strip()) for value in os.environ.get("REPORT_HOURS_UTC", "6,18").split(",")}
)


def http_session():
    retry = Retry(
        total=3,
        backoff_factor=0.6,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=("GET", "POST"),
    )
    session = requests.Session()
    session.headers.update({"User-Agent": "gold-tracker/2.0"})
    session.mount("https://", HTTPAdapter(max_retries=retry))
    return session


def get_json(session, url):
    response = session.get(url, timeout=15)
    response.raise_for_status()
    return response.json()


def positive_number(value, label):
    if not isinstance(value, (int, float)) or value <= 0:
        raise ValueError(f"Invalid {label} value: {value!r}")
    return float(value)


def get_market_data(session):
    gold = get_json(session, GOLD_API_URL.format(symbol="XAU"))
    silver = get_json(session, GOLD_API_URL.format(symbol="XAG"))
    fx = get_json(session, FX_API_URL).get("rates", {})
    return {
        "gold_usd_oz": positive_number(gold.get("price"), "gold price"),
        "silver_usd_oz": positive_number(silver.get("price"), "silver price"),
        "usd_egp": positive_number(fx.get("EGP"), "USD/EGP"),
        "usd_aed": positive_number(fx.get("AED"), "USD/AED"),
        "usd_sar": positive_number(fx.get("SAR"), "USD/SAR"),
    }


def compute_prices(data):
    aed_egp = data["usd_egp"] / data["usd_aed"]
    sar_egp = data["usd_egp"] / data["usd_sar"]
    uae_24 = data["gold_usd_oz"] * data["usd_aed"] / GRAMS_PER_OUNCE
    uae_21 = uae_24 * 21 / 24
    egy_24 = uae_24 * aed_egp + LOCAL_EGYPT_PREMIUM_EGP
    egy_21 = egy_24 * 21 / 24
    silver_egy_gram = data["silver_usd_oz"] * data["usd_egp"] / GRAMS_PER_OUNCE
    egypt_24_in_aed = egy_24 / aed_egp
    return {
        "gold_usd_oz": round(data["gold_usd_oz"], 2),
        "silver_usd_oz": round(data["silver_usd_oz"], 2),
        "usd_egp": round(data["usd_egp"], 2),
        "aed_egp": round(aed_egp, 2),
        "sar_egp": round(sar_egp, 2),
        "uae_24": round(uae_24, 2),
        "uae_21": round(uae_21, 2),
        "egy_24": round(egy_24, 2),
        "egy_21": round(egy_21, 2),
        "silver_egy_gram": round(silver_egy_gram, 2),
        "egypt_24_in_aed": round(egypt_24_in_aed, 2),
        "egypt_premium_aed": round(egypt_24_in_aed - uae_24, 2),
    }


def load_state():
    try:
        with open(STATE_FILE, "r", encoding="utf-8") as file:
            state = json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"prices": {}, "alerts": {}, "last_report_slot": None}
    if "prices" not in state:  # Backward compatibility with the original flat file.
        state = {"prices": state, "alerts": {}, "last_report_slot": None}
    return state


def save_state(state):
    with open(STATE_FILE, "w", encoding="utf-8") as file:
        json.dump(state, file, ensure_ascii=False, indent=2, sort_keys=True)
        file.write("\n")


def percent_change(previous, current):
    if not isinstance(previous, (int, float)) or previous == 0:
        return "جديد"
    change = (current - previous) / previous * 100
    arrow = "🔺" if change > 0 else "🔻" if change < 0 else "➖"
    return f"{arrow} {change:+.2f}%"


def alert_conditions(current):
    return {
        "gold_oz": (
            current["gold_usd_oz"] < GOLD_OZ_ALERT_USD,
            f"أوقية الذهب {current['gold_usd_oz']}$ أقل من {GOLD_OZ_ALERT_USD:g}$",
        ),
        "uae_24": (
            current["uae_24"] < UAE_24_ALERT_AED,
            f"جرام 24 في دبي {current['uae_24']} درهم أقل من {UAE_24_ALERT_AED:g}",
        ),
        "egy_21": (
            current["egy_21"] < EGY_21_ALERT_EGP,
            f"جرام 21 التقديري في مصر {current['egy_21']} جنيه أقل من {EGY_21_ALERT_EGP:g}",
        ),
    }


def report_slot(now):
    eligible = [hour for hour in REPORT_HOURS_UTC if hour <= now.hour]
    if eligible:
        return f"{now.date().isoformat()}T{max(eligible):02d}"
    return None


def build_message(current, previous, triggered_alerts, full_report):
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    sections = []
    if triggered_alerts:
        sections.append("🚨 *تنبيه سعر جديد*\n" + "\n".join(f"⚠️ {item}" for item in triggered_alerts))
    if full_report:
        sections.append(
            "🔄 *تقرير الذهب والفضة*\n"
            f"🕒 {now}\n\n"
            f"🥇 أوقية الذهب: *{current['gold_usd_oz']}$* ({percent_change(previous.get('gold_usd_oz'), current['gold_usd_oz'])})\n"
            f"🥈 أوقية الفضة: *{current['silver_usd_oz']}$* ({percent_change(previous.get('silver_usd_oz'), current['silver_usd_oz'])})\n\n"
            "🇦🇪 *دبي — سعر الجرام المحسوب*\n"
            f"24: {current['uae_24']} درهم | 21: {current['uae_21']} درهم\n\n"
            "🇪🇬 *مصر — تقدير حسابي وليس سعر محل فعلي*\n"
            f"24: {current['egy_24']} جنيه | 21: {current['egy_21']} جنيه\n"
            f"الفضة: {current['silver_egy_gram']} جنيه/جرام\n\n"
            "🔎 *مقارنة مصر ودبي لعيار 24*\n"
            f"السعر المصري يعادل {current['egypt_24_in_aed']} درهم/جرام، بفارق تقديري {current['egypt_premium_aed']} درهم\n\n"
            "💵 *الصرف مقابل الجنيه*\n"
            f"الدولار: {current['usd_egp']} | الدرهم: {current['aed_egp']} | الريال: {current['sar_egp']}"
        )
    return "\n\n".join(sections)


def send_telegram(session, message):
    token = os.environ.get("TELEGRAM_TOKEN")
    chat_id = os.environ.get("CHAT_ID")
    if not token or not chat_id:
        raise RuntimeError("TELEGRAM_TOKEN and CHAT_ID are required")
    response = session.post(
        f"https://api.telegram.org/bot{token}/sendMessage",
        json={"chat_id": chat_id, "text": message, "parse_mode": "Markdown"},
        timeout=15,
    )
    response.raise_for_status()


def run_bot(now=None):
    now = now or datetime.now(timezone.utc)
    session = http_session()
    current = compute_prices(get_market_data(session))
    state = load_state()
    previous = state.get("prices", {})
    previous_alerts = state.get("alerts", {})
    conditions = alert_conditions(current)
    active_alerts = {key: active for key, (active, _) in conditions.items()}
    triggered = [text for key, (active, text) in conditions.items() if active and not previous_alerts.get(key, False)]

    slot = report_slot(now)
    force_report = os.environ.get("FORCE_REPORT", "false").lower() == "true"
    full_report = force_report or (slot is not None and state.get("last_report_slot") != slot)

    if triggered or full_report:
        send_telegram(session, build_message(current, previous, triggered, full_report))
        state["prices"] = current
        if full_report and slot:
            state["last_report_slot"] = slot
        print("Telegram message sent successfully.")
    else:
        print("No report or new alert is due.")

    if state.get("alerts") != active_alerts or triggered or full_report:
        state["alerts"] = active_alerts
        save_state(state)


if __name__ == "__main__":
    try:
        run_bot()
    except Exception as exc:
        print(f"Gold tracker failed: {exc}", file=sys.stderr)
        sys.exit(1)
