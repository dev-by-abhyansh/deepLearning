# Water Quality Deterioration Prediction

This repository combines the water quality monitoring dashboard, model and research code, project documentation, and the LaTeX case study report.

## Run the dashboard

Start the FastAPI backend in one terminal:

```bash
cd Water_Project_Transformer/mainfolder/backend
python -m pip install -r ../../requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Start the Vite frontend in a second terminal:

```bash
cd Water_Project_Transformer/mainfolder/frontend
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Build the report

Install a LaTeX distribution with the packages used by the source, then run from the repository root:

```bash
pdflatex "reportf1 (1).tex"
pdflatex "reportf1 (1).tex"
```

The second pass updates the table of contents and cross-references. Screenshot assets used by the report are in [`images/`](images/).

## Repository contents

- `Water_Project_Transformer/` — FastAPI backend, Vite frontend, trained model files, and notebook.
- `Research_Documentation/` — literature review and implementation notes.
- `reportf1 (1).tex` — LaTeX report source.
- `images/` — report figures and dashboard screenshots.

Virtual environments, dependency directories, local credentials, and generated LaTeX files are excluded from version control.
