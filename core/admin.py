from django.contrib import admin
from django.utils.safestring import mark_safe
from .models import PatientProfile, SchemeResult, MedicalReport, AIAnalysis, Subscription, HospitalStaff, ReportAccessLog, DoctorProfile

@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ['photo_preview', 'user', 'age', 'district', 'economic_status', 'disease_type', 'created_at']
    list_filter = ['district', 'economic_status', 'disease_type']
    search_fields = ['user__username', 'user__email', 'district']
    date_hierarchy = 'created_at'
    readonly_fields = ['photo_preview']
    fields = ['photo_preview', 'user', 'profile_photo', 'age', 'district', 'economic_status', 'has_ration_card', 'has_aadhaar', 'aadhaar_last4', 'disease_type', 'phone_number']

    def photo_preview(self, obj):
        if obj.profile_photo:
            return mark_safe(f'<img src="{obj.profile_photo.url}" width="150" height="150" style="border-radius: 12px; object-fit: cover; border: 2px solid #ccc;" />')
        return "No Photo"
    photo_preview.short_description = "Profile Photo Preview"

@admin.register(SchemeResult)
class SchemeResultAdmin(admin.ModelAdmin):
    list_display = ['patient', 'scheme_name', 'scheme_type', 'eligibility_score', 'created_at']
    list_filter = ['scheme_type', 'language_output']
    search_fields = ['patient__user__username', 'scheme_name']
    date_hierarchy = 'created_at'

@admin.register(MedicalReport)
class MedicalReportAdmin(admin.ModelAdmin):
    list_display = ['title', 'patient', 'scan_type', 'hospital_name', 'uploaded_date', 'is_analyzed']
    list_filter = ['scan_type', 'is_analyzed', 'uploaded_date']
    search_fields = ['title', 'patient__user__username', 'hospital_name']
    date_hierarchy = 'uploaded_date'

@admin.register(AIAnalysis)
class AIAnalysisAdmin(admin.ModelAdmin):
    list_display = ['report', 'risk_level', 'language', 'analyzed_at']
    list_filter = ['risk_level', 'language']
    search_fields = ['report__title', 'patient_summary']
    date_hierarchy = 'analyzed_at'

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_premium', 'status', 'start_date', 'end_date', 'amount_paid', 'ai_analysis_count']
    list_filter = ['is_premium', 'status']
    search_fields = ['user__username', 'user__email', 'payment_id']
    date_hierarchy = 'start_date'

@admin.register(HospitalStaff)
class HospitalStaffAdmin(admin.ModelAdmin):
    list_display = ['photo_preview', 'staff_name', 'hospital_name', 'license_number', 'is_verified', 'created_at']
    list_filter = ['is_verified', 'hospital_name']
    search_fields = ['staff_name', 'hospital_name', 'license_number']
    actions = ['verify_staff']
    readonly_fields = ['photo_preview']
    fields = ['photo_preview', 'staff_name', 'user', 'profile_photo', 'hospital_name', 'department', 'license_number', 'is_verified']

    def photo_preview(self, obj):
        if obj.profile_photo:
            return mark_safe(f'<img src="{obj.profile_photo.url}" width="150" height="150" style="border-radius: 12px; object-fit: cover; border: 2px solid #ccc;" />')
        return "No Photo"
    photo_preview.short_description = "Staff Photo Preview"
    
    def verify_staff(self, request, queryset):
        queryset.update(is_verified=True)
        self.message_user(request, "Selected staff verified successfully.")
    verify_staff.short_description = "Verify selected hospital staff"

@admin.register(ReportAccessLog)
class ReportAccessLogAdmin(admin.ModelAdmin):
    list_display = ['accessed_by_user', 'report', 'access_type', 'otp_verified', 'access_granted', 'accessed_at']
    list_filter = ['access_type', 'access_granted', 'otp_verified']
    search_fields = ['accessed_by_user__username', 'report__title']
    date_hierarchy = 'accessed_at'
    readonly_fields = ['accessed_at']


@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ['photo_preview', 'full_name', 'specialization', 'hospital_affiliation', 'district', 'license_number', 'is_verified', 'available', 'created_at']
    list_filter = ['is_verified', 'specialization', 'district', 'available']
    search_fields = ['full_name', 'license_number', 'hospital_affiliation', 'user__username']
    actions = ['approve_doctors', 'revoke_doctors']
    ordering = ['is_verified', '-created_at']
    readonly_fields = ['photo_preview']
    fields = ['photo_preview', 'full_name', 'user', 'profile_photo', 'specialization', 'license_number', 'hospital_affiliation', 'district', 'bio', 'experience_years', 'is_verified', 'available']

    def photo_preview(self, obj):
        if obj.profile_photo:
            return mark_safe(f'<img src="{obj.profile_photo.url}" width="150" height="150" style="border-radius: 12px; object-fit: cover; border: 2px solid #ccc;" />')
        return "No Photo"
    photo_preview.short_description = "Doctor Photo Preview"

    def approve_doctors(self, request, queryset):
        queryset.update(is_verified=True)
        self.message_user(request, f"{queryset.count()} doctor(s) approved successfully.")
    approve_doctors.short_description = "✅ Approve selected doctors"

    def revoke_doctors(self, request, queryset):
        queryset.update(is_verified=False)
        self.message_user(request, f"{queryset.count()} doctor(s) revoked.")
    revoke_doctors.short_description = "❌ Revoke doctor approval"
