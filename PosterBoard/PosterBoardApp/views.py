from django.http import HttpResponse
from django.template import RequestContext, loader
import logging, string, os
from django_websocket import accept_websocket, require_websocket

logger = logging.getLogger(__name__)

def home(request):
    t = loader.get_template('index.html')
        
    logger.debug('Jackpot!')
    
    c = RequestContext(request, {
        
        })
    return HttpResponse(t.render(c))
	
def rfidtest(request):
    t = loader.get_template('rfidtest.html')
        
    logger.debug('Jackpot!')
    
    c = RequestContext(request, {
        
        })
    return HttpResponse(t.render(c))

@require_websocket
def echo_once(request):
    logger.debug('echo_once received: ' + str(request.is_websocket()))
    message = request.websocket.wait()
    logger.debug('Message received: ' + message)
    request.websocket.send(message)
