import logging

class HeaderLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if 'upload' in request.path:
            print(f"DEBUG MIDDLEWARE: path={request.path}")
            print(f"DEBUG MIDDLEWARE HEADERS: {request.headers}")
        response = self.get_response(request)
        if 'upload' in request.path:
            print(f"DEBUG MIDDLEWARE RESPONSE STATUS: {response.status_code}")
            try:
                print(f"DEBUG MIDDLEWARE RESPONSE CONTENT: {response.content}")
            except Exception:
                pass
        return response
