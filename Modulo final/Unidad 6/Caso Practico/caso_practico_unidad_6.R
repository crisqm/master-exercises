## Preparacion del entorno
rm(list=ls())

setwd("/Users/ivangarcia/Master/Material/Modulo Final/Unidad 6/RSpatialTutorial")

is.installed <- function(paquete) is.element(paquete, installed.packages())

if(!is.installed('rgdal'))
  
  install.packages('rgdal')

library(rgdal)

if(!is.installed('tmap'))
  
  install.packages('tmap')

library(tmap)

if(!is.installed('rgeos'))
  
  install.packages('rgeos')

library(rgeos)

# Obtencion de datos .shp del Gran Londres en 2001:
i_data_gs <- readOGR(dsn = "data", layer = "london_sport")
i_data_gs$Pop_2001 <- as.numeric(as.character(i_data_gs$Pop_2001))

# Obtencion de los datos de clientes
customer_data <- read.csv2("data/LondonCustomer.csv")

# Nos quedamos con los clientes menores de 55
target_customer_data = customer_data[customer_data$AGE < 55, ]

# Calculamos el volumen de negocio agregado por distrito
vol_ag <-aggregate(target_customer_data$NETPRICE_PRO11_AMT 
                   + target_customer_data$NETPRICE_PRO12_AMT 
                   + target_customer_data$NETPRICE_PRO13_AMT 
                   + target_customer_data$NETPRICE_PRO14_AMT 
                   + target_customer_data$NETPRICE_PRO15_AMT 
                   + target_customer_data$NETPRICE_PRO16_AMT 
                   + target_customer_data$NETPRICE_PRO17_AMT
                   , by=list(target_customer_data$name), FUN=sum)

# Cambiamos el nombre de la columna de volumen de negocio que acabamos 
# de calcular para que se entienda mejor
colnames(vol_ag) <- c("name","Volume")

# Hacemos join con los datos del objeto espacial por nombre de distrito.
vol_ag_data <- merge(i_data_gs@data,vol_ag,by="name",all.x=T)

# Ahora vamos a construir un objeto espacial nuevo que tenga los mismos datos 
# espaciales que el original (municipios de Londres) con los nuevos datos 
# cuantitativos obtenidos referidos a las sucursales y manteniendo el orden 
# de los municipios del objeto espacial original.
volume_gs<-merge(i_data_gs, vol_ag_data[,c(1,5)], by = "name", all.x=TRUE)

# Se ordenan las oficinas por volumen de negocio ascendente
volume_gs <- volume_gs[order(volume_gs$Volume),]

# Se seleccionan las 3 oficinas que habria que cerrar (las que generan menor
# volumen de negocio) y el resto que se mantendran abiertas
offices_to_close <- volume_gs[1:3,]
offices_to_keep <- volume_gs[-(1:3),]

# Se obtienen todos los centroides de todas las oficinas para dibujarlos en el mapa
offices_to_close_cent <- gCentroid(offices_to_close, byid = TRUE)
offices_to_keep_cent <- gCentroid(offices_to_keep, byid = TRUE)

# Se dibuja el mapa y todas las oficinas por distrito remarcando las oficinas
# a cerrar
plot(volume_gs)
points(offices_to_keep_cent, cex = .5)
points(offices_to_close_cent, cex = 1, pch = 19)

## Obtencion y dibujado de las zonas de influencia de las oficinas a cerrar
i_data_gs_buffer <- gBuffer(spgeom = offices_to_close_cent, width = 7000)
plot(i_data_gs_buffer, add = T)
