FROM python:3

RUN apt-get update && apt-get install -y redis-tools
RUN pip install --no-cache-dir --upgrade pip \
  && pip install --no-cache-dir kopf kubernetes pyyaml

COPY ./src ./
ENV NAMESPACE=open-vsx-org
CMD ["sh", "-c", "kopf run -n $NAMESPACE ./redis_cluster_operator.py --verbose"]
