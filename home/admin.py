from django.contrib import admin
from .models import WorkingRecord, TravelingRecord, LocalUser

# Register your models here.
admin.site.register(WorkingRecord)
admin.site.register(TravelingRecord)
admin.site.register(LocalUser)
