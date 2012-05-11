from django.core import serializers
from django.http import HttpResponse
from django.template import RequestContext, loader
import logging, string, os
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.core.context_processors import csrf
import simplejson as json
import settings, math

from PosterBoard.PosterBoardApp.models import Poster, AnnotationPath, Annotation
from PosterBoard.PosterBoardApp.forms import PosterForm

from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt

def upload_page( request ):
  ctx = RequestContext( request, {
    'csrf_token': get_token( request ),
  } )
  return render_to_response( 'upload_page.html', ctx )

def save_upload( uploaded, filename, raw_data ):
  ''' 
  raw_data: if True, uploaded is an HttpRequest object with the file being
            the raw post data 
            if False, uploaded has been submitted via the basic form
            submission and is a regular Django UploadedFile in request.FILES
  '''
  filename = settings.SITE_ROOT + '/media/' + filename
  try:
    from io import FileIO, BufferedWriter
    with BufferedWriter( FileIO( filename, "wb" ) ) as dest:
      # if the "advanced" upload, read directly from the HTTP request 
      # with the Django 1.3 functionality
      if raw_data:
        foo = uploaded.read( 1024 )
        while foo:
          dest.write( foo )
          foo = uploaded.read( 1024 ) 
      # if not raw, it was a form upload so read in the normal Django chunks fashion
      else:
        for c in uploaded.chunks( ):
          dest.write( c )
      # got through saving the upload, report success
      return True
  except IOError:
    # could not open the file most likely
    pass
  return False

def ajax_upload( request ):
  print "test"
  if request.method == "POST":    
    if request.is_ajax( ):
      # the file is stored raw in the request
      upload = request
      is_raw = True
      # AJAX Upload will pass the filename in the querystring if it is the "advanced" ajax upload
      try:
        filename = request.GET[ 'qqfile' ]
      except KeyError: 
        return HttpResponseBadRequest( "AJAX request not valid" )
    # not an ajax upload, so it was the "basic" iframe version with submission via form
    else:
      is_raw = False
      if len( request.FILES ) == 1:
        # FILES is a dictionary in Django but Ajax Upload gives the uploaded file an
        # ID based on a random number, so it cannot be guessed here in the code.
        # Rather than editing Ajax Upload to pass the ID in the querystring,
        # observer that each upload is a separate request,
        # so FILES should only have one entry.
        # Thus, we can just grab the first (and only) value in the dict.
        upload = request.FILES.values( )[ 0 ]
      else:
        raise Http404( "Bad Upload" )
      filename = upload.name
     
    # save the file
    success = save_upload( upload, filename, is_raw )
 
    # let Ajax Upload know whether we saved it or not
    import json
    ret_json = { 'success': success, }
    return HttpResponse( json.dumps( ret_json ) )

logger = logging.getLogger(__name__)

def home(request):
    posters = Poster.objects.all()
    json_serializer = serializers.get_serializer("json")()
    serial = json_serializer.serialize(posters, ensure_ascii=False)
    return render_to_response(
        'index.html',
        {'posters': posters,
        'postersserial' : serial}, 
        context_instance = RequestContext(request)
   )

def rfidtest(request):
    t = loader.get_template('rfidtest.html')
        
    logger.debug('Jackpot!')
    
    c = RequestContext(request, {
        
        })
    return HttpResponse(t.render(c))

#@require_websocket
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

@csrf_exempt  
def saveAnno(request):
    path = json.loads(request.POST['path'])
    
    logger.debug('about to load annoId')
    annoId = request.POST['annoId']
    logger.debug('annoId: ' + annoId)
    
    if annoId:
        anno = Annotation.objects.get(pk=int(request.POST['annoId']))
        logger.debug('annotation found')
    else:
        poster = Poster.objects.get(pk=int(request.POST['poster']))
        anno = Annotation(poster=poster)        
        logger.debug('annotation created')
        anno.save()
        annoId = anno.id
        logger.debug('annotation saved')
        
    for pathItem in path:
        annoPath = AnnotationPath()
        annoPath.startX = pathItem['startX']
        annoPath.endX = pathItem['endX']
        annoPath.startY = pathItem['startY']
        annoPath.endY = pathItem['endY']
        annoPath.color = pathItem['color']
        annoPath.annotation = anno
        annoPath.index = 0
        annoPath.save()
        
    drawingId = request.POST['drawingId']
    returnVal = json.dumps({'drawingId':drawingId,'annoId':annoId})
    return HttpResponse(returnVal)

def getAnno(request):
    poster = Poster.objects.get(pk=int(request.GET['poster']))
    annos = Annotation.objects.filter(poster=poster).all()
    annoArr = []
    
    for anno in annos:
        paths = anno.path.all()
        pathArr = []
        
        for path in paths:
            pathArr.append(str(path.startX) + ',' + str(path.startY) + ',' + str(path.endX) + ',' + str(path.endY) + ',' + path.color)
        
        annoArr.append({'path':pathArr})
        
    return HttpResponse(json.dumps(annoArr))
    
def getLikes(request):
    poster = Poster.objects.get(pk=int(request.GET['poster']))
    returnVal = {'likes': poster.likes, 'dislikes': poster.dislikes}
    return HttpResponse(json.dumps(returnVal))

def updateLikes(request):
    poster = Poster.objects.get(pk=int(request.GET['poster']))
    
    likes = int(request.GET['likes'])
    dislikes = int(request.GET['dislikes'])
    
    if (math.fabs(poster.likes - likes) <= 1 and math.fabs(poster.dislikes - dislikes) <= 1):
        poster.likes = likes
        poster.dislikes = dislikes   
        poster.save()    
    
    return HttpResponse('success')
