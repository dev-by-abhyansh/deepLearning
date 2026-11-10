# Smart Water Quality Monitoring and Alert System

A full-stack machine learning application designed to predict and monitor water quality. This system uses a FastAPI backend to serve predictions from a trained ML model and a Next.js frontend for an interactive user dashboard.

## Repository Structure

* `mainfolder/backend/`: Contains the FastAPI application and backend logic.
* `mainfolder/frontend/`: Contains the Next.js web application.
* `mainfolder/Water_Quality_Transformer.ipynb`: Jupyter Notebook detailing the data analysis, model training, and evaluation.
* `requirements.txt`: Blueprint of all required Python dependencies.

## Prerequisites

Before cloning, ensure your system has the following installed:
* Python 3.10 or higher
* Node.js (v18+ recommended)
* Git

---

## Installation & Setup

You will need two separate terminal windows to run the backend and frontend simultaneously.

### 1. Clone the Repository
```bash
git clone [https://github.com/dev-by-abhyansh/Water_Project_Transformer.git](https://github.com/dev-by-abhyansh/Water_Project_Transformer.git)
cd Water_Project_Transformer



# 2. Backend Setup
# Open your first terminal window to set up the Python environment and start the API.

# Create a standard Python virtual environment in the root folder using anaconda
conda create -p water_tranformer python==3.10 -y

# Activate the environment using anaconda package manager
# On Linux/macOS:
conda activate water_transformer/
# On Windows:
# venv\Scripts\activate

# Install the required dependencies
pip install -r requirements.txt

# Navigate to the backend directory
cd mainfolder/backend

# Start the FastAPI server
uvicorn main:app --reload


# 3. Frontend Setup
# Open a second terminal window. Leave the backend terminal running.

# Navigate to the frontend directory
cd mainfolder/frontend

# Install required Node modules
npm install

# Start the Next.js development server
npm run dev