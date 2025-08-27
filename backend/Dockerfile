# backend/Dockerfile

FROM python:3.11-slim

# Install system dependencies needed for sqlite3 and others
RUN apt-get update && apt-get install -y \
    sqlite3 \
    libsqlite3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy your backend code
COPY . /app
WORKDIR /app

CMD ["python", "your_script.py"]
