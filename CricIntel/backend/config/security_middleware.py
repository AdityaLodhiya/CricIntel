import logging
from django.http import JsonResponse
from django.core.cache import cache

logger = logging.getLogger(__name__)

class StrictAPIMiddleware:
    """
    Enforces security checks to prevent non-JS and malicious API hits.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith('/api/'):
            # 1. Block clients that don't send the expected SPA header.
            # This ensures requests originate from our frontend JS application,
            # mitigating attacks from users who disable JS or use simple curl scripts.
            client_header = request.headers.get('X-CricIntel-Client')
            if client_header != 'SPA' and request.method != 'OPTIONS': # Allow CORS preflight
                logger.warning(f"Blocked API request without valid client header from {self.get_client_ip(request)}")
                return JsonResponse({'detail': 'Forbidden. API access must originate from the verified application.'}, status=403)

            # 2. Global Rate Limiting / Flood protection (Block malicious IP hits)
            # This acts as a simple WAF to prevent DDoS or aggressive scanning.
            ip = self.get_client_ip(request)
            cache_key = f"global_rate_limit_{ip}"
            
            # Simple rate limit: max 200 requests per minute per IP for the whole API.
            requests_in_window = cache.get(cache_key, 0)
            if requests_in_window > 200:
                logger.warning(f"Blocked API request due to global rate limit from {ip}")
                return JsonResponse({'detail': 'Too many requests. Please try again later.'}, status=429)
            
            cache.set(cache_key, requests_in_window + 1, 60) # 60 seconds

        response = self.get_response(request)
        
        # 3. Add strict security headers to all responses
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['Content-Security-Policy'] = "default-src 'self'; script-src 'self'; object-src 'none';"
        response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'

        return response

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')
