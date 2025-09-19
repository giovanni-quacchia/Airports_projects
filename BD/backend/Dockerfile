FROM python:3.11

EXPOSE 5000
WORKDIR /app

COPY requirements.txt .

# no-chache-dir to reduce image size
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

CMD ["flask", "run", "--host=0.0.0.0", "--port=5000", "--reload"]