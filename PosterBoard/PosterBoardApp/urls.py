from django.conf.urls.defaults import patterns, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'PosterBoard.PosterBoardApp.views.home', name='home'),
    url(r'^rfidtest', 'PosterBoard.PosterBoardApp.views.rfidtest'),
    url(r'^echo_once', 'PosterBoard.PosterBoardApp.views.echo_once'),
    url(r'^list/$', 'list'),
    url(r'^posterupload/$', 'posterUpload'),
    url(r'^upload/$', 'PosterBoard.PosterBoardApp.views.upload'),
)
