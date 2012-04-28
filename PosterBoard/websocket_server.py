from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler

def websocket_app(environ, start_response):
    if environ["PATH_INFO"] == '/echo':
        ws = environ["wsgi.websocket"]
        message = ws.receive()
        ws.send("Dubi, " + message)
        
server = pywsgi.WSGIServer(("", 8001), websocket_app,
    handler_class=WebSocketHandler)
server.serve_forever()

