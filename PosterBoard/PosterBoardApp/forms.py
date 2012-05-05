from django import forms

class PosterForm(forms.Form):
    posterFile1 = forms.FileField(
        label='Select poster file',
        help_text='max 2 MB'
    )
    event_date = forms.DateTimeField()
    start_time = forms.TimeField()
    end_time = forms.TimeField()
    tag1 = forms.CharField(max_length=200)
    email = forms.EmailField()
    title = forms.CharField(max_length=200)
