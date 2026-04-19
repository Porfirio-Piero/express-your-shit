# NAICS Finder Frontend

A React + TypeScript frontend for the NAICS code lookup service. Built with Vite.

## Features

- **Single Company Lookup**: Enter company details and get NAICS classification
- **Batch Upload**: Process multiple companies via paste or CSV upload
- **Real-time Progress**: Track batch job progress with polling
- **Export Results**: Download results as CSV or Excel files
- **Color-coded Confidence**: Green (>80%), Yellow (50-80%), Red (<50%)

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Axios (HTTP client)
- React Dropzone (file uploads)
- PapaParse (CSV parsing)
- CSS-in-JS (inline styles, no CSS files)

## Quick Start

### 1. Install Dependencies

```bash
cd projects/naics-finder/frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will start at `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
```

## File Structure

```
frontend/
├── public/           # Static assets
│   └── index.html    # HTML entry point
├── src/
│   ├── components/
│   │   ├── SingleLookup.tsx    # Single company form
│   │   ├── BatchUpload.tsx     # Batch upload interface
│   │   └── ResultsTable.tsx    # Reusable results table
│   ├── services/
│   │   └── api.ts              # API client (axios)
│   ├── App.tsx                 # Main app component
│   ├── main.tsx               # React entry point
│   └── vite-env.d.ts          # Vite type declarations
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## API Integration

The frontend expects a backend running at `http://localhost:8000` with these endpoints:

```
POST /lookup          - Single company lookup
POST /lookup/batch    - Batch lookup (returns jobId)
GET  /jobs/{job_id}   - Poll for job status/results
```

## Environment Variables

Create a `.env` file in the frontend directory if you need to override the API URL:

```
VITE_API_URL=http://localhost:8000
```

## Demo Mode

If the backend is not available, the app includes mock data so you can still test the UI.

## Browser Compatibility

Works in all modern browsers (Chrome, Firefox, Safari, Edge).

## License

Internal use only.
