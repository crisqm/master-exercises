if [ $# -eq 0 ]
  then
    echo "No arguments supplied. Deleting all leshan-clients running"
        for j in `ps -ef |grep 'java -jar /opt/leshan/leshan-client-demo/target/leshan-client-demo-1.0.0-SNAPSHOT-jar-with-dependencies.jar' | grep -v grep | awk '{print $2}'`; do kill $j; echo Killed: $i; done
       :> bulklocations.log
else
   for i in `seq 1 $1`; do
    lon=$(( ( RANDOM % 360 )  - 180 ))
    lat=$(( ( RANDOM % 180)  - 90 ))
    posL=${lat}':'$lon
    posB=${lat}','$lon
    #echo '{"time":'`date +"%s000"`',"devicename": "device'${i}'","position": "'$posB'"}' >> bulk$(date +%Y%m%d%H%M).log
    echo '{"time":'`date +"%s000"`',"devicename": "device'${i}'","position": "'$posB'"}' >>  bulklocations.log
    (java -jar /opt/leshan/leshan-client-demo/target/leshan-client-demo-1.0.0-SNAPSHOT-jar-with-dependencies.jar -n device${i} -pos $posL -b -u localhost:5688) &
        done
fi
