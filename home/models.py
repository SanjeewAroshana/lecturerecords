from django.db import models

# Create your models here.
class LocalUser(models.Model):
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=100) # In a real application, use Django's built-in User model or hash passwords.
    role = models.CharField(max_length=100)

    def __str__(self):
        return self.username

class WorkingRecord(models.Model):
    user = models.ForeignKey(LocalUser, on_delete=models.CASCADE, null=True)
    date = models.DateField()
    month = models.CharField(max_length=20)
    lecturer_name = models.CharField(max_length=100)
    faculty_name = models.CharField(max_length=100)
    source_name = models.CharField(max_length=100)
    lesson_name = models.CharField(max_length=100)
    start_time = models.TimeField()
    end_time = models.TimeField()
    MODE_CHOICES = [
        ('Online', 'Online'),
        ('Physical', 'Physical'),
    ]
    mode = models.CharField(max_length=10, choices=MODE_CHOICES)

    def __str__(self):
        return f"{self.lecturer_name} - {self.lesson_name} on {self.date}"

class TravelingRecord(models.Model):
    user = models.ForeignKey(LocalUser, on_delete=models.CASCADE, null=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    purpose = models.CharField(max_length=200)
    confirmation_token = models.CharField(max_length=100)

    def __str__(self):
        return f"Travel on {self.date} for {self.purpose}"
