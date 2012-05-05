from django.db import models

class Poster(models.Model):
    posterFile1 = models.FileField(upload_to = 'posters') #location where stored
    posterFile2 = models.FileField(upload_to = 'posters', null=True, blank=True) #location where to store scribbles
    posterFile3 = models.FileField(upload_to = 'posters', null=True, blank=True) #location of scribbles
    posterFile4 = models.FileField(upload_to = 'posters', null=True, blank=True) #location of scribbles
    event_date = models.DateTimeField('date of event')
    start_time = models.TimeField('start time for event')
    end_time = models.TimeField('end time for event')
    tag1 = models.CharField(max_length=200)
    tag2 = models.CharField(max_length=200, null=True, blank=True)
    tag3 = models.CharField(max_length=200, null=True, blank=True)
    tag4 = models.CharField(max_length=200, null=True, blank=True)
    tag5 = models.CharField(max_length=200, null=True, blank=True)
    email = models.EmailField(max_length=200)
    title = models.CharField(max_length=200, null=True, blank=True)
    annotate = models.TextField(null=True, blank=True)
    
class Annotation(models.Model):
    posterName = models.TextField(max_length=200)
    annotation = models.TextField()