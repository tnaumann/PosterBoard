from django.db import models

class Tag(models.Model):
    tagName = models.TextField(max_length=50)
    
class Poster(models.Model):
    eventDate = models.DateField()
    startTime = models.TimeField()
    endTime = models.TimeField()
    email = models.EmailField()
    dateAdded = models.DateTimeField()
    image = models.ImageField(upload_to='posterImages')
    tags = models.ManyToManyField(Tag)
    
class Annotate(models.Model):
    path = models.TextField(max_length=50)
    dateAdded = models.DateTimeField()
    posters = models.ForeignKey(Poster)