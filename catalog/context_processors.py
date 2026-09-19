def miniapp(request):
    path = request.path
    if path.startswith("/companies"):
        tab = "companies"
    elif path.startswith("/market"):
        tab = "market"
    elif path.startswith("/services"):
        tab = "services"
    elif path.startswith("/profile") or path.startswith("/manage"):
        tab = "profile"
    elif path.startswith("/add"):
        tab = request.GET.get("kind") or "home"
        if tab == "market":
            tab = "market"
        elif tab == "company":
            tab = "companies"
        elif tab == "service":
            tab = "services"
        else:
            tab = "home"
    else:
        tab = "home"
    return {
        "resident": getattr(request, "resident", None),
        "theme": getattr(request, "theme", "light"),
        "tab": tab,
        "is_admin": getattr(request, "is_admin", False),
    }
