# 📝 PAANO I-RUN ANG EASYCATER (notes ni Khen)

> Kapag bagong bukas ang laptop o pagkatapos mag-restart — sundin ito.
> Updated: Nov 8, 2026

---

## ⚡ PINAKAMADALING PARAAN — ONE CLICK!

**Double-click lang ang `START-EASYCATER.bat`** (nasa EasyCater folder).

Awtomatiko nitong bubuksan ang 3 windows: backend, mobile app, at admin panel.
Hintayin lang mag-load ang mga ito nang 1-2 minuto, tapos buksan ang mga browser tab sa baba.

---

## 📋 MGA KAILANGAN TUMAKBO (3 server + 1 database)

| # | Ano | Port | Para saan |
|---|-----|------|-----------|
| 1 | **MongoDB** | 27017 | Database — **AUTO-START pag nag-boot ang PC** (walang gagawin!) |
| 2 | **Backend API** | 4000 | Nag-uugnay ng lahat (booking rules, payments, atbp.) |
| 3 | **Mobile app** | 8100 | Para sa customer app sa browser |
| 4 | **Admin panel** | 8101 | Para sa admin sa browser |

---

## 🖐️ MANUAL NA PARAAN (kung ayaw mo ng .bat)

Bukas ng **3 terminal windows** (cmd o PowerShell). Sa bawat isa:

**Terminal 1 — Backend:**
```bash
cd "C:\Users\Khen\OneDrive\Desktop\cater event\EasyCater\backend-api"
npm run dev
```

**Terminal 2 — Mobile app:**
```bash
cd "C:\Users\Khen\OneDrive\Desktop\cater event\EasyCater\mobile-app"
npx @ionic/cli serve --port 8100
```

**Terminal 3 — Admin panel:**
```bash
cd "C:\Users\Khen\OneDrive\Desktop\cater event\EasyCater\admin-panel"
npx @ionic/cli serve --port 8101
```

Tapos buksan sa browser:
- 👤 Customer app: **http://localhost:8100**
- 🛠️ Admin panel: **http://localhost:8101**

---

## 📱 PARA SA PHONE (mga APK — walang cable!)

Ang mga app sa phone mo (EasyCater + EasyCater Admin) ay kumokonekta sa backend
ng PC mo **_sa pamamagitan ng hotspot ng phone_**.

**Setup (gawin tuwing gagamitin ang phone):**
1. **I-ON ang hotspot ng phone** (Settings → Hotspot/Tethering)
2. **I-connect ang PC Wi-Fi sa hotspot ng phone**
3. BUKAS NA ANG MGA APP — walang kable, walang iba pang gawin!

**Kung ayaw gumana ng mga app sa phone** (may error sa pag-load):
1. Sa PC, buksan ang cmd at i-type: `ipconfig`
2. Hanapin ang **IPv4 Address** sa Wi-Fi section
3. Kung **10.151.28.131** pa rin ito → ayos lang, kailangan lang naka-ON ang backend sa PC
4. Kung **NAG-IBA ang IP** (hal. 10.151.28.132) → ipaalam kay ZCode para i-rebuild ang APKs
   (o i-edit ang `environment.prod.ts` ng mobile-app AT admin-panel, tapos `npm run apk` sa dalawa)

---

## 🔑 DEMO ACCOUNTS

| App | Email | Password |
|-----|-------|----------|
| 👤 Customer (mobile) | `maria@example.com` | `Password123` ← walang `!` |
| 👤 Customer (mobile) | `juan@example.com` | `Password123` |
| 🛠️ Admin | `admin@easycater.com` | `Admin123!` |

---

## 🚑 TROUBLESHOOTING (sintomas → solusyon)

| Sintomas | Ibig sabihin | Solusyon |
|----------|--------------|----------|
| Blank app / di maka-login / walang laman lahat | **Patay ang backend** | Buksan http://localhost:4000/api/v1/health — kung error, i-run ang backend (Terminal 1) |
| `{"status":"ok","db":"connected"}` pero blank pa rin app | Stale ang browser page | **I-refresh ang browser (Ctrl+F5)** |
| Ayaw gumana ng mga APK sa phone kahit OK ang PC | Naka-off ang hotspot / nag-iba ang IP | I-ON ang hotspot; i-check ang IP (sa itaas) |
| Ayaw gumana ang `ipconfig` / di ma-access ang 4000 mula sa phone | Firewall na naman | Sabihin kay ZCode (may rules na tayo — "EasyCater API Port 4000") |
| Error sa terminal na `EADDRINUSE: port 4000` | May backend nang tumatakbo | OK lang yan — wag nang i-run ulit! |
| Ayaw mag-bukas ng Packages/ibang page sa admin | (Fixed na ito Nov 8) | I-refresh lang; kung balik, sabihin kay ZCode |

**Golden rule: kapag may kakaiba — Ctrl+F5 muna sa browser bago mag-panic!** 😄

---

## 🌐 GITHUB

- Repo: https://github.com/arevalokhen04/easycater-mobile-app
- Lahat ng fixes naka-push na (hanggang commit `2b7558e`)
