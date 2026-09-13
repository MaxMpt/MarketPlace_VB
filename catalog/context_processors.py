
def miniapp(request):
    path = request.path
    if path.startswith("/companies"):
        tab = "companies"
    elif path.startswith("/services"):
        tab = "services"
    elif path.startswith("/profile") or path.startswith("/add"):
        tab = "profile" if path.startswith("/profile") else "home"
    else:
        tab = "home"
    return {
        "resident": getattr(request, "resident", None),
        "theme": getattr(request, "theme", "light"),
        "tab": tab,
        "is_admin": getattr(request, "is_admin", False),
    }