function ponerRelojEnHora(tz){
    try{
        var currentUtcTime = new Date(); // This is in UTC
        var localeString="es-ES";
        //tz="doensd";
        // Converts the UTC time to a locale specific format, including adjusting for timezone.
        $("#aulaClockDate").text(currentUtcTime.toLocaleDateString(localeString,{timeZone: tz,hour12: false,day: "2-digit", month: "2-digit" , year:"numeric"}));
        //var min="00"+currentDateTimeLocal.getMinutes();    var hour="00"+currentDateTimeLocal.getHours();
        //    $("#aulaClockTime").text(hour.substr(hour.length-2,2)+":"+min.substr(min.length-2,2));
        $("#aulaClockTime").text(currentUtcTime.toLocaleTimeString(localeString,{timeZone: tz,hour12: false,hour: "2-digit", minute: "2-digit"}));
        var segundos=60 - currentUtcTime.getSeconds();
        if(segundos<=0){
            segundos=1;
        }
        $("#aulaClockContainer").addClass('aulaClock--show');
        setTimeout(function(){ponerRelojEnHora(tz)},segundos*1000);
    }catch(e){
        $("#aulaClockContainer").removeClass('aulaClock--show');
        
    }
}