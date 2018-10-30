#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sun Oct 28 16:28:44 2018

@author: ivangarcia
"""

## Se importan las correspondientes librerías
import logging
import sys
import csv
import pandas as pd
import time

from configparser import ConfigParser
from pymongo import MongoClient
from twython import Twython, TwythonRateLimitError
from pandas import DataFrame, read_csv


## Se prepara el log
logging.basicConfig(filename='TwitterSNA.log',level=logging.DEBUG)
logging.info('INICIO')

## Se usa el fichero externo para obtener las claves, pedir el token de autorización 
## y dejar listo el objeto Twython “twitter”, que será el encargado de hacer las 
## llamadas a partir de este punto. 
config = ConfigParser()
config.read('twitter.cfg')
APP_KEY       = config.get('credentials','app_key')
APP_SECRET    = config['credentials']['app_secret']
twitter       = Twython(APP_KEY, APP_SECRET, oauth_version=2)
ACCESS_TOKEN  = twitter.obtain_access_token()
twitter       = Twython(APP_KEY, access_token=ACCESS_TOKEN)


## Se buscan, por ejemplo, mil tuits (de una base total de 4K es una cantidad 
## significativa). No se tiene todavía un id máximo. Se guarda una lista de id 
## porque, como se verá, las llamadas se hacen de cien en cien como máximo. 
## Al hacer diez llamadas o más, no es posible asegurar que no salgan tuits 
## repetidos que no se quieren conservar.
tweet_query_size = 1000
next_max_id     = -1
tweet_list_ids = []
first_time = True

## La función wait_for_awhile() se define así:
def wait_for_awhile():
    reset = int(twitter.get_lastfunction_header('x-rate-limit-reset'))
    wait = max(reset - time.time(), 0) + 10
    print(time.asctime())
    print("Rate limit exceeded waiting: %sm %0.0fs"%
            (int(int( wait)/60),wait % 60 ))
    time.sleep(wait)

## Se abre el fichero CSV para guardar los datos que se quiera del tuit que se saca.
with open('tweet_list.csv', 'w') as csvfile:
    writer = csv.writer(csvfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)


    ## Esta es la llamada a la API. Primero, una búsqueda inicial para asegurar 
    ## que se ponen los tuits más relevantes (según el algoritmo de Twitter, 
    ## y quince como mucho al no especificar un “count”). 
    result = twitter.search(q='#RedHat', result_type = 'popular')

    ## La respuesta (result) es un JSON. En el primer anexo se puede observar 
    ## su contenido y campos en detalle. Aquí se va a recorrer la parte de 
    ## ‘statuses’ al completo, comprobar si es un RT (porque, de serlo, tiene 
    ## una serie de campos adicionales con de quién es el RT) y se escribe en 
    ## el fichero CSV.
    for tw in result['statuses']:
        if tw['id'] not in tweet_list_ids:
            tweet_list_ids.append(tw['id'])
            retweet = False
            retweet_user = 'NA'
            mention = 'NA'
            if 'retweeted_status' in tw:
                retweet = True
                retweet_user = tw['retweeted_status']['user']['screen_name']
            if (len(tw['entities']['user_mentions']) == 0):
                writer.writerow([tw['user']['screen_name'], 
                                tw['user']['id'],
                                tw['user']['followers_count'],
                                tw['id'], tw['in_reply_to_screen_name'], 
                                retweet, 
                                retweet_user, 
                                'NA',
                                tw['text'].encode('utf-8').strip(), 
                                tw['created_at']])
            else:
                for mention in tw['entities']['user_mentions']:
                    writer.writerow([tw['user']['screen_name'], 
                                    tw['user']['id'], 
                                    tw['user']['followers_count'],
                                    tw['id'], 
                                    tw['in_reply_to_screen_name'],
                                    retweet,
                                    retweet_user,
                                    mention['screen_name'],
                                    tw['text'].encode('utf-8').strip(), 
                                    tw['created_at']])
    
    ## Se procede a sacar los más recientes una vez se tienen ya los más populares, 
    ## hasta llenar al menos la cifra propuesta al inicio.
    while (len(tweet_list_ids) < tweet_query_size):
        try:
            print("Tweets %s to %s: cursor: %s" %
                    (len(tweet_list_ids), len(tweet_list_ids) + 100, next_max_id))

            #if (len(tweet_list_ids) + 100 > tweet_query_size):
            #    result = twitter.search(q='#RedHat', count = tweet_query_size - len(tweet_list_ids), max_id=next_max_id)
            #else:
            result = twitter.search(q='#RedHat', count = 100, max_id=next_max_id)
            

            ## Aquí hay que notar, simplemente, el uso de “max_id” para asegurar 
            ## que en cada llamada se encuentran cien tuits más “antiguos” que 
            ## los anteriores. Se usa “count” para sacar el máximo posible (cien) 
            ## en vez de los quince por defecto. Y, sin parámetro “result_type”, 
            ## se obtienen los más recientes. El resto del código es paralelo a 
            ## la parte anterior.
            for tw in result['statuses']:
                if (first_time == True):
                    first_time = False
                    next_max_id = tw['id']
                if tw['id'] not in tweet_list_ids:
                    tweet_list_ids.append(tw['id'])
                    next_max_id = min(tw['id'], next_max_id)
                    retweet = False
                    retweet_user = 'NA'
                    mention = 'NA'
                    if 'retweeted_status' in tw:
                        retweet = True
                        retweet_user = tw['retweeted_status']['user']['screen_name']
                    if (len(tw['entities']['user_mentions']) == 0):
                        writer.writerow([tw['user']['screen_name'], tw['user']['id'],
                                        tw['user']['followers_count'], 
                                        tw['id'], 
                                        tw['in_reply_to_screen_name'], 
                                        retweet, 
                                        retweet_user, 
                                        'NA',
                                        tw['text'].encode('utf-8').strip(), 
                                        tw['created_at']])
                    else:
                        for mention in tw['entities']['user_mentions']:
                            writer.writerow([tw['user']['screen_name'], tw['user']['id'],
                                            tw['user']['followers_count'], 
                                            tw['id'], 
                                            tw['in_reply_to_screen_name'], 
                                            retweet, 
                                            retweet_user, 
                                            mention['screen_name'],
                                            tw['text'].encode('utf-8').strip(),
                                            tw['created_at']])

        ## Pero… ¿qué ocurre cuando se pasa del ritmo permitido por la API o 
        ## salta un error? Toca capturarlo.
        except TwythonRateLimitError as e:
            wait_for_awhile()
        except:
            print(" FAILED: Unexpected error:", sys.exc_info()[0])
            pass


## Se lee el CSV a un Pandas.
df = pd.read_csv('tweet_list.csv', header=None)


## Se inicia la base de datos, en este caso:
client      = MongoClient()
db = client.twitter_sna

for screen_name in set(df[0].tolist()):
    
    print("screen_name ", screen_name)

    
    ## Por defecto, se piden 5000 amigos, que es el máximo que soporta una llamada 
    ## a la API para la función GET/Friends/ids. Así, se está haciendo una hipótesis: 
    ## nadie tiene más de 5000 amigos o no importan los que hay más allá. 
    ## En este caso particular, tras obtener los resultados, no hay ninguna 
    ## cuenta que llegue a esos 5000, pero podría haber pasado (y sería una 
    ## restricción de la solución). Importante: esta llamada solo admite quince 
    ## llamadas cada quince minutos. Así, sacar 600 usuarios tendrá un coste de 
    ## diez horas de procesamiento. Por eso en el “for” anterior se hace “set” 
    ## de la lista, para evitar llamadas innecesarias. Aun así, va a tardar un buen rato.

    friends_query_size = 5000

    res = db.friends.find_one( {"screen_name": screen_name})
    if res is None:
        db.friends.insert_one( {"screen_name": screen_name, "ids": []} )

    next_cursor     = -1
    friends_ids    = list()
    ids_count       = 0
    n_friends       = 600


    ## Tras iniciar, se hace la llamada a la API con get_friends_ids().
    while (next_cursor != 0) and ( ids_count < n_friends):
        try:
            result = twitter.get_friends_ids(screen_name = screen_name,
                                            count = friends_query_size,
                                            cursor = next_cursor)

            friends_ids = friends_ids + result['ids']
            next_cursor = result['next_cursor']
            ids_count += len(result['ids'])
            friends_ids = list(set(friends_ids))
            friends_ids.sort()
            

            ## Se inserta la lista de id en la BB. DD.
            res = db.friends.update_one(
                    {"screen_name": screen_name},
                    { '$set': {"ids": friends_ids} }
                )

        except TwythonRateLimitError as e:    
            wait_for_awhile()
        except:
            print(" FAILED: Unexpected error:", sys.exc_info()[0])
            pass

import networkx as nx
G=nx.DiGraph()


## Primero se crean todos los nodos correspondientes a los usuarios de la lista 
## extraída. A la vez, se añade un atributo a los nodos, en este caso el número 
## de followers de la cuenta, para visualizar su relevancia más tarde.

G.add_nodes_from(df[0].tolist())
nx.set_node_attributes(G, 'followers', dict(zip(df[0].tolist(), df[2].tolist())))
print(len(G.nodes()))


## Se vinculan los nodos según menciones y RT.

for index, row in df.iterrows():
    node = row[0]
    if row[5]: # si es RT, se agrega un loop
        G.add_edge(node, node)
    else: #si no es RT, se ve si hay mención. Si la hay, se añade enlace por cada mención.
        if pd.notnull(row[7]):
            if (row[7] in df[0].tolist()): #solo si la mención es a un usuario del grupo de control.
                G.add_edge(node, row[7])



## Y, por último, se vinculan las relaciones de amistad. Nota: se puede hacer de forma más eficiente, pero aquí, en resumen, se comprueba qué amigos de la lista de amigos de cada usuario están entre el grupo de control.

for index, row in df.iterrows():
    friends = db.friends.find_one({"screen_name": row[0]})
        
    for u, v in df.iterrows():
        if v[1] in friends['ids']:
            G.add_edge(row[0], v[0])
            


## Se escribe el grafo en formato graphml para su posterior tratamiento en Gephi.

nx.write_graphml(G, "test.graphml")
