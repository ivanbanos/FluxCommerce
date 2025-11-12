@echo off
echo FluxCommerce Vector Search Setup
echo ================================

echo.
echo Step 1: Setting up Python embedding service...
echo.

cd /d "%~dp0"
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Step 2: Starting embedding service...
echo.
echo The embedding service will run on http://localhost:8000
echo Keep this window open while using FluxCommerce
echo.
echo Starting service...
python embedding_service.py