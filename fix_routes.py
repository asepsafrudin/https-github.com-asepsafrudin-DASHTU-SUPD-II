import os
import glob

for filepath in glob.glob("api/routers/*.py"):
    with open(filepath, "r") as f:
        content = f.read()
    
    content = content.replace('@router.get("/")', '@router.get("")')
    content = content.replace('@router.post("/")', '@router.post("")')
    content = content.replace('@router.put("/")', '@router.put("")')
    content = content.replace('@router.delete("/")', '@router.delete("")')
    
    with open(filepath, "w") as f:
        f.write(content)

print("Routes fixed")
