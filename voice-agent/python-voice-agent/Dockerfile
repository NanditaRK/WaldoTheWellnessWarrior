FROM python:3.10.18-slim

WORKDIR /app

COPY requirements.txt .


RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python agent.py download-files


EXPOSE 5000

CMD ["python", "agent.py", "dev"]