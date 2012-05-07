from django.conf.urls.defaults import patterns, url

urlpatterns = patterns('',
    url(r'^$', 'PosterBoard.PosterBoardApp.views.home', name='home'),
    url(r'^rfidtest', 'PosterBoard.PosterBoardApp.views.rfidtest'),
    url(r'^echo_once', 'PosterBoard.PosterBoardApp.views.echo_once'),
    url(r'^posterupload/$', 'PosterBoard.PosterBoardApp.views.posterUpload'),
    url(r'^saveAnno', 'PosterBoard.PosterBoardApp.views.saveAnno')
    url( r'^ajax_upload/$', 'PosterBoard.PosterBoardApp.views.ajax_upload', name="ajax_upload" ),
    url( r'^upload/$', 'PosterBoard.PosterBoardApp.views.upload_page', name="upload_page" ),
)
