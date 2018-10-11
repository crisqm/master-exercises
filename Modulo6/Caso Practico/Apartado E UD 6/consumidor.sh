#!/bin/bash
QUEUE_NAME='casoPracticoMasterQueue'

QUEUES_LIST=$(aws --profile SQS sqs list-queues --queue-name-prefix $QUEUE_NAME)

QUEUE_URL=$(echo $QUEUES_LIST | jq -r '.QueueUrls | .[0]')

#Mientras haya mensajes en la cola se van borrando cada 6 segundos
while true; do
  #Se recupera el mensaje
  MESSAGE=$(aws --profile SQS sqs receive-message --queue-url $QUEUE_URL)

  #Si no quedan mensajes en la cola se sale del bucle
  if [ -z "$MESSAGE" ]
  then
    echo "No quedan mensajes en la cola para procesar."
    break
  fi

  #Se recupera el receipt handle del mensaje para posteriormente poder borrarlo
  RECEIPT_HANDLE=$(echo $MESSAGE | jq -r '.Messages | .[0] | .ReceiptHandle')

  echo "Se recupera mensaje de la cola."

  aws --profile SQS sqs delete-message --queue-url $QUEUE_URL --receipt-handle $RECEIPT_HANDLE

  echo "Se borra mensaje de la cola."

  #Se implementa una espera de 6 segundos
  echo "Esperando."
  sleep 6
done

echo "Cola de mensajes procesada."