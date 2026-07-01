import requests

# --- بيانات التليجرام ---
TELEGRAM_TOKEN = "8406767252:AAEn4KSc_yp2RvS_ucAkxrg5CoWlwsvqboI"
TELEGRAM_CHAT_ID = "8536044097"

def get_gold_prices():
    try:
        response = requests.get("https://api.gold-api.com/price/XAU", timeout=10)
        if response.status_code == 200:
            data = response.json()
            gold_usd_oz = data.get('price') 
            usd_to_aed = 3.6725
            
            # --- حساب الأسعار ---
            uae_24 = round((gold_usd_oz * usd_to_aed) / 31.1035, 2)
            uae_21 = round(uae_24 * (21 / 24), 2)
            
            aed_to_egp_market = 13.35  
            egy_24 = round((uae_24 * aed_to_egp_market) + 170, 2)
            egy_21 = round(egy_24 * (21 / 24), 2)
            
            usd_to_egp_market = round((egy_24 * 31.1035) / gold_usd_oz, 2)
            
            return (uae_24, uae_21), (egy_24, egy_21), usd_to_egp_market, aed_to_egp_market
        return None, None, None, None
    except Exception as e:
        return None, None, None, None

def send_telegram_alert(message):
    telegram_url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "Markdown"}
    try:
        requests.post(telegram_url, json=payload)
    except:
        pass

def run_bot():
    uae_prices, egy_prices, usd_egp, aed_egp = get_gold_prices()
    
    if uae_prices and egy_prices:
        periodic_msg = (
            "🔄 **تقرير الأسعار الدوري (تحديث تلقائي):**\n\n"
            f"🇦🇪 *دبي 24*: {uae_prices[0]} | *21*: {uae_prices[1]} درهم\n"
            f"🇪🇬 *مصر 24*: {egy_prices[0]} | *21*: {egy_prices[1]} جنيه\n\n"
            "💵 **أسعار الصرف:**\n"
            f"🔹 الدرهم: *{aed_egp}* جنيه\n"
            f"🔹 الدولار (ذهب): *{usd_egp}* جنيه"
        )
        send_telegram_alert(periodic_msg)
        print("تم إرسال التقرير بنجاح!")
    else:
        print("فشل جلب البيانات.")

if __name__ == "__main__":
    run_bot()
