from django.shortcuts import render
from django.http import HttpResponse

def experiment(request):
    return render(request, "main/experiment.html")
