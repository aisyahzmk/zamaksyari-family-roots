# 🌳 Family Heritage Tree — ITT588 Lab Work 4

> **Name:** Siti Aisyah binti Zamaksyari  
> **Subject:** ITT588 — Web Application Development  
> **Lab:** Lab Work 4 — Family Heritage Tree  

---

## 📋 Objectives

- Retrieve and process family heritage data from a **JSON dataset** using JavaScript
- Apply JavaScript to **display family member information** and relationships dynamically on a web page
- Develop a **front-end application** to visualise family relationships (parents, spouses, children)
- Implement **data filtering and navigation** features to explore family heritage information

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| **HTML5** | Page structure and layout |
| **CSS3** | Custom styling with warm heritage theme |
| **Vanilla JavaScript** | Application logic (MVC pattern) |
| **JSON** | Family data storage (geoseiden schema) |
| **Node.js** | Local development server |

---

## 📁 Project Structure (MVC Architecture)

```
family-tree/
└── public/
    ├── index.html                   ← Entry point
    ├── css/
    │   └── style.css                ← All styling
    ├── data/
    │   └── people.json              ← Family dataset (geoseiden format)
    ├── images/
    │   ├── abang.jpg
    │   ├── kakak.jpg
    │   └── saya.jpg
    └── js/
        ├── model/
        │   └── FamilyModel.js       ← MODEL: data loading & queries
        ├── view/
        │   └── FamilyView.js        ← VIEW: DOM rendering
        └── controller/
            └── FamilyController.js  ← CONTROLLER: event handling & logic
```

---

## 🏛️ MVC Pattern Explained

This application strictly follows the **Model–View–Controller** design pattern:

### 🗄️ Model — `FamilyModel.js`
- Loads `people.json` via `fetch()`
- Parses geoseiden schema fields (`dob`, `fatherId`, `motherId`, `spouses`, `bloodGroup`)
- Provides relationship query methods: `getFather()`, `getMother()`, `getChildren()`, `getSiblings()`, `getSpouses()`
- Computes generation groups dynamically using BFS
- Handles search and gender filtering

### 🎨 View — `FamilyView.js`
- Pure DOM rendering — zero business logic
- Renders: sidebar member list, tree cards, profile page, statistics charts
- Displays real photos where available, falls back to initials
- Renders relationship chips as clickable navigation buttons

### 🎮 Controller — `FamilyController.js`
- Bootstraps the application and loads data
- Binds all user events (clicks, search input, filter chips, navigation)
- Orchestrates data flow between Model and View
- Manages application state (selected person, active view, filters)

---

## 📊 Family Dataset — JSON Schema

The dataset follows the **geoseiden Family-Tree schema**:

```json
{
  "id": "p1",
  "firstName": "Zamaksyari",
  "lastName": "Abd Ghani",
  "gender": "male",
  "dob": "1965-06-01",
  "dateOfDeath": "",
  "profession": "Head of Family",
  "bloodGroup": "O+",
  "photo": "",
  "fatherId": null,
  "motherId": null,
  "spouses": [
    { "id": "p2", "status": "married" }
  ],
  "bio": "The patriarch of the Zamaksyari family..."
}
```

### Key schema fields:
| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier (e.g. `"p1"`) |
| `dob` | string | Date of birth `"YYYY-MM-DD"` |
| `dateOfDeath` | string | Date of death, empty `""` = living |
| `profession` | string | Occupation |
| `bloodGroup` | string | Blood type (e.g. `"O+"`) |
| `fatherId` | string\|null | ID reference to father |
| `motherId` | string\|null | ID reference to mother |
| `spouses` | array | `[{ id, status }]` — status: married/divorced/widowed |

---

## 👨‍👩‍👧‍👦 Family Members

