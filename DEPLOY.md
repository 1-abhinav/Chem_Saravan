# GitHub Pages Deployment Guide

This application is now a static frontend-only application that can be deployed to GitHub Pages.

## Quick Deploy Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Convert to static site for GitHub Pages"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under **Source**, select **Deploy from a branch**
   - Choose **main** branch and **/ (root)** folder
   - Click **Save**

3. **Your site will be live at:**
   ```
   https://YOUR_USERNAME.github.io/REPO_NAME/
   ```

## File Structure

```
├── index.html          # Main HTML file (GitHub Pages entry point)
├── frontend/
│   ├── config.js      # API key configuration
│   ├── products.js    # Product list
│   ├── script.js      # Main application logic
│   └── style.css      # Styles
└── README.md
```

## Important Notes

⚠️ **API Key Security**: The API key is stored in `frontend/config.js` and will be visible in the browser. This is fine for educational/demo purposes, but be aware that:
- Anyone can see and use your API key
- Your API quota can be consumed by others
- Consider setting usage limits on your Google Cloud Console

## Local Testing

To test locally before deploying:

```bash
# Option 1: Using Python
python -m http.server 8000

# Option 2: Using Node.js http-server (if installed)
npx http-server . -p 8000

# Then open http://localhost:8000 in your browser
```

## Troubleshooting

- **404 errors**: Make sure `index.html` is in the root directory
- **Module errors**: Ensure all file paths in `index.html` are correct
- **API errors**: Check that your API key is correct in `frontend/config.js`

