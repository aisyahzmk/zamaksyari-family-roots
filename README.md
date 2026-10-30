# Zamaksyari Family Heritage Tree
### ITT588 — Web Application Development (Lab Work 4)

NAMA : SITI AISYAH BINTI ZAMAKSYARI  
STUDENT ID : 2026128783   
CLASS : M3CS2514A   
LECTURE : SIR SHAHADAN  

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Lab Objectives](#lab-objectives)
3. [MVC Architecture](#mvc-architecture)
4. [Dataset & JSON Schema](#dataset--json-schema)
5. [Family Members](#family-members)
6. [Key Features](#key-features)
7. [Screenshots](#screenshots)
8. [Conclusion](#conclusion)

---

## Project Overview

The **Zamaksyari Family Heritage Tree** is a web application built for ITT588 Lab Work 4. It displays the family background and relationships of the Zamaksyari family across two generations (parents and six children).

The application is built using **HTML5, CSS3, and Vanilla JavaScript**. It follows the **Model-View-Controller (MVC)** design pattern to keep the data, user interface, and interaction logic separate and organized. The family data is loaded from an external JSON file based on the open-source [geoseiden/Family-Tree](https://github.com/geoseiden/Family-Tree/blob/main/public/data/people.json) format.

---

## Lab Objectives

| Objective | Implementation | File |
|---|---|---|
| 1. Retrieve and process family heritage data from a JSON dataset using JavaScript | Fetches data from `./data/people.json` asynchronously using the JavaScript `fetch()` API and processes it into internal objects. | `public/js/model/FamilyModel.js` |
| 2. Display family member information and relationships dynamically | Dynamically generates all family cards, profile details, and relationship links without hardcoding them in HTML. | `public/js/view/FamilyView.js` |
| 3. Visualise family relationships (parents, spouses, children) | Shows Generation 1 (Father and Mother linked as married) connected to Generation 2 (six siblings in one straight line). | `public/js/view/FamilyView.js` & `public/css/style.css` |
| 4. Implement data filtering and navigation features | Includes keyword search, generation and gender dropdown filters, view tabs, clickable kinship buttons, and canvas pan/zoom. | `public/js/controller/FamilyController.js` |

---

## MVC Architecture

The application strictly follows the **Model-View-Controller (MVC)** pattern:

```
                      [ public/data/people.json ]
                                  |
                                  | fetch()
                                  v
  +---------------------------------------------------------------+
  |                      MODEL (FamilyModel.js)                   |
  |  - Loads and parses JSON data                                 |
  |  - Finds relatives (parents, spouses, children, siblings)     |
  |  - Groups family members by generation using BFS              |
  |  - Handles search and dropdown filtering                      |
  |  - Calculates demographics and statistics                     |
  +-------------------------------+-------------------------------+
                                  | Data
                                  v
  +---------------------------------------------------------------+
  |                   CONTROLLER (FamilyController.js)            |
  |  - Initializes the application                                |
  |  - Listens to user input (search, dropdowns, tab clicks)      |
  |  - Handles drag-to-pan and scroll-to-zoom on the canvas       |
  |  - Updates View based on Model data                           |
  +-------------------------------+-------------------------------+
                                  | Render
                                  v
  +---------------------------------------------------------------+
  |                      VIEW (FamilyView.js)                     |
  |  - Pure presentation layer (no business logic)                |
  |  - Renders the interactive tree hierarchy                     |
  |  - Renders the member directory grid                          |
  |  - Renders full profile pages with clickable kinship links    |
  |  - Renders demographic statistics charts                      |
  +---------------------------------------------------------------+
```

- **Model (`FamilyModel.js`):** Manages the data and handles kinship calculations and search queries.
- **View (`FamilyView.js`):** Renders HTML elements onto the page and updates CSS styles.
- **Controller (`FamilyController.js`):** Handles user interactions, updates filters, and tells the View what to display.

---

## Dataset & JSON Schema

The family data is stored in `public/data/people.json`. The structure follows the geoseiden schema:

```json
[
  {
    "id": "p1",
    "nickname": "Ayah",
    "firstName": "Zamaksyari",
    "lastName": "Abd Ghani",
    "gender": "male",
    "dob": "1974-01-02",
    "dateOfDeath": "",
    "profession": "Teacher",
    "photo": "images/ayah.jpg",
    "fatherId": null,
    "motherId": null,
    "spouses": [
      { "id": "p2", "status": "married" }
    ],
    "bio": "Patriarch of the Zamaksyari family. Dedicated educator and loving father of six children."
  }
]
```

---

## Family Members

| ID | Nickname | Full Name | Profession | Date of Birth | Gender | Photo |
|---|---|---|---|---|---|---|
| p1 | Ayah | Zamaksyari bin Abd Ghani | Teacher | 02 Jan 1974 | Male | `ayah.jpg` |
| p2 | Ibu | Zalina binti Long | JHEAINS Officer | 17 Mar 1974 | Female | `ibu.jpg` |
| p3 | Abang | Muhammad Firdaus bin Zamaksyari | Chief Minister's Office Officer | 13 Jul 2001 | Male | `abang.jpg` |
| p4 | Angah | Siti Zulaikha binti Zamaksyari | Assistant Secretarial Executive | 12 Dec 2002 | Female | `kakak.jpg` |
| p5 | Ateh (Me) | Siti Aisyah binti Zamaksyari | University Student (IT) | 14 Mar 2005 | Female | `saya.jpg` |
| p6 | Kakcik | Siti Khadijah Nur binti Zamaksyari | Form 6 Student | 19 Jun 2007 | Female | `adik_perempuan.jpg` |
| p7 | Iwan | Muhammad Ridhwan bin Zamaksyari | Form 5 Student | 11 Jun 2009 | Male | `adik_lelaki.jpg` |
| p8 | Adik | Siti Fatimah Nur binti Zamaksyari | Standard 3 Student | 28 Dec 2017 | Female | `bongsu.jpg` |

---

## Key Features

1. **Interactive Tree Canvas:**
   - Generation 2 (all six siblings) is displayed in one straight horizontal row with connecting branch lines.
   - Users can drag to pan around the canvas.
   - Users can scroll the mouse wheel to zoom in and out smoothly.
   - Includes discrete zoom buttons (`-`, `+`, `Reset`) at the bottom right.

2. **Top Bar Filtering:**
   - **Search Input:** Filter members by name, nickname, or job.
   - **Generation Dropdown:** Filter by Parents (Gen 1) or Children (Gen 2).
   - **Gender Dropdown:** Filter by Male or Female.
   - Cards that do not match active filters are dimmed automatically.

3. **Navigation:**
   - **View Tabs:** Quick switching between Tree, Directory, and Statistics.
   - **Kinship Buttons:** In each profile, relatives (Father, Mother, Spouse, Children, Siblings) are clickable buttons that link directly to their profiles.
   - **Back Button:** Return to the tree view with a single click.

4. **Directory & Statistics:**
   - A grid view showing all members with their bio and details.
   - Visual bar charts showing gender count, generation count, and job breakdown.

5. **Design:**
   - Earthy palette (linen background with terracotta and dark espresso borders).
   - Clean neobrutalist style with sharp borders and solid shadows.

---

## Screenshots

### 1. Family Tree View
![Tree View](screenshots/ss-tree.jpg)

### 2. Family Directory & Filter
![Directory View](screenshots/ss-directory.jpg)

### 3. Member Profile View
![Profile View](screenshots/ss-profile.jpg)

### 4. Statistics View
![Statistics View](screenshots/ss-stats.jpg)

---

## Conclusion

This project fulfills all requirements set for ITT588 Lab Work 4:

1. **MVC Pattern:** The code is cleanly divided into Model, View, and Controller files, making it easy to maintain and scale.
2. **Dynamic Data:** Family data is loaded from an external JSON file via JavaScript `fetch()`, keeping the interface dynamic.
3. **User Experience:** An interactive pan-and-zoom tree canvas, clean top-bar filters, and clickable relationship links make it simple to explore family heritage.

In short, this project successfully demonstrates web development fundamentals using plain HTML, CSS, and JavaScript.

---

*Submitted for ITT588 Web Application Development — Lab Work 4*  
*Siti Aisyah binti Zamaksyari*