| ID | Name | Role / Profession | Date of Birth | Blood Group | Status | Photo |
|---|---|---|---|---|---|---|
| p1 | Zamaksyari bin Abd Ghani | Father · Teacher | 02 Jan 1974 | O+ | Living | `ayah.jpg` |
| p2 | Zalina binti Long | Mother · JHEAINS Officer | 17 Mar 1974 | A+ | Living | `ibu.jpg` |
| p3 | Muhammad Firdaus bin Zamaksyari | Eldest Son · Chief Minister's Office | 13 Jul 2001 | O+ | Living | `abang.jpg` |
| p4 | Siti Zulaikha binti Zamaksyari | Eldest Daughter · Asst Secretarial Exec | 12 Dec 2002 | A+ | Living | `kakak.jpg` |
| p5 | **Siti Aisyah binti Zamaksyari** | **Myself · IT Student** | 14 Mar 2005 | B+ | Living | `saya.jpg` |
| p6 | Siti Khadijah Nur binti Zamaksyari | Younger Sister · Form 6 Student | 19 Jun 2007 | AB+ | Living | `adik_perempuan.jpg` |
| p7 | Muhammad Ridhwan bin Zamaksyari | Younger Brother · Form 5 Student | 11 Jun 2009 | O+ | Living | `adik_lelaki.jpg` |
| p8 | Siti Fatimah Nur binti Zamaksyari | Youngest Child · Standard 3 Student | 28 Dec 2017 | A+ | Living | `bongsu.jpg` |

---

## 🖥️ Application Screenshots

### 🌳 Tree View
<!-- Replace with your actual screenshot -->
![Tree View](screenshots/ss-tree.png)

*All family members displayed by generation. Click any card to view their full profile.*

---

### 👤 Profile View
<!-- Replace with your actual screenshot -->
![Profile View](screenshots/ss-profile.png)

*Detailed profile showing personal info, blood group, relationships (father, mother, siblings). All relationship buttons are clickable for navigation.*

---

### 📊 Statistics View
<!-- Replace with your actual screenshot -->
![Stats View](screenshots/ss-stats.png)

*Visual bar charts showing family composition — gender breakdown, blood groups, and members per generation.*

---

### 🔍 Search & Filter
<!-- Replace with your actual screenshot -->
![Search Filter](screenshots/ss-search.png)

*Real-time search by name or profession. Gender filter chips in the sidebar.*

---

### 📄 JSON Dataset & MVC Code
<!-- Replace with your actual screenshot -->
![JSON Code](screenshots/ss-json.png)

*`people.json` dataset following the geoseiden Family-Tree schema.*

---

## ⚙️ Key Features

- ✅ **3 Views** — Tree / Profile / Statistics
- ✅ **Real-time search** — filter by name or profession
- ✅ **Gender filter** — Male / Female chips
- ✅ **Clickable relationships** — navigate between family members
- ✅ **Photo support** — real photos for Abang, Kakak, and myself
- ✅ **Blood group display** — shown on every card
- ✅ **Responsive design** — works on different screen sizes
- ✅ **Toast notifications** — feedback on every interaction
- ✅ **Geoseiden JSON schema** — follows the required data format

---

## 🚀 How to Run

1. Clone this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ITT588-Lab4-FamilyTree.git
   ```

2. Navigate to the folder:
   ```bash
   cd ITT588-Lab4-FamilyTree
   ```

3. Start a local server (requires Node.js):
   ```bash
   node -e "const http=require('http'),fs=require('fs'),path=require('path');const root=path.join(__dirname,'public');const mime={'.html':'text/html','.css':'text/css','.js':'application/javascript','.json':'application/json','.jpg':'image/jpeg'};http.createServer((req,res)=>{let f=path.join(root,req.url==='/'?'/index.html':req.url);if(!fs.existsSync(f)){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'text/plain'});fs.createReadStream(f).pipe(res);}).listen(8765,()=>console.log('Open: http://localhost:8765'));"
   ```

4. Open browser → `http://localhost:8765`

---

## 📚 References

- Dataset schema reference: [geoseiden/Family-Tree](https://github.com/geoseiden/Family-Tree/blob/main/public/data/people.json)
- Lab requirement: ITT588 Lab Work 4

---

*Submitted for ITT588 Lab Work 4 — © 2026 Siti Aisyah binti Zamaksyari*
