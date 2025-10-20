from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('', views.home, name='home'),
    path('add_working_record/', views.add_working_record, name='add_working_record'),
    path('add_traveling_record/', views.add_traveling_record, name='add_traveling_record'),
    path('login_user/', views.login_user, name='login_user'),
    path('logout_user/', views.logout_user, name='logout_user'),
]
