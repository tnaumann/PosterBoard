from django import forms

class PosterForm(forms.Form):
    filename = forms.CharField(max_length=200)
    event_date = forms.DateTimeField()
    start_time = forms.TimeField()
    end_time = forms.TimeField()
    tag1 = forms.CharField(max_length=200)
    tag2 = forms.CharField(max_length=200, required=False)
    tag3 = forms.CharField(max_length=200, required=False)
    tag4 = forms.CharField(max_length=200, required=False)
    tag5 = forms.CharField(max_length=200, required=False)
    email = forms.EmailField(initial='')
    title = forms.CharField(max_length=200, required=False)
