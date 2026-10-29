# 🌳 Pokok Silsilah Keluarga Zamaksyari — ITT588 Lab Work 4

> **Nama Pelajar:** Siti Aisyah binti Zamaksyari  
> **Kursus:** ITT588 — Web Application Development  
> **Tugasan:** Lab Work 4 (Family Heritage Tree)  
> **GitHub Repository:** [https://github.com/aisyahzmk/zamaksyari-family-roots](https://github.com/aisyahzmk/zamaksyari-family-roots)  

---

## 📋 Objektif Makmal (Lab Objectives)

- **Mendapatkan & Memproses Data JSON:** Memuat turun dan memproses data silsilah keluarga daripada fail JSON menggunakan JavaScript (`fetch()`).
- **Paparan Dinamik:** Mengaplikasikan JavaScript untuk memaparkan maklumat ahli keluarga dan hierarki hubungan secara dinamik pada laman web.
- **Visualisasi Hubungan Keluarga:** Membina aplikasi *front-end* untuk memvisualisasikan hubungan keluarga (ibu bapa, perkahwinan, anak-anak, adik-beradik) menggunakan HTML, CSS, dan JavaScript.
- **Ciri Carian & Navigasi Interaktif:** Melaksanakan ciri tapisan mengikut jantina, kotak carian nama/pekerjaan, serta pautan navigasi antara ahli keluarga.

---

## 🛠️ Teknologi yang Digunakan (Pure Web Standards)

| Komponen | Teknologi | Keterangan |
|---|---|---|
| **Struktur** | **HTML5** | Elemen semantik, header, navigation, content area, modal, & sidebar |
| **Gaya** | **CSS3** | Tema warisan moden (*warm heritage palette*), carta hierarki bersambung |
| **Logik** | **Vanilla JavaScript** | Dipisahkan mengikut corak reka bentuk **Model-View-Controller (MVC)** |
| **Data** | **JSON** | Struktur data perhubungan mengikut piawaian skema *geoseiden* |

---

## 🏛️ Seni Bina MVC (Model–View–Controller)

Aplikasi ini dibina mengikut piawaian seni bina perisian **MVC** tanpa bergantung kepada sebarang *framework* luaran:

```
zamaksyari-family-roots/
├── css/
│   └── style.css                ← Gaya & garisan penyambung hierarki pokok
├── data/
│   └── people.json              ← Dataset keluarga (format geoseiden)
├── images/
│   ├── ayah.jpg
│   ├── ibu.jpg
│   ├── abang.jpg
│   ├── kakak.jpg
│   ├── saya.jpg
│   ├── adik_perempuan.jpg
│   ├── adik_lelaki.jpg
│   └── bongsu.jpg
├── js/
│   ├── model/
│   │   └── FamilyModel.js       ← [MODEL] Memproses data, hubungan & carian
│   ├── view/
│   │   └── FamilyView.js        ← [VIEW] Paparan kad, pokok bersambung & profil
│   └── controller/
│       └── FamilyController.js  ← [CONTROLLER] Menyelaras acara & interaksi pengguna
├── index.html                   ← Laman utama aplikasi web
└── README.md                    ← Laporan dokumentasi makmal
```

### 1. 🗄️ Model (`js/model/FamilyModel.js`)
* Memuatkan data `people.json` melalui panggilan `fetch()`.
* Mengandungi logik perhubungan: `getFather()`, `getMother()`, `getChildren()`, `getSiblings()`, dan `getSpouses()`.
* Mengira tahap generasi keluarga secara algoritma menggunakan carian graf (*BFS*).
* Menyediakan fungsi carian kata kunci dan tapisan jantina.

### 2. 🎨 View (`js/view/FamilyView.js`)
* Menguruskan paparan DOM secara menyeluruh tanpa logik data.
* **Pokok Silsilah Bersambung:** Garisan *tree trunk* dan cawangan mendatar menghubungkan Ayah & Ibu kepada semua 6 orang anak.
* **Paparan Nama Panggilan:** Kad di pokok silsilah hanya memaparkan nama panggilan (*Ayah, Ibu, Abang, Angah, Ateh, Kakcik, Iwan, Adik*).
* **Pembongkaran Nama Penuh:** Nama sebenar dan maklumat peribadi hanya dipaparkan apabila pengguna menekan kad untuk membuka paparan Profil.
* **Foto Potret Sebenar:** Menampilkan foto asli bagi setiap ahli keluarga.

### 3. 🎮 Controller (`js/controller/FamilyController.js`)
* Bertindak sebagai jambatan antara `FamilyModel` dan `FamilyView`.
* Mengikat semua *event listener* (input carian, cip penapis, butang navigasi, dan klik kad).
* Menjaga keadaan semasa (*state*) aplikasi.

---

## 👨‍👩‍👧‍👦 Data Ahli Keluarga Zamaksyari

| ID | Panggilan | Nama Penuh | Peranan / Pekerjaan | Tarikh Lahir | Status | Foto |
|---|---|---|---|---|---|---|
| `p1` | **Ayah** | Zamaksyari bin Abd Ghani | Ketua Keluarga · Guru (Cikgu) | 02 Jan 1974 | Hidup | `ayah.jpg` |
| `p2` | **Ibu** | Zalina binti Long | Suri Teladan · Pegawai JHEAINS | 17 Mac 1974 | Hidup | `ibu.jpg` |
| `p3` | **Abang** | Muhammad Firdaus bin Zamaksyari | Anak Sulung · Pejabat Menteri Besar | 13 Jul 2001 | Hidup | `abang.jpg` |
| `p4` | **Angah** | Siti Zulaikha binti Zamaksyari | Anak Kedua · Asst Secretarial Executive | 12 Dis 2002 | Hidup | `kakak.jpg` |
| `p5` | **Ateh (Saya)** | Siti Aisyah binti Zamaksyari | Anak Ketiga · Pelajar Universiti (IT) | 14 Mac 2005 | Hidup | `saya.jpg` |
| `p6` | **Kakcik** | Siti Khadijah Nur binti Zamaksyari | Adik Perempuan · Pelajar Tingkatan 6 | 19 Jun 2007 | Hidup | `adik_perempuan.jpg` |
| `p7` | **Iwan** | Muhammad Ridhwan bin Zamaksyari | Adik Lelaki · Pelajar Tingkatan 5 | 11 Jun 2009 | Hidup | `adik_lelaki.jpg` |
| `p8` | **Adik** | Siti Fatimah Nur binti Zamaksyari | Anak Bongsu · Pelajar Darjah 3 | 28 Dis 2017 | Hidup | `bongsu.jpg` |

---

## 📊 Skema JSON (Rujukan geoseiden)

Struktur `data/people.json` mengikut piawaian [geoseiden/Family-Tree](https://github.com/geoseiden/Family-Tree/blob/main/public/data/people.json):

```json
{
  "id": "p5",
  "nickname": "Ateh",
  "firstName": "Siti Aisyah",
  "lastName": "Zamaksyari",
  "gender": "female",
  "dob": "2005-03-14",
  "dateOfDeath": "",
  "profession": "University Student (IT)",
  "photo": "images/saya.jpg",
  "fatherId": "p1",
  "motherId": "p2",
  "spouses": [],
  "bio": "Pelajar Teknologi Maklumat yang meminati pembangunan aplikasi web dan pengaturcaraan."
}
```

---

## 🖥️ Ciri-ciri Utama Aplikasi

- ✅ **3 Mod Paparan:** Pokok Silsilah (*Tree*), Profil Terperinci (*Profile*), dan Statistik (*Stats*).
- ✅ **Carian Masa Nyata (*Real-Time Search*):** Carian pantas mengikut nama panggilan, nama penuh, atau kerjaya.
- ✅ **Penapis Jantina:** Butang interaktif Lelaki / Perempuan di bahagian sisi.
- ✅ **Navigasi Hubungan Silsilah:** Setiap ahli keluarga yang berkaitan (Ibu, Bapa, Adik-beradik) boleh diklik untuk melayari profil mereka secara terus.
- ✅ **Maklum Balas Toast:** Notifikasi ringkas setiap kali ahli keluarga dipilih.

---

## 🚀 Cara Menjalankan Aplikasi Secara Tempatan

1. **Clone repository ini:**
   ```bash
   git clone https://github.com/aisyahzmk/zamaksyari-family-roots.git
   cd zamaksyari-family-roots
   ```

2. **Jalankan pelayan tempatan (sebarang web server / Node.js):**
   ```bash
   # Menggunakan Node.js
   npx serve .
   
   # Atau menggunakan Python
   python -m http.server 8000
   ```

3. Buka pelayar web dan akses alamat yang tertera (contoh: `http://localhost:8000` atau `http://localhost:3000`).

---

*Disediakan untuk ITT588 Lab Work 4 — © 2026 Siti Aisyah binti Zamaksyari*
