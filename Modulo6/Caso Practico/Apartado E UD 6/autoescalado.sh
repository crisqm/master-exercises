#!/bin/bash
QUEUE_NAME='casoPracticoMasterQueue'

QUEUES_LIST=$(aws --profile SQS sqs list-queues --queue-name-prefix $QUEUE_NAME)

QUEUE_URL=$(echo $QUEUES_LIST | jq -r '.QueueUrls | .[0]')

#Mientras haya mensajes en la cola
while true; do
  NUMBER_OF_MESSAGES=$(aws --profile SQS sqs get-queue-attributes --queue-url $QUEUE_URL --attribute-names ApproximateNumberOfMessages | jq -r '.Attributes.ApproximateNumberOfMessages | tonumber')

  echo "Numero de mensajes: $NUMBER_OF_MESSAGES"  

  if [ $NUMBER_OF_MESSAGES -eq 0 ]
  then
    break
  fi

  NUMBER_OF_ACTIVE_INSTANCES=$(aws ec2 describe-instances --filters "Name=tag-key,Values=Name" "Name=tag-value,Values=InstanciaCasoPractico" "Name=instance-state-name,Values=running" --query 'Reservations[*].Instances[*].InstanceId' --output text | wc -l)

  ACTIVE_INSTANCES=$(aws ec2 describe-instances --filters "Name=tag-key,Values=Name" "Name=tag-value,Values=InstanciaCasoPractico" "Name=instance-state-name,Values=running" --query 'Reservations[*].Instances[*].InstanceId' --output text)

  readarray -t INSTANCES <<<"$ACTIVE_INSTANCES"

  echo "Numero de instancias activas: $NUMBER_OF_ACTIVE_INSTANCES"

  #Se comprueba el estado
  ESTADO=$(( (($NUMBER_OF_MESSAGES+9)/10)-$NUMBER_OF_ACTIVE_INSTANCES ))

  echo "Estado: $ESTADO"

  #Se implementa la politica de auto escalado
  if [ $ESTADO -lt 0 ]
  then
    #Si el estado es menor que 0 destruimos una instancia.
    aws ec2 terminate-instances --instance-id ${INSTANCES[0]}
  else
    #Si el estado es mayor que 0 y las instancias menor que 5 creamos una instancia.
    if [ $ESTADO -gt 0 ] && [ $NUMBER_OF_ACTIVE_INSTANCES -lt 5 ]
    then
      aws ec2 run-instances --image-id ami-086a09d5b9fa35dc7 --count 1 --instance-type t2.micro --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=InstanciaCasoPractico}]'
    fi
  fi

  #Se implementa una espera de 15 segundos
  sleep 15
done