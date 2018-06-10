// idle.js (c) Alexios Chouchoulas 2009
// Released under the terms of the GNU Public License version 2.0 (or later).
var idleActividad = (function() {
	
	return {
		_API_JQUERY : 1,
		_API_PROTOTYPE : 2,
		_api: null,
		 
		_idleTimeout : 30000,	// 30 seconds
		_awayTimeout : 600000,	// 10 minutes
		 
		_idleNow : false,
		_idleTimestamp : null,
		_idleTimer : null,
		_awayNow : false,
		_awayTimestamp : null,
		_awayTimer : null,
		_pingTimestamp : null,
		_pingTimeout : null,
		_pingTimer : null,
		_pingActivity : false,
		idalumno: null,
		codcurso: null,
		varp: null,
		dolog: function(texto){
			//window.console && console.log( texto );
		},
		setConfig: function(idalumno,codcurso,varp){
			this.idalumno = idalumno;
			this.codcurso = codcurso;
			this.varp = varp;
		},
		
		setIdleTimeout: function (ms)
		{
			this._idleTimeout = ms;
			this._idleTimestamp = new Date().getTime() + ms;
			if (this._idleTimer != null) {
			clearTimeout (this._idleTimer);
			}
			this._idleTimer = setTimeout("idleActividad._makeIdle()", ms + 50);
			//console.log('idle in ' + ms + ', tid = ' + _idleTimer);
		},
		 
		setAwayTimeout: function (ms)
		{
			//ms;
			idleActividad.dolog("away in "+ms+"ms");
			this._awayTimeout = ms;
			this._pingTimeout = this._awayTimeout * 20 / 100;
			idleActividad.dolog("ping timeout in "+this._pingTimeout+"ms");
			
			this._awayTimestamp = new Date().getTime() + this._awayTimeout;
			this._pingTimestamp = new Date().getTime() + this._pingTimeout;
			
			if (this._awayTimer != null) {
			clearTimeout (this._awayTimer);
			}
			
			this._awayTimer = setTimeout("idleActividad._makeAway()", this._awayTimeout + 50);
			
			if (this._pingTimer != null) {
			clearTimeout (this._pingTimer);
			}
			
			this._pingTimer = setTimeout("idleActividad._makePing()", this._pingTimeout + 50);
		},
		
		_resetAwayTimeout: function (){
			this.setAwayTimeout(this._awayTimeout);
		},
		
		_makeIdle: function ()
		{
			var t = new Date().getTime();
			if (t < this._idleTimestamp) {
			//console.log('Not idle yet. Idle in ' + (_idleTimestamp - t + 50));
			this._idleTimer = setTimeout("idleActividad._makeIdle()", this._idleTimestamp - t + 50);
			return;
			}
			//console.log('** IDLE **');
			this._idleNow = true;
		 
			try {
			if (document.onIdle) document.onIdle();
			} catch (err) {
			}
		},
		 
		_makeAway: function ()
		{
			var t = new Date().getTime();
			
			
			if (t < this._awayTimestamp) {
			//console.log('Not away yet. Away in ' + (this._awayTimestamp - t + 50));
			this._awayTimer = setTimeout("idleActividad._makeAway()", this._awayTimestamp - t + 50);
			return;
			}
			//console.log('** AWAY **');
			this._awayNow = true;
			
			try {
				idleActividad.dolog("ESTOY AWAY!!");
				
				$.ajax({
					type: "POST",
					url: (typeof(_rutaWeb)=="undefined"?"/general/prt/prg/":_rutaWeb)+"teleactivoPing.php",
					dataType: "json",
					data: "action=checkStatus&idalumno="+this.idalumno+"&codcurso="+this.codcurso+"&varp="+this.varp,
					success: function(datos){
						
						if(datos.ESTADO != "1"){
							idleActividad.dolog("no estoy vivo");
							document.location.href = (typeof(_rutaWeb)=="undefined"?"/general/prt/prg/":_rutaWeb)+"timeouted.php?idalumno="+idleActividad.idalumno+"&codcurso="+idleActividad.codcurso+"&varp="+idleActividad.varp;
						}
						else{
							idleActividad.dolog("Estoy vivo!!!");
							idleActividad._resetAwayTimeout();
							//reiniciar contador
						}
					},
					error: function(data){
						if(data.status=='403'){
						  //aqui, encontramos un error y recargamos la ventana
							window.location.reload();
							return;
						}
					}
				});
				
				if (document.onAway) document.onAway();
				} catch (err) {
			}
		},
		
		_makePing: function ()
		{
			videoPlaying = false;
			
			$( "video" ).each(function() {
				if(!$( this ).get(0).paused && !$( this ).get(0).ended){
					videoPlaying = true;
					idleActividad._active();
				}
			});
			
			if(this._pingActivity == true){
				
				idleActividad.dolog("do ping");
				$.ajax({
					type: "POST",
					url: (typeof(_rutaWeb)=="undefined"?"/general/prt/prg/":_rutaWeb)+"teleactivoPing.php",
					dataType: "json",
					data: "action=doPing&idalumno="+this.idalumno+"&codcurso="+this.codcurso+"&varp="+this.varp,
					success: function(datos){
						if(datos.ESTADO == "1"){
							idleActividad._resetAwayTimeout();
						}
					},
					error: function(data){
						if(data.status=='403'){
						  //aqui, encontramos un error y recargamos la ventana
							window.location.reload();
							return;
						}
					}
				});
			}
			else{
				idleActividad.dolog("no ping");
			}
			
			this._pingActivity = false;
			if (this._pingTimer != null) {
			clearTimeout (this._pingTimer);
			}
			
			this._pingTimer = setTimeout("idleActividad._makePing()", this._pingTimeout + 50);
			idleActividad.dolog("reset ping activity");
		},
		 
		_initPrototype: function ()
		{
			this._api = this._API_PROTOTYPE;
		},
		
		 _active2: function (event){
			
			this._active(event);
		},
		_active: function (event, args)
		{
			var t = new Date().getTime();
			idleActividad._idleTimestamp = t + idleActividad._idleTimeout;
			idleActividad._awayTimestamp = t + idleActividad._awayTimeout;
			idleActividad._pingActivity = true;
			
			if (idleActividad._idleNow) {
				idleActividad.setIdleTimeout(idleActividad._idleTimeout);
			}
			
			if (idleActividad._awayNow) {
				idleActividad.setAwayTimeout(idleActividad._awayTimeout);
			}
			
			try {
				if ((idleActividad._idleNow || idleActividad._awayNow) && document.onBack) document.onBack(idleActividad._idleNow, idleActividad._awayNow);
			} catch (err) {
			}
			
			idleActividad._idleNow = false;
			idleActividad._awayNow = false;
		},
		startEvents: function (){
			//console.log(this);
			var encabezado=false, principal=false;
			if(typeof window["encabezado"] != "undefined"){
				encabezado=true;
				var encabezado = window["encabezado"].document;
				
				try{
					encabezado.onmousemove = function(){ idleActividad._active(); };
				} catch (err) { }
				try {
					encabezado.onmouseenter =function(){ idleActividad._active(); };
				} catch (err) { }
				try {
					encabezado.onscroll = function(){ idleActividad._active(); };
				} catch (err) { }
				try {
					encabezado.onkeydown = function(){ idleActividad._active(); };
				} catch (err) { }
				try {
					encabezado.onclick = function(){ idleActividad._active(); };
				} catch (err) { }
				try {
					encabezado.ondblclick = function(){ idleActividad._active(); };
				} catch (err) { }
			}
			
			if(typeof window["principal"] != "undefined"){
				principal=true;
				var principal = window["principal"].document;
				
				try{
					$(principal).bind('mousemove', function(){ idleActividad._active(); });   
				} catch (err) { }
				try {
					principal.onmouseenter = function(){ idleActividad._active(); };
				} catch (err) { }
				try {
					principal.onscroll = function(){ idleActividad._active(); };
				} catch (err) { }
				try {
					principal.onkeydown = function(){ idleActividad._active(); };
				} catch (err) { }
				try {
					principal.onclick = function(){ idleActividad._active(); };
				} catch (err) { }
				try {
					principal.ondblclick = function(){ idleActividad._active(); };
				} catch (err) { }
			}
			
			if(!encabezado && !principal){
				var documento = document;
				
				try{
					$(documento).bind('mousemove onmouseenter onscroll onkeydown onclick ondblclick', function(){ idleActividad._active(); });   
				} catch (err) {
					
					try {
						documento.onmouseenter = function(){ idleActividad._active(); };
					} catch (err) { }
					try {
						documento.onscroll = function(){ idleActividad._active(); };
					} catch (err) { }
					try {
						documento.onkeydown = function(){ idleActividad._active(); };
					} catch (err) { }
					try {
						documento.onclick = function(){ idleActividad._active(); };
					} catch (err) { }
					try {
						documento.ondblclick = function(){ idleActividad._active(); };
					} catch (err) { }
				}
			}
		},
		
		_initJQuery: function ()
		{
			this._api = this._API_JQUERY;
			
			$(window).ready(function(){
				var t=setTimeout("idleActividad.startEvents()",3000);
			});
		},
		
		_initPrototype: function ()
		{
			this._api = this._API_PROTOTYPE;
			var doc = $(document);
			Event.observe (window, 'load', function(event) {
				Event.observe(window, 'click', function(){ idleActividad._active(); });
				Event.observe(window, 'mousemove', function(){ idleActividad._active(); });
				Event.observe(window, 'mouseenter', function(){ idleActividad._active(); });
				Event.observe(window, 'scroll', function(){ idleActividad._active(); });
				Event.observe(window, 'keydown', function(){ idleActividad._active(); });
				Event.observe(window, 'click', function(){ idleActividad._active(); });
				Event.observe(window, 'dblclick', function(){ idleActividad._active(); });
			});
		}
	};
})();

/*
// Detect the API
try {
    if (Prototype) _initPrototype();
} catch (err) { }
 
 */
 
try {
    if (jQuery) idleActividad._initJQuery();
} catch (err) { }

// End of file.