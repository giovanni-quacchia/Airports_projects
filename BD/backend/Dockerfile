FROM python:3.11

ENV PORT=5001

EXPOSE ${PORT}
WORKDIR /app

COPY requirements.txt .

# no-chache-dir to reduce image size
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

CMD ["sh", "-c", "flask run --host=0.0.0.0 --port=$PORT --reload"]