#!/bin/bash
QUEUE_NAME='casoPracticoMasterQueue'

QUEUES_LIST=$(aws --profile SQS sqs list-queues --queue-name-prefix $QUEUE_NAME)

#Se comprueba la existencia de la cola
if [ -z "$QUEUES_LIST" ]
then
  #Si no existe se crea
  echo "La cola $QUEUE_NAME no existe."
  QUEUE_URL=$(aws --profile SQS sqs create-queue --queue-name $QUEUE_NAME | jq -r '.QueueUrl | .[0]')
  echo "Cola creada."
else
  #Si existe se purga
  echo "La cola $QUEUE_NAME ya existe:"
  QUEUE_URL=$(echo $QUEUES_LIST | jq -r '.QueueUrls | .[0]')
  aws --profile SQS sqs purge-queue --queue-url $QUEUE_URL
  echo "Cola purgada."
fi

echo $QUEUE_URL

#Encolar 100 mensajes
for i in {1..100}
do
  echo "Enviando mensaje 'Mensaje de prueba $i' a la cola"
  aws --profile SQS sqs send-message --queue-url $QUEUE_URL --message-body "Mensaje de prueba $i"
done

echo "Encolados 100 mensajes en la cola."