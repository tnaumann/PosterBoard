from django.http import HttpResponse
from django.template import RequestContext, loader
import logging, string, os
from django_websocket import accept_websocket, require_websocket
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.core.context_processors import csrf

from PosterBoard.PosterBoardApp.models import Poster
from PosterBoard.PosterBoardApp.forms import PosterForm

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
    


def posterUpload(request):
    # Handle file upload
    c = {}
    c.update(csrf(request))
    if request.method == 'POST':
        
        form = PosterForm(request.POST, request.FILES)
        if form.is_valid():
            newPoster = Poster(posterFile1 = request.FILES['posterFile1'], event_date = form.cleaned_data['event_date'], start_time = form.cleaned_data['start_time'], end_time = form.cleaned_data['end_time'], tag1 = form.cleaned_data['tag1'], email = form.cleaned_data['email'], title = form.cleaned_data['title'])
            newPoster.save()
            print "Poster objects:", Poster.objects.count()
            # Redirect to the document list after POST
            return HttpResponseRedirect(reverse('PosterBoard.PosterBoardApp.views.posterUpload'))
    else:
        form = PosterForm() # A empty, unbound form

    # Load documents for the list page
    posters = Poster.objects.all()

    # Render list page with the documents and the form
    return render_to_response(
        'posterupload.html',
        {'posters': posters, 'form': form},
        context_instance = RequestContext(request)
   )

