# Brooklyn Baithak Website Updater Guide

Welcome! This guide is designed for non-technical collaborators to easily update the content on the Brooklyn Baithak website directly through GitHub—**no coding, terminal commands, or software installations required.**

---

## Table of Contents
1. [Updating Website Content (Events, FAQs, FAQs, etc.)](#1-updating-website-content)
2. [Step-by-Step: Editing on GitHub.com](#2-step-by-step-editing-on-githubcom)
3. [Important Rules for Editing Data Files](#3-important-rules-for-editing-data-files)
4. [Uploading New Images](#4-uploading-new-images)

---

## 1. Updating Website Content

Most of the website's content is stored in the `_data` folder in simple text files called **YAML** (`.yml`) files. You can edit these files to update the site.

Here is a map of what each file in the `_data` folder controls:

*   **[events.yml](file:///Users/drshikaasher/brooklynbaithak.github.io/_data/events.yml)**: The schedule of upcoming baithaks (title, date, description, Eventbrite links).
*   **[faq.yml](file:///Users/drshikaasher/brooklynbaithak.github.io/_data/faq.yml)**: Frequently Asked Questions.
*   **[testimonials.yml](file:///Users/drshikaasher/brooklynbaithak.github.io/_data/testimonials.yml)**: Quotes and reviews from attendees and performers.
*   **[press.yml](file:///Users/drshikaasher/brooklynbaithak.github.io/_data/press.yml)**: Links and logos for press mentions.
*   **[story.yml](file:///Users/drshikaasher/brooklynbaithak.github.io/_data/story.yml)**: Team biographies, organization history, and about page copy.
*   **[impact.yml](file:///Users/drshikaasher/brooklynbaithak.github.io/_data/impact.yml)**: Statistics and metrics displayed on the home page.

---

## 2. Step-by-Step: Editing on GitHub.com

To edit any file, follow these steps:

1.  **Open the file:** Log into GitHub, navigate to this repository, and click into the `_data` folder. Click on the file you want to change (e.g., `events.yml`).
2.  **Enter Edit Mode:** In the top right corner of the file view, click the **pencil icon** (Edit this file).
3.  **Make your changes:** Modify the text. Be careful to follow the existing structure (see [Important Rules](#3-important-rules-for-editing-data-files) below).
4.  **Save/Commit changes:**
    *   Scroll down to the bottom of the page to the **Commit changes** box.
    *   Write a short description of what you changed (e.g., `"Update July Baithak date"`).
    *   Leave "Commit directly to the `main` branch" selected.
    *   Click the green **Commit changes** button.
5.  **Wait for the site to update:** The website will automatically rebuild and show your changes within 1–2 minutes!

---

## 3. Important Rules for Editing Data Files

YAML files are very strict about formatting. Please follow these rules to avoid breaking the site:

### ⚠️ Indentation & Spaces
*   **Use spaces, never tabs.**
*   Keep the spacing exactly aligned with the existing items. If an item is indented by two spaces, your new item must also be indented by exactly two spaces.

### 📝 Text formatting and Quotes
*   If your text contains punctuation like colons (`:`), apostrophes (`'`), or quotes (`"`), wrap the entire line of text in double quotes.
    *   *Correct:* `title: "Brooklyn Baithak: Summer Edition"`
    *   *Incorrect:* `title: Brooklyn Baithak: Summer Edition` (The colon confuses the system)
*   For multi-line descriptions, use a greater-than sign (`>`) on the first line, then indent the paragraph underneath it:
    ```yaml
    description: >
      This is a long description that spans
      multiple lines easily.
    ```

### 🗓️ Creating a New Item (e.g., a new event or FAQ)
Copy an existing item block, paste it below, and modify the fields. Ensure each item starts with a dash (`- `) followed by a space.

Example of an Event block:
```yaml
- title: "Brooklyn Baithak: Summer Edition"
  month: JUL
  day: 19
  year: 2025
  location: "Brooklyn, NY"
  time: "6:00 PM – 9:00 PM"
  description: >
    An evening of classical music.
  price: "$20 – $35"
  url: "https://www.eventbrite.com/..."
  featured: false
```

---

## 4. Uploading New Images

If you need to upload new photos (e.g., performer headshots, press logos, event photos):

1.  Navigate to the `img` folder on GitHub.
2.  Click **Add file** -> **Upload files** in the top right.
3.  Drag and drop your image files. Keep image filenames lowercase, short, and hyphenated (e.g., `sanjay-sharma.jpg`).
4.  Scroll to the bottom, write a commit message (e.g., `"Add headshot for Sanjay"`), and click **Commit changes**.
5.  To use this image in a data file, reference it by its path relative to the image folder (e.g., `/img/sanjay-sharma.jpg`).
