    var nAlumnoCurso=0;
    var nAlumnosPry=0;
    var estadoTutor=-1;
    var intentoDeLocalizarEnTeleactivos=0;
    var maxIntentosDeLocalizarEnTeleactivos=4;
    var tiempoEntreIntentosDeLocalizarEnTeleactivos=5500;
    var tiempoRefrescoIndicadorJS=60000;
   
	window.onload = function(){
	if (window.WebSocket) {
		try{
		   visualizarDisponiblidadSegunCookie();
		}
	        catch(err) {
	        }
	}
	else{
	noInicioIndicadorMagnoliyan(curso);
                    
					$("#comunicaciones").addClass('conectividad-nula');
					$("#btnEstadoAlumno").hide();
					$("#indicadorConexion").addClass("iconEstadoGris").removeClass("iconEstadoVerde");
					$("#comunicaciones a").hover(function() {
						$("#informacion_conectividad").fadeIn(500);
					},function() {
						$("#informacion_conectividad").hide();
					});
	}
	
	}
    
    function visualizarDisponiblidadSegunCookie(){
        var estadoCookie=getCookie('disponible');
            //var estado=0;
            var tipo="nodi";
            if(estadoCookie=='' || estadoCookie=="1"){
                //estado=1;
                tipo="disp";
            }
        if(tipo == 'disp') { 
            $("#opcDisp").addClass('estado_select');
            $("#opcNodi").removeClass('estado_select');
            $(".btn-dropnav-indicador").html('<span class="icon_estado_comunicacion estado_disponible"></span>'); 
            $("#switch-disponible-desktop,#switch-disponible-mobile").attr('checked','checked');
        }else if(tipo == 'nodi') { 
            $("#opcNodi").addClass('estado_select');
            $("#opcDisp").removeClass('estado_select');
            $(".btn-dropnav-indicador").html('<span class="icon_estado_comunicacion estado_noDisponible"></span>');
            $("#switch-disponible-desktop,#switch-disponible-mobile").removeAttr('checked');
        }
        
    }
	
	function setCookie(cname, cvalue) {
		document.cookie = cname + "=" + cvalue;
	}
	
	function getCookie(cname) {
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for(var i = 0; i <ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length,c.length);
			}
		}
		return "";
	}
	
	
    function loadIndicadorJS(idalumno,codcurso,varp){
        _loadIndicadorJS(idalumno,codcurso,varp,"normal");
    }
        
    function _loadIndicadorJS(idalumno,codcurso,varp,version){
        
        var resolucion=screen.width + "x" + screen.height;
        
        $.ajax({
                type: "POST",
                url: (typeof(_rutaWeb)=="undefined"?"/general/prt/prg/":_rutaWeb)+"indicadorJS.php",
                data: "action=inicializar&idalumno="+idalumno+"&codcurso="+codcurso+"&varp="+varp+"&res="+resolucion+"&version="+version,
                success: function(datos){
                    refrescar(idalumno,codcurso,varp);
                   
                }
             });
    }
    function refrescar(idalumno,codcurso,varp){
        $.ajax({
                type: "POST",
                url: (typeof(_rutaWeb)=="undefined"?"/general/prt/prg/":_rutaWeb)+"indicadorJS.php",
                dataType: "xml",
                data: "action=refrescar&idalumno="+idalumno+"&codcurso="+codcurso+"&varp="+varp,
                success: function(datos){
                    procesarDatosXml(datos);
                    var t=setTimeout("refrescar('"+idalumno+"','"+codcurso+"','"+varp+"')",tiempoRefrescoIndicadorJS);
                    
                   
                }
             });
    }
        
    function procesarDatosXml(datos){
        var aux;
        aux=$(datos).find('AlumnosProyecto').text();
        if (!isNaN(aux)){
            aux=parseInt(aux,10);
            if (aux != nAlumnosPry){
                $("#spNumTotal").html(aux);
                $("#spNumTotal2").html(aux);
                nAlumnosPry=aux;    
            }
        }
        
        aux=$(datos).find('AlumnosCurso').text();
        if (!isNaN(aux)){
            aux=parseInt(aux,10);
            if (aux != nAlumnoCurso){
                $("#spNumCurso").html(aux);
                $("#spNumCurso2").html(aux);
                nAlumnoCurso=aux;    
            }
        }
        
        aux=$(datos).find('tutonline').text();
        if (!isNaN(aux)){
            aux=parseInt(aux,10);
            if (aux != estadoTutor){
                if (aux==3){
                    $("#indicadorDerecha").removeClass('iconTutorNoDisponible');
                    $("#indicadorDerecha").addClass('iconTutorTrabajando');
                    $(".iconStateTeacher").removeClass('stateOff').addClass('stateOnline');
                }else{
                    $("#indicadorDerecha").removeClass('iconTutorTrabajando');
                    $("#indicadorDerecha").addClass('iconTutorNoDisponible');
                    $(".iconStateTeacher").addClass('stateOff').removeClass('stateOnline');
                }
                estadoTutor=aux;    
            }
        }
        
        aux=$(datos).find('evtutoria').text();
        if (!isNaN(aux)){
            aux=parseInt(aux,10);
            if (aux == 1){
                mostrarNuevaTutoria();    
            }
        }
    }
    
    function mostrarNuevaTutoria(){
        $("#nuevaTutoria").show("slow",function(){$("#nuevaTutoria").css("display",'block');   });
        var t=setTimeout("esconderNuevaTutoria()",10000);
    }
    
    function esconderNuevaTutoria(){
        $("#nuevaTutoria").hide("slow");
    }
    
    function setTypeConnection(tipo, tutor){
    	if(tipo=='nula'){
    		if(tutor=='C'){
    		document.getElementById('chat').style.display = 'block';
    		document.getElementById('wowza').style.display = 'none';
    		document.getElementById('cargando').style.display = 'none';
    	}}
    	else if (tipo=='perfecta' || tipo == 'tunel'){
    		if(tutor=='C'){
    		document.getElementById('wowza').style.display = 'block';
    		document.getElementById('chat').style.display = 'none';
    		document.getElementById('cargando').style.display = 'none';
    		}
    	}
    	else if (tipo == 'sintutor'){
    		document.getElementById('cargando').style.display = 'none';
    		document.getElementById('wowza').style.display = 'none';
    		document.getElementById('chat').style.display = 'none';
    	}
    	else if (tipo == 'contutor'){
    		document.getElementById('cargando').style.display = 'block';
    		document.getElementById('wowza').style.display = 'none';
    		document.getElementById('chat').style.display = 'none';
    	}
    }
    
    function entrarSala(id,codcurso,varp,idalumno){
    	window.open('wowzaSalon.php?codcurso='+codcurso+'&varp='+varp+'&idalumno='+idalumno+'&idsalon='+id, 'popup');		
    	
    }
    
    //Funciones gestión Magnoliyan--------------------------------------------------------------------------------------------
    var usuario='';
    var curso='';
    var dentro='';
    var entornoName='';
    function establecerCookieMagnoliyan(idusu,codcurso,proyecto,iDentro,entorno,entornoTipo){
        usuario = idusu;
        curso = codcurso;
        dentro = iDentro;
        entornoName = entornoTipo+"_"+entorno;
        var $ = $j1102;
        try{
            var dominioA = document.domain.split('.');
	        dominio = dominioA[1]+dominioA[2];
            estableceDominio(entornoName);
       	    nombreSala='adr_'+dominio+'_'+proyecto;
            $j1102.ajax({ 
                url : 'https://'+servidor+'/'+dominio+'/com/comunica/setCookieJSONP.php', 
                dataType : 'jsonp',
                data: {callback:'iniciarIndicadorMagnoliyan',name:nameUsu},
				timeout:5000,
				error: function(x, t, m) {
				if(t==="timeout") {
					noInicioIndicadorMagnoliyan(curso);
					$("#comunicaciones").addClass('conectividad-nula');
					$("#btnEstadoAlumno").hide();
					$("#indicadorConexion").addClass("iconEstadoGris").removeClass("iconEstadoVerde");
					$("#comunicaciones a").hover(function() {
						$("#informacion_conectividad").fadeIn(500);
					},function() {
						$("#informacion_conectividad").hide();
					});
				} else {
					
				}
				}
            });
        }catch(e){
            noInicioIndicadorMagnoliyan(curso);
        }
	}
    
    function estableceDominio(ent){
        if(ent == 'DESARROLLO_AWS_COM') dominio = "adrformacionaws";
        else if(ent == 'DESARROLLO_AWS_DELOITTE') dominio = "adrformacionaws";
        else if(ent == 'EXPLOTACION_AWS_COM') dominio = "adrformacioncom";
        else if(ent == 'EXPLOTACION_AWS_DELOITTE') dominio = "mastercampusnet";
    }
 
    function iniciarIndicadorMagnoliyan(){
        var $ = $j1102;
        var dominioA = document.domain.split('.');
        dominio = dominioA[1]+dominioA[2];
        
        estableceDominio(entornoName);
        
        nombreSala='adr_'+dominio+'_'+proyecto;
        idSala=0;
        id_curso=curso;
        id_usuario=usuario;
        heightFooter=0;
        registrado=0;
        
        conexionOK = 0;
        timeRecarga = 0;
        idRecargaTime = 0;
        
        counterSegLimit = 30;
        counterSeg = 0;
        
        counterInt = 0;
        
        function compruebaConMag(){
            if(!conexionOK && counterInt==1){
                
                $("#comunicaciones").addClass('conectividad-nula');
                $("#btnEstadoAlumno").hide();
                $("#indicadorConexion").addClass("iconEstadoGris").removeClass("iconEstadoVerde");
    	        $("#comunicaciones a").hover(function() {
                    $("#informacion_conectividad").fadeIn(500);
                },function() {
                    $("#informacion_conectividad").hide();
                });
            }else{
                if(!conexionOK){
                    counterInt++;
                    estableceConMag();
                    setTimeout(compruebaConMag,5000);
                }
            } 
        }
        
        setTimeout(compruebaConMag,5000);
        
        $('.dropnav').dropit();
        if(dentro){ 
            heightFooter = $('.footer-participantes').height();
            $("#btn-creador-salas").click(crearSala);
            generaListadoSalas();
        }
        
        estableceConMag();
        
        function estableceConMag(){
            var estadoCookie=getCookie('disponible');
            //var estado=0;
            var estado="nodi";
            if(estadoCookie=='' || estadoCookie=="1"){
                //estado=1;
                estado="disp";
            }
            
            var mgChat = $j1102('#mgVideoChat').mgVideoChat({
                wsURL: 'wss://'+servidor+'/wss/?room='+nombreSala
            });
            //quitar cuando se conecte
            $("#comunicaUrl").attr("href",$("#comunicaUrl").attr("data-url"));
            /////////////
            $('#mgVideoChat').mgVideoChat('on','connections',function(connections){
                if(counterSeg == 0){
                   
                    counterSeg = 1;
                    $("#comunicaUrl").attr("href",$("#comunicaUrl").attr("data-url"));
                    conexionOK = 1;
                    configuraAudios();
                    rtc = mgChat.getRtc();
                    connDisponibles = $.map(connections, function(value, index) {
                        return [value];
                    });
                    
                    //if(registrado == 0) { actualizaEstado(1,idSala);registrado=1; }
                    //if(registrado == 0) { actualizaEstado(estado,idSala);registrado=1; }
                                      
                    
                    
                    connDisponiblesLimpio = [];
                    connDisponiblesId = [];
                    idsUsuarios=[];
                    var contador = 0;
                    $(connDisponibles).each(function(index) {
                        if(typeof connDisponibles[index] !== "undefined"){
                            connDisponiblesId[contador]=connDisponibles[index].data.userData.id.split("_")[0];
                            connDisponiblesLimpio[contador]=connDisponibles[index].data.userData.name;
                            contador++;
                        }
                    });
                    
                    if(registrado == 0) { cambiaEstado(estado);registrado=1; }
                    compruebaEstadoTutor();
                    
                    if(dentro){
                        var arrayControlUsuarios = [];
                        var nameUsu = "";
                        clearTimeout(idRecargaTime);
                        idRecargaTime = setTimeout(function(){
                            if(!connDisponibles.length){
                                $("#listadoCompa,#listadoTuto").hide();
                                $("#nobodyCom,#nobodyTut").show();
                            }
                            arrayControlUsuarios = [];
                            $(connDisponiblesLimpio).each(function(index) {
                                arrayControlUsuarios[index] = connDisponiblesLimpio[index].replace("T_","");
                                if($(".body-participantes li[data-name='"+connDisponiblesLimpio[index].replace("T_","")+"']").length){
                                    $(".body-participantes li[data-name='"+connDisponiblesLimpio[index].replace("T_","")+"']").attr("data-id",connDisponiblesId[index]);
                                }else{
                                    var contUsuario = creaUsuario(connDisponiblesId[index],connDisponiblesLimpio[index].replace("T_",""),connDisponiblesLimpio[index].replace("T_",""),connDisponiblesId[index]);
                                    if(connDisponiblesLimpio[index].indexOf('T_') != -1) { $("#listadoTuto").show().append(contUsuario); $("#nobodyTut").hide(); } 
                                    else { $("#listadoCompa").show().append(contUsuario); $("#nobodyCom").hide(); }
                                }
                            });
                            $(".body-participantes li").each(function(index){
                                nameUsu = $(this).attr("data-name");
                                var existeU = 0;
                                for(j=0;j<arrayControlUsuarios.length;j++){
                                    if(arrayControlUsuarios[j]==nameUsu) existeU = 1;
                                }
                                if(!existeU) $(".body-participantes li[data-name='"+nameUsu+"']").remove();
                            });
                            
                            setTimeout(cargaFotos,200);
                            activaChange();
                            
                            setTimeout(function(){
                                arrayActivos = [];
                                var postData = { sala: idSala, curso: id_curso, pry: proyecto };
                                $.ajax(
                                    {
                                	     url : rutaPRG+"comunicaciones/estadoCom.php",
                                	     type: "POST",
                                         data : postData,
                                	     dataType: 'json',
                                	     cache: false,
                                         success:function(jsonObj, textStatus, jqXHR) 
                                	     {
                                            if(jsonObj.ids.length)
                                		    {
                                		          for(i=0;i<jsonObj.ids.length;i++)
                                                  {
                                                        arrayActivos[i] = jsonObj.ids[i].ID;
                                                  }
                                            }
                                            gestionaActivos(connDisponiblesId,arrayActivos);
                                         }
                                      }
                                 );
                            },100);
                            timeRecarga = 3000;
                        },timeRecarga);
                    }
                    setTimeout(function(){
                        counterSeg = 0;    
                    },counterSegLimit*1000);
                }
            });
            $('#mgVideoChat').mgVideoChat('on','chat_message',function(data){
                if(data.message.substring(0,3) == "SLL"){
                    var idRoom = parseInt(data.message.substring(4,data.message.length));
                    $("#llamadaEntrante").show();
                    controlAudio('1');
                    $("#llaEntName,#loCaName").html(nombreDeId(data.connectionId));
                    idCompruebaSala = setTimeout(function(){ compruebaSalaActiva(idRoom); },2000);
                    $("#llaEntAceptar").click(function(){
                        entraSala(idRoom);
                        $("#llamadaEntrante").hide();
                        controlAudio('0');
                        clearTimeout(idCompruebaSala);
                    });
                    $("#llaEntRechazar").click(function(){
                        actualizaEstado(2,idRoom);
                        $("#llamadaEntrante").hide();
                        controlAudio('0');
                        clearTimeout(idCompruebaSala);
                        rtc.chatMessage(data.connectionId, "REFUSE");
                    });
                }
                if(data.message == "REFUSE"){
                    $("#refuseCall").show();
                    $("#reCaName").html(nombreDeId(data.connectionId));
                    $("#closeNotRC").click(function(){$("#refuseCall").hide();});
                }
                if(dentro){
                    if(data.message == "NoDisponible"){
                        setTimeout(function(){
                            $("li[data-id='"+data.connectionId+"']").removeClass('uDis').hide();
                            if(!$("#listadoTuto .uDis").length){
                                $("#listadoTuto").hide();
                                $("#nobodyTut").show();
                            }
                            if(!$("#listadoCompa .uDis").length){
                                $("#listadoCompa").hide();
                                $("#nobodyCom").show();
                            }
                        },10);
                    }
                    if(data.message == "Disponible"){
                        setTimeout(function(){
                            $("li[data-id='"+data.connectionId+"']").addClass('uDis').show();
                            if($("#listadoTuto .uDis").length){
                                $("#listadoTuto").show();
                                $("#nobodyTut").hide();
                            }
                            if($("#listadoCompa .uDis").length){
                                $("#listadoCompa").show();
                                $("#nobodyCom").hide();
                            }
                        },10);
                    }
                    if(data.message == "ActualizaSalas"){
                        setTimeout(function(){
                            generaListadoSalas();
                        },10);
                         
                        
                    }
                }
            });
        }
    }
    function sleep (time) {
        //return new Promise((resolve) => setTimeout(resolve, time));
    }
    
    function compruebaEstadoTutor(){
		
        var postData = { curso: id_curso, pry: proyecto };
        $.ajax(
            {
        	     url : rutaPRG+"comunicaciones/estadoTutor.php",
        	     type: "POST",
                 data : postData,
        	     dataType: 'json',
        	     cache: false,
                 success:function(jsonObj, textStatus, jqXHR) 
        	     {
                    if(jsonObj.estadotutor)
        		    {
		                  if(jsonObj.estadotutor == '0') $("#indicadorDerecha").removeClass('iconTutorDisponible').removeClass('iconTutorTrabajando').addClass('iconTutorNoDisponible').show();
                          else if(jsonObj.estadotutor == '1') $("#indicadorDerecha").removeClass('iconTutorNoDisponible').removeClass('iconTutorTrabajando').addClass('iconTutorDisponible').show();
                          else if(jsonObj.estadotutor == '2') $("#indicadorDerecha").removeClass('iconTutorNoDisponible').removeClass('iconTutorDisponible').addClass('iconTutorTrabajando').show();
                    }
                 }
              }
         );
    }   
    
    function configuraAudios(){
        $("#indicador_nuevo audio").prop('muted', true);
        $("#indicador_nuevo #audioRing").prop('muted',false);
    }
    
    function controlAudio(opc){
        if(opc == '1'){
            document.getElementById('audioRing').play();
            idInterval = setInterval(function(){ document.getElementById('audioRing').play(); },5000);
        }
        else{
            document.getElementById('audioRing').pause();
            clearInterval(idInterval);
        }
    }
    
    function compruebaSalaActiva(id){
        var postData = { idSala: id };
        $.ajax({
    	     url : rutaPRG+"comunicaciones/compruebaSalaActiva.php",
    	     type: "POST",
    	     data : postData,
    	     dataType: 'json',
    	     cache: false,
             success:function(jsonObj, textStatus, jqXHR) 
    	     {
    	        if(jsonObj.estadoSala){
    	            if(jsonObj.estadoSala == '0'){
    	               $("#llamadaEntrante").hide();
                       $("#lostCall").show();
                       controlAudio('0');
                       actualizaEstado(3,id);
                       $("#closeNotLP").click(function(){$("#lostCall").hide();});
    	            }
                    else{
                        idCompruebaSala = setTimeout(function(){ compruebaSalaActiva(id); },2000);
                    }
    	        }
             }
        });
    }
     function nombreDeId(id)
    {   
        var r = "";
        $(connDisponiblesId).each(function(index) {
            if(connDisponiblesId[index]==id) r=connDisponiblesLimpio[index];
        });
        return r;
    }
    
    function llamar(id,sala)
    {
        
        rtc.chatMessage(id, "SLL_"+sala);
        rtc.chatMessage(id, "LLCP_"+sala+"_"+id_curso);
    }
    function cambiaEstadoResponsive(tipo){
        var valor = $(".estado_select").attr('id');
        if(valor == 'opcDisp'){
            tipo='nodi';
        }
        else if(valor == 'opcNodi'){
            tipo='disp';
        }
        if(tipo == 'disp') { $("#opcDisp").addClass('estado_select');$("#opcNodi").removeClass('estado_select');$(".btn-dropnav-indicador").html('<span class="icon_estado_comunicacion estado_disponible"></span>');}
        else if(tipo == 'nodi') { $("#opcNodi").addClass('estado_select');$("#opcDisp").removeClass('estado_select');$(".btn-dropnav-indicador").html('<span class="icon_estado_comunicacion estado_noDisponible"></span>'); }
        
        var valor = $(".estado_select").attr('id');
        if(valor == 'opcDisp'){
			setCookie('disponible',"1");
            actualizaEstado(1,idSala);
            $(connDisponiblesId).each(function(index) {
                rtc.chatMessage(connDisponiblesId[index], "Disponible");
            });
        }
        else if(valor == 'opcNodi'){
			setCookie('disponible',"0");
            actualizaEstado(0,idSala);
            $(connDisponiblesId).each(function(index) {
                rtc.chatMessage(connDisponiblesId[index], "NoDisponible");
            });
        }
        else{
            actualizaEstado(1,idSala);
        }
        compruebaEstadoTutor();
    }
    
    function cambiarEstadoSmartBlue(from){
        var valor = $("#"+from).is(":checked");
        if(valor){
            $("#switch-disponible-desktop,#switch-disponible-mobile").attr('checked','checked');
            setCookie('disponible',"1");
            actualizaEstado(1,idSala);
            $(connDisponiblesId).each(function(index) {
                rtc.chatMessage(connDisponiblesId[index], "Disponible");
            });
            
        }else{
            $("#switch-disponible-desktop,#switch-disponible-mobile").removeAttr('checked');
            setCookie('disponible',"0");
            actualizaEstado(0,idSala);
            $(connDisponiblesId).each(function(index) {
                rtc.chatMessage(connDisponiblesId[index], "NoDisponible");
            });
            
            
        }
        compruebaEstadoTutor();
        return;
       
    }
    
    function cambiaEstado(tipo)
    {
        
        if(tipo == 'disp') { $("#opcDisp").addClass('estado_select');$("#opcNodi").removeClass('estado_select');$(".btn-dropnav-indicador").html('<span class="icon_estado_comunicacion estado_disponible"></span>');if($("#switch-disponible")){$("#switch-disponible").prop( "checked", true );}}
        else if(tipo == 'nodi') { $("#opcNodi").addClass('estado_select');$("#opcDisp").removeClass('estado_select');$(".btn-dropnav-indicador").html('<span class="icon_estado_comunicacion estado_noDisponible"></span>'); if($("#switch-disponible")){$("#switch-disponible").prop( "checked", false );}}
        
        var valor = $(".estado_select").attr('id');
        if(valor == 'opcDisp'){
			setCookie('disponible',"1");
            actualizaEstado(1,idSala);
            $(connDisponiblesId).each(function(index) {
                rtc.chatMessage(connDisponiblesId[index], "Disponible");
            });
        }
        else if(valor == 'opcNodi'){
			setCookie('disponible',"0");
            actualizaEstado(0,idSala);
            $(connDisponiblesId).each(function(index) {
                rtc.chatMessage(connDisponiblesId[index], "NoDisponible");
            });
        }
        else{
            actualizaEstado(1,idSala);
        }
        compruebaEstadoTutor();
    }
    
    function actualizaEstado(estado,idSala){
        var postData = { activo: estado, usuario: rtc.id, usuarioId: id_usuario, sala: idSala, curso: id_curso, pry: proyecto, tutor: soytutor };
        $.ajax(
            {
        	     url : rutaPRG+"comunicaciones/actualizaEstadoCom.php",
        	     type: "POST",
        	     data : postData,
        	     dataType: 'json',
        	     cache: false
            }
         )
        compruebaEstadoTutor(); 
    }
    
    function gestionaActivos(connDisponiblesId,arrayActivos){
        for(j=0;j<connDisponiblesId.length;j++){
            for(k=0;k<arrayActivos.length;k++){
                if(connDisponiblesId[j]==arrayActivos[k]){
                    $("li[data-id='"+arrayActivos[k]+"']").addClass('uDis').show();
                }
            }
        }
        if(!$("#listadoTuto .uDis").length){
            $("#listadoTuto").hide();
            $("#nobodyTut").show();
        }
        if(!$("#listadoCompa .uDis").length){
            $("#listadoCompa").hide();
            $("#nobodyCom").show();
        }
    }
        
    function entraSala(room){
        var abierta = 0;
        var cadenaDim = "width=1208,height=704,";
        if(screen.width < 1208) cadenaDim = "";
        try{
            window.open('https://'+servidor+'/'+dominio+'/com/comunica/estableceLlamada.php?room='+room+'&idalumno='+id_usuario+'&curso='+id_curso+'&pry='+proyecto+'&dominio='+dominio,'Sala_privada',cadenaDim+'scrollbars=NO');
            abierta = 1;
        }catch(e){
            abierta = 0;
        }
        if(abierta) actualizaEstado(1,room);
    }
    
    function crearSala(){
        var cadena = "";
        var name = $("#name-sala").val();
        var prv = '0';
        puedoEntrar = 0;
        idSalaCreada = 0;
        if($("#sala-privada").is(":checked")) prv = '1';
        if($("#name-sala").val() != ""){
            var postData = { curso: id_curso, usuario: id_usuario, nombre: name, pry: proyecto, privada: prv };
            $.ajax({
        	     url : rutaPRG+"comunicaciones/creaSala.php",
        	     type: "POST",
        	     data : postData,
        	     dataType: 'json',
        	     cache: false,
                 success:function(jsonObj, textStatus, jqXHR) 
        	     {
        	        if(jsonObj.idSala){
        	            $(".check-participante:checked").each(function(index){
                            var idU = $(this).parent().parent().attr('data-id');
                            llamar(idU,jsonObj.idSala);
                            cadena += idU+",";
                        });
                        aniadeAlumnosSala(cadena,jsonObj.idSala);
                        $('.list-participantes').removeClass('crearSala-activo');
                        $('.body-participantes').css('bottom',0);
                        $(".user_select").click();
                        puedoEntrar = 1;
                        idSalaCreada = jsonObj.idSala;
        	        }
                 }
            });
        }
        else{
            $("#errorNombreSala").show();
            setTimeout(function(){ $("#errorNombreSala").hide(); },2000);
        }
        setTimeout(entraSalaTrasCrear,1000);
    }
    
    function entraSalaTrasCrear(){
        if(puedoEntrar){
            entraSala(idSalaCreada);
            generaListadoSalas();
            $(connDisponiblesId).each(function(index) {
                rtc.chatMessage(connDisponiblesId[index], "ActualizaSalas");
            });
        }else{
            setTimeout(entraSalaTrasCrear,500);
        }
    }
    
    function aniadeAlumnosSala(cad,sala){
        var cadena=cad.substring(0,cad.length-1);
        var postData = { ids: cadena, idSala: sala, curso: id_curso, pry: proyecto };
        $.ajax(
            {
        	     url : rutaPRG+"comunicaciones/aniadeAlumnosSala.php",
        	     type: "POST",
        	     data : postData,
        	     dataType: 'json',
        	     cache: false
            }
         )
    }
    
    function creaUsuario(foto,nombre,nick,id){
        var cadena = "";
        cadena += "<li data-id="+id+" data-name='"+nombre+"' style='display:none'>";
        cadena += "<label class='label-participante'>";
        cadena += "<input name='participante1' type='checkbox' class='check-participante'>";
        cadena += "<div class='info-participante'>";
        cadena += "<div class='photo'>";
        cadena += "<img src='img/foto3.jpg' data-src='comunicaciones/usuariosFotos.php?id="+foto+"&curso="+id_curso+"&pry="+proyecto+"' width='48' height='48' alt=''/>";
        cadena += "</div>";
        cadena += "<div class='container-info'>";
        cadena += "<div class='info-name'>"+nombre+"</div>";
        cadena += "</div>";
        cadena += "</div>";
        cadena += "</label>";
        cadena += "</li>";
        return cadena;
    }
    
    function cargaFotos(){
        $(".photo > img").each(function(index){
            $(this).attr('src',$(this).attr('data-src'));
        });
    }
    
    function activaChange(){
        $('.check-participante').change(function(e) {
        	$(this).parents('label').toggleClass('user_select');
        	if($('label').hasClass('user_select')){
                if($('.body-participantes').css('bottom') != heightFooter+"px") $('#name-sala').val(idiomaSala+"_"+parseInt(Math.random()*1000));
                $('.list-participantes').addClass('crearSala-activo');
        		$('.body-participantes').css('bottom',heightFooter);
        	}else {
        		$('.list-participantes').removeClass('crearSala-activo');
        		$('.body-participantes').css('bottom',0);
        	}
        });
    }
    function generaListadoSalas(){
        var cadenaG="";
        var arrayControl = [];
        var postData = { curso: id_curso, usuario: id_usuario, pry: proyecto };
        
        $.ajax({
    	     url : rutaPRG+"comunicaciones/salasActivas.php",
    	     type: "POST",
             data : postData,
    	     dataType: 'json',
    	     cache: false,
             success:function(jsonObj, textStatus, jqXHR) 
    	     {
                if(jsonObj.salas.length)
    		    {
    		          for(i=0;i<jsonObj.salas.length;i++)
                      {
                            arrayControl[i]=jsonObj.salas[i].ID;
                            if($(".box-sala[data-idsala='"+jsonObj.salas[i].ID+"']").length){
                                
                                    $(".box-sala[data-idsala='"+jsonObj.salas[i].ID+"'] .users-inside-sala").html(jsonObj.salas[i].PARTICIPANTES+" "+idiomaUsuSala);
                                
                            }   
                            else{
                                cadenaG = generaAccesoSala(jsonObj.salas[i].ID,jsonObj.salas[i].NOMBRE,jsonObj.salas[i].PARTICIPANTES);
                                $(".pad-container-salas").append(cadenaG);    
                            }
                      }
                      $(".box-sala").each(function(index){
                        idCom = $(this).attr("data-idsala");
                        var existe = 0;
                        for(j=0;j<arrayControl.length;j++){
                            if(arrayControl[j]==idCom) existe = 1;
                        }
                        if(!existe) $(".box-sala[data-idsala='"+idCom+"']").remove();
                      });
                      
                }
				else{
                    $('.btn-sala').text(idiomaAcceder)
                    $('.users-inside-sala').text("0 "+idiomaUsuSala)
                }
             }
        });
    }

     function getUsuariosConectados(resp){
        var postData = { curso: id_curso, usuario: id_usuario, pry: proyecto };
        $.ajax({
    	     url : rutaPRG+"comunicaciones/usuariosConectados.php",
    	     type: "POST",
             data : postData,
    	     dataType: 'json',
    	     cache: false,
             success:function(jsonObj, textStatus, jqXHR) 
    	     {
    	       usuarios=jsonObj;
               resp(usuarios);
             }
        });
    }
    
    function generaAccesoSala(id_sala,nombre_sala,num_participantes){
        
        var claseSala = "sala-nueva";
        if(nombre_sala == idiomaCafeteria) claseSala = "sala-cafeteria";
        else if(nombre_sala == idiomaSalaCurso) claseSala = "sala-curso";
        
        var cadena = "";
        cadena += "<div class='box-sala "+claseSala+"' data-idsala='"+id_sala+"'>";
        cadena += "<div class='image-sala'></div>";
        cadena += "<div class='content-info-sala'>";
        cadena += "<div class='name-sala'>"+nombre_sala+"</div>";
        cadena += "<div class='users-inside-sala'>"+num_participantes+" "+idiomaUsuSala+"</div>";
        cadena += "</div>";
        cadena += "<a href='javascript:entraSala("+id_sala+");' class='btn-sala'>"+idiomaAcceder+"</a>";
        cadena += "</div>";
        
        return cadena;
    }
    
    function noInicioIndicadorMagnoliyan(curso){
        $("#btnEstadoAlumno").hide();
        $("#indicadorConexion").addClass("iconEstadoGris").removeClass("iconEstadoVerde");
    }
    

