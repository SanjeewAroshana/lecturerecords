from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import WorkingRecord, TravelingRecord, LocalUser
from django.core import serializers
import json

def home(request):
    if not request.session.get('is_authenticated'):
        return redirect('login')

    user = LocalUser.objects.get(username=request.session.get('username'))
    print(f"Logged in user ID: {user.id}")
    working_records = WorkingRecord.objects.filter(user=user)
    print(f"Found {len(working_records)} working records for this user.")
    traveling_records = TravelingRecord.objects.filter(user=user)
    print(f"Found {len(traveling_records)} traveling records for this user.")
    working_records_json = serializers.serialize('json', working_records)
    traveling_records_json = serializers.serialize('json', traveling_records)
    
    user_data = {
        'id': user.id,
        'username': user.username,
        'role': user.role,
        'is_admin': user.role == 'admin',
        'full_name': user.username, # Assuming username is the full name for now
    }

    return render(request, 'index.html', {
        'working_records_json': working_records_json,
        'traveling_records_json': traveling_records_json,
        'user_data': json.dumps(user_data)
    })

def add_working_record(request):
    if request.method == 'POST' and request.session.get('is_authenticated'):
        data = json.loads(request.body)
        user = LocalUser.objects.get(username=request.session.get('username'))
        record = WorkingRecord.objects.create(
            user=user,
            date=data['date'],
            month=data['month'],
            lecturer_name=data['lecturerName'],
            faculty_name=data['facultyName'],
            source_name=data['sourceName'],
            lesson_name=data['lessonName'],
            start_time=data['startTime'],
            end_time=data['endTime'],
            mode=data['mode'],
        )
        return JsonResponse({'status': 'success', 'id': record.id})
    return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)

def add_traveling_record(request):
    if request.method == 'POST' and request.session.get('is_authenticated'):
        data = json.loads(request.body)
        user = LocalUser.objects.get(username=request.session.get('username'))
        record = TravelingRecord.objects.create(
            user=user,
            date=data['date'],
            start_time=data['startTime'],
            end_time=data['endTime'],
            purpose=data['purpose'],
            confirmation_token=data['confirmationToken'],
        )
        return JsonResponse({'status': 'success', 'id': record.id})
    return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)

def login_view(request):
    if request.session.get('is_authenticated'):
        return redirect('home')
    return render(request, 'login.html')

def login_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        try:
            user = LocalUser.objects.get(username=username, password=password)
            request.session['is_authenticated'] = True
            request.session['username'] = user.username
            request.session['role'] = user.role
            request.session['user_id'] = user.id
            return JsonResponse({'status': 'success', 'redirect_url': '/home/'})
        except LocalUser.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Invalid credentials'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

def logout_user(request):
    if request.method == 'POST':
        request.session.flush()
        return JsonResponse({'status': 'success', 'redirect_url': '/home/login/'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})
