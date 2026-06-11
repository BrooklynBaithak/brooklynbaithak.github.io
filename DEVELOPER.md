# Brooklyn Baithak - Developer Documentation

This site is built using **Jekyll** (a static site generator) and uses **Decap CMS** for content management, hosted on **Netlify**.

## Prerequisites
- Ruby (v3.x recommended)
- Bundler (`gem install bundler`)
- Node.js (for running local `npx` commands)

## Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/BrooklynBaithak/brooklynbaithak.github.io.git
   cd brooklynbaithak.github.io
   ```

2. **Install dependencies:**
   ```bash
   bundle install
   ```

3. **Run the Jekyll server locally:**
   ```bash
   bundle exec jekyll serve --livereload
   ```
   The site will be available at `http://localhost:4000/`.

## Running the CMS Locally

To test Decap CMS locally without committing to GitHub or needing an internet connection, we use the `decap-server`.

1. **Start the local CMS proxy server:**
   Open a new terminal window and run:
   ```bash
   npx decap-server
   ```
   *Note: This works because `local_backend: true` is already configured in `admin/config.yml`.*

2. **Access the CMS:**
   Navigate to `http://localhost:4000/admin/` in your browser. The CMS will now read and write directly to your local file system.

## Project Structure
- `_data/`: Contains YAML files for the CMS collections (Events, Services, FAQ, etc.).
- `_posts/`: Contains individual project/post entries.
- `_includes/` & `_layouts/`: Jekyll templates and HTML structure.
- `admin/`: Contains `index.html` and `config.yml` for Decap CMS.
- `assets/` & `css/`: Stylesheets, JavaScript, and images.

## Deployment
The site is continuously deployed via Netlify. Any pushes to the `main` branch, or content published via Decap CMS, will trigger a new build and deployment on Netlify.
