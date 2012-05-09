from django.db import models
import logging, string, os

logger = logging.getLogger(__name__)

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
    likes = models.IntegerField(null=True, blank=True, default=0)
    dislikes = models.IntegerField(null=True, blank=True, default=0)


class Comment(models.Model):
    poster = models.ForeignKey(Poster)
    text = models.CharField(max_length=200)
    
class Annotation(models.Model):
    poster = models.ForeignKey(Poster, related_name='annotations')
    
class AnnotationPath(models.Model):
    startX = models.FloatField()
    startY = models.FloatField()
    endX = models.FloatField()
    endY = models.FloatField()
    color = models.TextField(max_length=7)
    index = models.IntegerField(default=0)
    annotation = models.ForeignKey(Annotation, related_name='path')
    
    def save(self, force_insert=False, force_update=False):
        logger.debug('overidden save called')
        # Only modify number if creating for the first time (is default 0)
        if self.index == 0:
            # Grab the highest current index (if it exists)
            try:
                recent = AnnotationPath.objects.filter(annotation=self.annotation).order_by('-index')[0]
                self.index = recent.index + 1
            except IndexError:
                self.index = 1
        # Call the "real" save() method
        super(AnnotationPath, self).save(force_insert, force_update)
