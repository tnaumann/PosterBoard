from django.http import HttpResponse
from django.template import RequestContext, loader
import logging, string, os

logger = logging.getLogger(__name__)

def home(request):
    t = loader.get_template('index.html')
        
    logger.debug('Jackpot!')
    
    c = RequestContext(request, {
        
        })
    return HttpResponse(t.render(c))
